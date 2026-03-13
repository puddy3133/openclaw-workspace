/**
 * Simple Cron Plugin for OpenClaw
 * 
 * 功能：
 * 1. 支持简化版 cron 类型：at（一次性）和 every（间隔）
 * 2. 文件驱动配置：CRON.json
 * 3. 自动容错：连续错误后自动禁用
 */

const fs = require('fs');
const path = require('path');

// 默认配置
const DEFAULT_CONFIG = {
  cronFile: 'CRON.json',
  checkIntervalSeconds: 60,
  maxRetries: 5,
  enableAutoDisable: true
};

// Cron 状态
const cronState = {
  jobs: new Map(),
  lastCheck: 0,
  timer: null,
  isRunning: false
};

/**
 * 加载配置
 */
function loadConfig() {
  try {
    const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'openclaw.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.plugins?.entries?.['simple-cron']?.config || {};
    }
  } catch (err) {
    console.error('[simple-cron] Failed to load config:', err.message);
  }
  return {};
}

/**
 * 获取工作区目录
 */
function getWorkspaceDir() {
  return process.env.OPENCLAW_WORKSPACE || 
    path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'workspace');
}

/**
 * 获取 CRON.json 路径
 */
function getCronFilePath(config) {
  return path.join(getWorkspaceDir(), config.cronFile);
}

/**
 * 加载 Cron 任务
 */
function loadCronJobs(config) {
  const filePath = getCronFilePath(config);
  
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      return data.jobs || [];
    }
  } catch (err) {
    console.error('[simple-cron] Failed to load CRON.json:', err.message);
  }
  
  return [];
}

/**
 * 保存 Cron 任务
 */
function saveCronJobs(jobs, config) {
  const filePath = getCronFilePath(config);
  
  try {
    const data = { jobs, updatedAt: new Date().toISOString() };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[simple-cron] Failed to save CRON.json:', err.message);
    return false;
  }
}

/**
 * 解析时间字符串
 * 支持：
 * - ISO 格式：2025-02-25T15:00:00
 * - 相对格式：+1h, +30m, +1d
 */
function parseTime(timeStr) {
  if (!timeStr) return null;
  
  // 相对时间格式
  const relativeMatch = timeStr.match(/^\+(\d+)([hmd])$/);
  if (relativeMatch) {
    const value = parseInt(relativeMatch[1], 10);
    const unit = relativeMatch[2];
    const now = Date.now();
    
    switch (unit) {
      case 'h': return now + value * 60 * 60 * 1000;
      case 'm': return now + value * 60 * 1000;
      case 'd': return now + value * 24 * 60 * 60 * 1000;
    }
  }
  
  // ISO 格式
  const date = new Date(timeStr);
  if (!isNaN(date.getTime())) {
    return date.getTime();
  }
  
  return null;
}

/**
 * 解析间隔字符串
 * 支持：1h, 30m, 1d
 */
function parseInterval(intervalStr) {
  if (!intervalStr) return null;
  
  const match = intervalStr.match(/^(\d+)([hmd])$/);
  if (!match) return null;
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 'h': return value * 60 * 60 * 1000;
    case 'm': return value * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
  }
  
  return null;
}

/**
 * 计算下次运行时间
 */
function computeNextRun(job) {
  const now = Date.now();
  const schedule = job.schedule;
  
  if (!schedule) return null;
  
  switch (schedule.kind) {
    case 'at': {
      // 一次性任务
      const atTime = parseTime(schedule.at);
      if (!atTime || atTime <= now) return null;
      return atTime;
    }
    
    case 'every': {
      // 间隔任务
      const interval = parseInterval(schedule.every);
      if (!interval) return null;
      
      // 使用锚点计算，防止漂移
      const anchor = schedule.anchor ? parseTime(schedule.anchor) : job.createdAt || now;
      const elapsed = now - anchor;
      const nextOffset = Math.ceil(elapsed / interval) * interval;
      return anchor + nextOffset;
    }
    
    default:
      return null;
  }
}

/**
 * 执行任务
 */
async function executeJob(job, config) {
  console.log(`[simple-cron] Executing job: ${job.name || job.id}`);
  
  try {
    // 更新任务状态
    job.lastRun = Date.now();
    job.runCount = (job.runCount || 0) + 1;
    job.errorCount = 0;
    
    // 一次性任务自动禁用
    if (job.schedule?.kind === 'at' || job.deleteAfterRun) {
      job.enabled = false;
      console.log(`[simple-cron] Job ${job.id} disabled after execution`);
    }
    
    return { success: true };
  } catch (err) {
    console.error(`[simple-cron] Job ${job.id} failed:`, err.message);
    
    job.errorCount = (job.errorCount || 0) + 1;
    
    // 自动禁用
    if (config.enableAutoDisable && job.errorCount >= config.maxRetries) {
      job.enabled = false;
      console.log(`[simple-cron] Job ${job.id} auto-disabled after ${config.maxRetries} errors`);
    }
    
    return { success: false, error: err.message };
  }
}

/**
 * 检查并执行任务
 */
async function checkAndExecute(config) {
  if (cronState.isRunning) return;
  
  cronState.isRunning = true;
  
  try {
    const jobs = loadCronJobs(config);
    const now = Date.now();
    let hasChanges = false;
    
    for (const job of jobs) {
      if (!job.enabled) continue;
      
      const nextRun = computeNextRun(job);
      
      if (nextRun && nextRun <= now) {
        await executeJob(job, config);
        hasChanges = true;
      }
    }
    
    // 保存更新后的任务状态
    if (hasChanges) {
      saveCronJobs(jobs, config);
    }
    
    cronState.lastCheck = now;
  } finally {
    cronState.isRunning = false;
  }
}

/**
 * 启动 Cron 服务
 */
function startCronService(config) {
  if (cronState.timer) {
    clearInterval(cronState.timer);
  }
  
  const intervalMs = config.checkIntervalSeconds * 1000;
  
  cronState.timer = setInterval(() => {
    checkAndExecute(config).catch(err => {
      console.error('[simple-cron] Error in cron service:', err.message);
    });
  }, intervalMs);
  
  console.log(`[simple-cron] Cron service started (check interval: ${config.checkIntervalSeconds}s)`);
}

/**
 * 停止 Cron 服务
 */
function stopCronService() {
  if (cronState.timer) {
    clearInterval(cronState.timer);
    cronState.timer = null;
    console.log('[simple-cron] Cron service stopped');
  }
}

/**
 * 创建示例 CRON.json
 */
function createExampleCronFile() {
  const config = { ...DEFAULT_CONFIG, ...loadConfig() };
  const filePath = getCronFilePath(config);
  
  if (fs.existsSync(filePath)) {
    return false;
  }
  
  const example = {
    jobs: [
      {
        id: 'daily-summary',
        name: 'Daily Summary',
        schedule: {
          kind: 'every',
          every: '1d',
          anchor: new Date().toISOString()
        },
        payload: {
          message: 'Please provide a daily summary of activities.'
        },
        enabled: false
      }
    ],
    updatedAt: new Date().toISOString()
  };
  
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(example, null, 2), 'utf8');
    console.log(`[simple-cron] Created example CRON.json at ${filePath}`);
    return true;
  } catch (err) {
    console.error('[simple-cron] Failed to create example file:', err.message);
    return false;
  }
}

/**
 * 插件注册
 */
function register(api) {
  console.log('[simple-cron] Plugin registering...');
  
  const config = { ...DEFAULT_CONFIG, ...loadConfig() };
  
  // 启动 Cron 服务
  startCronService(config);
  
  // 创建示例文件
  createExampleCronFile();
  
  console.log('[simple-cron] Plugin registered successfully');
}

function activate() {
  console.log('[simple-cron] Plugin activated');
  const config = { ...DEFAULT_CONFIG, ...loadConfig() };
  startCronService(config);
}

function deactivate() {
  console.log('[simple-cron] Plugin deactivated');
  stopCronService();
}

// 导出
module.exports = {
  register,
  activate,
  deactivate,
  computeNextRun,
  _internal: {
    parseTime,
    parseInterval,
    loadCronJobs,
    saveCronJobs
  }
};
