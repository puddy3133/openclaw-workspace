/**
 * Simple Cron Plugin for OpenClaw — v2 (Robust Engine)
 *
 * 功能：
 * 1. 启动时自动检测并补跑遗漏任务（missed-job recovery）
 * 2. JobQueue：多个待执行任务按先后顺序排队，逐个执行
 * 3. 主线程协商：主线程忙时将任务加入队列等待
 * 4. 实际执行 payload.command（spawn）或 payload.message（写入心跳）
 * 5. 执行结果**只推飞书**，不影响 TUI/Web，不污染主对话上下文
 * 6. 结果报告保存到 memory/cron-reports/{job-id}-{date}.md
 * 7. 支持标准 cron 表达式（kind: "cron"）+ 自定义 every/at
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// ─── 常量 ─────────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  cronFile: 'CRON.json',
  checkIntervalSeconds: 60,
  maxRetries: 5,
  enableAutoDisable: true,
  feishuNotify: true,          // 定时任务结果推送飞书
  mainThreadWaitMs: 5000,          // 主线程忙时等待5秒后重新评估
  maxQueueSize: 20,            // 最大积压任务数
};

// ─── 全局状态 ──────────────────────────────────────────────────────────────────

const state = {
  queue: [],       // JobQueue：等待执行的任务
  isRunning: false,    // 当前是否有任务在执行
  mainLaneLock: false,    // 主线程是否繁忙（由心跳插件共享）
  timer: null,
  pluginApi: null,     // OpenClaw plugin API 引用
};

// ─── 工具函数 ──────────────────────────────────────────────────────────────────

function loadConfig() {
  try {
    const configPath = path.join(
      process.env.HOME || process.env.USERPROFILE,
      '.openclaw', 'openclaw.json'
    );
    if (fs.existsSync(configPath)) {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return (
        cfg.plugins?.entries?.['simple-cron-plugin']?.config ||
        cfg.plugins?.entries?.['simple-cron']?.config ||
        {}
      );
    }
  } catch (e) {
    console.error('[simple-cron] Failed to load config:', e.message);
  }
  return {};
}

function getWorkspaceDir() {
  return (
    process.env.OPENCLAW_WORKSPACE ||
    path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'workspace')
  );
}

function getCronFilePath(config) {
  return path.join(getWorkspaceDir(), config.cronFile);
}

function loadCronJobs(config) {
  const fp = getCronFilePath(config);
  try {
    if (fs.existsSync(fp)) {
      const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
      return data.jobs || [];
    }
  } catch (e) {
    console.error('[simple-cron] Failed to load CRON.json:', e.message);
  }
  return [];
}

function saveCronJobs(jobs, config) {
  const fp = getCronFilePath(config);
  try {
    fs.writeFileSync(fp, JSON.stringify({ jobs, updatedAt: new Date().toISOString() }, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('[simple-cron] Failed to save CRON.json:', e.message);
    return false;
  }
}

// ─── 时间计算 ──────────────────────────────────────────────────────────────────

function parseInterval(s) {
  if (!s) return null;
  const m = s.match(/^(\d+)([hmd])$/);
  if (!m) return null;
  const v = parseInt(m[1], 10);
  return { h: v * 3600000, m: v * 60000, d: v * 86400000 }[m[2]];
}

function parseCronExpression(cronStr, timezone) {
  // 简单的 cron 解析器，支持 "分 时 日 月 周" 格式
  // 只计算下一次触发时间（相对于当前时间）
  try {
    const parts = cronStr.trim().split(/\s+/);
    if (parts.length !== 5) return null;
    const [min, hour] = parts;

    const now = new Date();
    const tz = timezone || 'Asia/Shanghai';
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric', minute: 'numeric', hour12: false,
      year: 'numeric', month: 'numeric', day: 'numeric',
      weekday: 'short'
    });
    const parts2 = formatter.formatToParts(now);
    const get = (type) => parseInt(parts2.find(p => p.type === type)?.value || '0', 10);

    const currentMin = get('minute');
    const currentHour = get('hour');

    const targetMin = min === '*' ? currentMin : parseInt(min, 10);
    const targetHour = hour === '*' ? currentHour : parseInt(hour, 10);

    // 计算今天的 target 时间（UTC）
    const todayTarget = new Date();
    todayTarget.setUTCHours(0, 0, 0, 0);
    // 按时区偏移
    const offset = -new Date().toLocaleString('en-US', { timeZone: tz, timeZoneName: 'short' })
      .split(' ').pop().replace('GMT', '') * 0 || 0; // fallback
    const targetMs = todayTarget.getTime() + (targetHour * 3600 + targetMin * 60) * 1000;
    if (targetMs > Date.now()) return targetMs;
    return targetMs + 86400000; // 明天此时
  } catch (e) {
    return null;
  }
}

function computeNextRun(job) {
  const now = Date.now();
  const s = job.schedule;
  if (!s) return null;

  switch (s.kind) {
    case 'at': {
      const t = new Date(s.at).getTime();
      return t > now ? t : null;
    }
    case 'every': {
      const interval = parseInterval(s.every);
      if (!interval) return null;
      const anchor = s.anchor ? new Date(s.anchor).getTime() : (job.createdAt ? new Date(job.createdAt).getTime() : now);
      const elapsed = now - anchor;
      const nextOff = Math.ceil(elapsed / interval) * interval;
      return anchor + nextOff;
    }
    case 'cron': {
      return parseCronExpression(s.cron, s.timezone);
    }
    default:
      return null;
  }
}

// ─── 错过检测（Missed Job Recovery）────────────────────────────────────────────

/**
 * 启动时扫描所有任务，找出 lastRun 距今超过 1 个 interval 的任务
 * 将它们标记为 reason:'missed' 放入补跑队列
 */
function detectMissedJobs(jobs, config) {
  const now = Date.now();
  const missed = [];

  for (const job of jobs) {
    if (!job.enabled) continue;
    if (!job.lastRun) continue; // 从未运行，不算漏跑

    const interval = parseInterval(job.schedule?.every);
    if (!interval) continue; // 非 every 类型，cron 类型暂不补跑

    const expectedNext = job.lastRun + interval;
    if (expectedNext < now - 30000) { // 超过30秒没运行 = 漏跑
      console.log(`[simple-cron] Missed job detected: ${job.id} (should have run at ${new Date(expectedNext).toISOString()})`);
      missed.push({ ...job, _reason: 'missed', _shouldHaveRunAt: expectedNext });
    }
  }

  return missed;
}

// ─── 飞书推送 ──────────────────────────────────────────────────────────────────

async function notifyFeishu(api, job, result) {
  const icon = result.success ? '✅' : '❌';
  const elapsed = result.elapsedMs ? ` (耗时 ${(result.elapsedMs / 1000).toFixed(1)}s)` : '';
  const reason = job._reason === 'missed' ? ' [补跑]' : '';
  const msg = [
    `${icon} **定时任务${reason}**：${job.name || job.id}${elapsed}`,
    result.output ? `\`\`\`\n${result.output.slice(0, 500)}\n\`\`\`` : '',
    result.error ? `错误：${result.error.slice(0, 300)}` : ''
  ].filter(Boolean).join('\n');

  // 保存报告到 memory/cron-reports/
  const reportDir = path.join(getWorkspaceDir(), 'memory', 'cron-reports');
  fs.mkdirSync(reportDir, { recursive: true });
  const dateStr = new Date().toISOString().slice(0, 10);
  const reportFile = path.join(reportDir, `${job.id}-${dateStr}.md`);
  const report = `# Cron Report: ${job.name || job.id}\n\n- 执行时间：${new Date().toISOString()}\n- 状态：${result.success ? '成功' : '失败'}\n- 耗时：${result.elapsedMs ? (result.elapsedMs / 1000).toFixed(1) + 's' : 'N/A'}\n${result.output ? `\n## 输出\n\`\`\`\n${result.output}\n\`\`\`` : ''}\n${result.error ? `\n## 错误\n${result.error}` : ''}\n`;
  fs.appendFileSync(reportFile, report + '\n---\n');

  // 通过 plugin API 发送飞书消息（isolated，不进入主会话）
  try {
    if (api && api.sendMessage) {
      await api.sendMessage({
        channel: 'feishu',
        content: msg,
        isolated: true   // 不插入主会话上下文
      });
    } else {
      // 降级：写入 HEARTBEAT.md 触发下次心跳时汇报
      const hbFile = path.join(getWorkspaceDir(), 'HEARTBEAT.md');
      const notice = `\n\n## 定时任务通知（待汇报）\n${msg}\n`;
      fs.appendFileSync(hbFile, notice);
    }
  } catch (e) {
    console.error('[simple-cron] Failed to send Feishu notification:', e.message);
  }
}

// ─── 任务执行 ──────────────────────────────────────────────────────────────────

async function executeJobIsolated(job, config, api) {
  const startMs = Date.now();
  const result = { success: false, output: '', error: '', elapsedMs: 0 };

  console.log(`[simple-cron] Executing job: ${job.name || job.id}${job._reason === 'missed' ? ' [missed-recovery]' : ''}`);

  try {
    if (job.payload?.command) {
      // 执行 shell 命令（隔离子进程）
      const out = execSync(job.payload.command, {
        cwd: getWorkspaceDir(),
        timeout: 5 * 60 * 1000, // 最长5分钟
        encoding: 'utf8',
        stdio: 'pipe',
        env: { ...process.env }
      });
      result.output = out || '(no output)';
      result.success = true;
    } else if (job.payload?.message) {
      // message 类型：通过心跳或 API 触发 Agent
      const msg = job.payload.message;
      if (api && api.triggerMessage) {
        await api.triggerMessage({ content: msg, isolated: true });
        result.output = `Triggered: ${msg.slice(0, 100)}`;
        result.success = true;
      } else {
        // 降级：写入待处理队列文件
        const queueFile = path.join(getWorkspaceDir(), 'memory', 'cron-reports', '_pending.md');
        fs.appendFileSync(queueFile, `\n- [${new Date().toISOString()}] ${msg}`);
        result.output = `Queued message: ${msg.slice(0, 100)}`;
        result.success = true;
      }
    } else {
      result.output = 'No payload defined';
      result.success = true; // 空任务视为成功
    }
  } catch (e) {
    result.error = e.message || String(e);
    result.success = false;
    console.error(`[simple-cron] Job ${job.id} failed:`, e.message);
  }

  result.elapsedMs = Date.now() - startMs;

  // 更新任务状态
  job.lastRun = Date.now();
  job.runCount = (job.runCount || 0) + 1;
  job.errorCount = result.success ? 0 : (job.errorCount || 0) + 1;

  // 一次性任务自动禁用
  if (job.schedule?.kind === 'at' || job.deleteAfterRun) {
    job.enabled = false;
  }

  // 连续失败自动禁用
  if (config.enableAutoDisable && job.errorCount >= config.maxRetries) {
    job.enabled = false;
    console.log(`[simple-cron] Job ${job.id} auto-disabled after ${config.maxRetries} errors`);
  }

  // 发飞书通知（在后台执行，不阻塞队列）
  if (config.feishuNotify) {
    notifyFeishu(api, job, result).catch(e =>
      console.error('[simple-cron] Feishu notify failed:', e.message)
    );
  }

  return result;
}

// ─── 任务队列引擎（JobQueue）───────────────────────────────────────────────────

async function drainQueue(config, api) {
  if (state.isRunning) return;
  if (state.queue.length === 0) return;

  state.isRunning = true;

  try {
    while (state.queue.length > 0) {
      // 主线程忙时等待
      if (state.mainLaneLock) {
        console.log('[simple-cron] Main thread busy, waiting...');
        await new Promise(r => setTimeout(r, config.mainThreadWaitMs));
        continue;
      }

      const job = state.queue.shift();
      await executeJobIsolated(job, config, api);

      // 礼让间隔（避免连续任务争抢资源）
      if (state.queue.length > 0) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  } finally {
    state.isRunning = false;
  }
}

function enqueue(job, config) {
  if (state.queue.length >= config.maxQueueSize) {
    console.warn(`[simple-cron] Queue full (max ${config.maxQueueSize}), dropping job: ${job.id}`);
    return false;
  }
  // 去重：同一个 job 不重复入队
  if (state.queue.some(j => j.id === job.id && j._reason === job._reason)) {
    return false;
  }
  state.queue.push(job);
  console.log(`[simple-cron] Enqueued job: ${job.id} (queue size: ${state.queue.length})`);
  return true;
}

// ─── 定时检查 ──────────────────────────────────────────────────────────────────

async function checkAndSchedule(config, api) {
  const jobs = loadCronJobs(config);
  const now = Date.now();
  let hasChanges = false;

  for (const job of jobs) {
    if (!job.enabled) continue;

    const nextRun = computeNextRun(job);
    if (nextRun && nextRun <= now) {
      if (enqueue({ ...job }, config)) {
        hasChanges = true;
      }
    }
  }

  if (hasChanges) {
    saveCronJobs(jobs, config);
  }

  // 异步排队执行，不阻塞当前 tick
  if (state.queue.length > 0 && !state.isRunning) {
    setImmediate(() => drainQueue(config, api));
  }
}

// ─── 启动时补跑（Missed Job Recovery）────────────────────────────────────────────

function recoverMissedJobs(config, api) {
  const jobs = loadCronJobs(config);
  const missed = detectMissedJobs(jobs, config);

  if (missed.length > 0) {
    console.log(`[simple-cron] Recovering ${missed.length} missed job(s)...`);
    for (const job of missed) {
      enqueue(job, config);
    }
    // 延迟3秒后开始执行（等待主系统初始化完成）
    setTimeout(() => drainQueue(config, api), 3000);
  }
}

// ─── 启动/停止服务 ──────────────────────────────────────────────────────────────

function startCronService(config, api) {
  if (state.timer) clearInterval(state.timer);

  // 首次立即检查（捕捉启动瞬间到期的任务）
  setTimeout(() => checkAndSchedule(config, api), 5000);

  state.timer = setInterval(() => {
    checkAndSchedule(config, api).catch(e =>
      console.error('[simple-cron] Error in cron check:', e.message)
    );
  }, config.checkIntervalSeconds * 1000);

  console.log(`[simple-cron] Cron service started (interval: ${config.checkIntervalSeconds}s)`);
}

function stopCronService() {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
    console.log('[simple-cron] Cron service stopped');
  }
}

// ─── 主线程状态同步（供 heartbeat-file-plugin 共享使用）────────────────────────

function setMainLaneLock(locked) {
  state.mainLaneLock = locked;
}

// ─── Plugin 注册 ────────────────────────────────────────────────────────────────

function register(api) {
  console.log('[simple-cron] Plugin registering...');
  state.pluginApi = api;

  const config = { ...DEFAULT_CONFIG, ...loadConfig() };

  // 注册钩子：感知主线程状态
  if (api && api.registerHook) {
    try {
      function simpleCronBeforeAgentStart(event) {
        if (!event.isHeartbeat) setMainLaneLock(true);
        return null;
      }
      api.registerHook('before_agent_start', simpleCronBeforeAgentStart, { name: 'simple-cron-plugin' });
    } catch (e) { /* hook not available */ }

    try {
      function simpleCronAgentEnd() {
        setMainLaneLock(false);
        // 主线程结束后，如果队列有积压，立即开始执行
        if (state.queue.length > 0 && !state.isRunning) {
          setTimeout(() => drainQueue(config, api), 1000);
        }
        return null;
      }
      api.registerHook('agent_end', simpleCronAgentEnd, { name: 'simple-cron-plugin' });
    } catch (e) { /* hook not available */ }
  }

  // 补跑遗漏任务
  recoverMissedJobs(config, api);

  // 启动定时检查
  startCronService(config, api);

  console.log('[simple-cron] Plugin registered successfully');
}

function activate() { const cfg = { ...DEFAULT_CONFIG, ...loadConfig() }; startCronService(cfg, state.pluginApi); }
function deactivate() { stopCronService(); }

module.exports = {
  register,
  activate,
  deactivate,
  setMainLaneLock,   // 供其他插件调用
  _internal: {
    computeNextRun,
    detectMissedJobs,
    loadCronJobs,
    saveCronJobs,
    enqueue,
    drainQueue
  }
};
