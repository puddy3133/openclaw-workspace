/**
 * Heartbeat File-Driven Configuration Plugin
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const heartbeatState = {
  lastRunTime: 0,
  contentHistory: new Map(),
  isRunning: false,
  mainLaneLock: false
};

const DEFAULT_CONFIG = {
  heartbeatFile: 'HEARTBEAT.md',
  intervalSeconds: 300,
  activeHoursStart: 9,
  activeHoursEnd: 22,
  dedupWindowSeconds: 86400,
  timezone: 'Asia/Shanghai',
  okToken: 'HEARTBEAT_OK'
};

function loadConfig() {
  try {
    const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'openclaw.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return (
        config.plugins?.entries?.['heartbeat-file-plugin']?.config ||
        config.plugins?.entries?.['heartbeat-file']?.config ||
        {}
      );
    }
  } catch (err) {
    console.error('[heartbeat-file] Failed to load config:', err.message);
  }
  return {};
}

function getWorkspaceDir() {
  return process.env.OPENCLAW_WORKSPACE ||
    path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'workspace');
}

function loadHeartbeatFile(config) {
  const filePath = path.join(getWorkspaceDir(), config.heartbeatFile);
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8').trim();
    }
  } catch (err) {
    console.error('[heartbeat-file] Failed to read HEARTBEAT.md:', err.message);
  }
  return null;
}

function hasActionableContent(content) {
  if (!content) return false;
  const lines = content.split('\n');
  for (const line of lines) {
    const stripped = line.trim();
    if (!stripped) continue;
    if (/^#+(\s|$)/.test(stripped)) continue;
    if (/^\s*-\s*\[\s*\]/.test(stripped)) continue;
    return true;
  }
  return false;
}

function getCurrentHour(config) {
  const now = new Date();
  if (config.timezone) {
    const options = { timeZone: config.timezone, hour: 'numeric', hour12: false };
    const hourStr = now.toLocaleString('en-US', options);
    return parseInt(hourStr, 10);
  }
  return now.getHours();
}

function shouldRun(config) {
  const content = loadHeartbeatFile(config);
  if (!content) return [false, 'disabled (no HEARTBEAT.md)'];

  const now = Date.now();
  const intervalMs = config.intervalSeconds * 1000;
  if (now - heartbeatState.lastRunTime < intervalMs) {
    return [false, 'interval not elapsed'];
  }

  const currentHour = getCurrentHour(config);
  if (currentHour < config.activeHoursStart || currentHour >= config.activeHoursEnd) {
    return [false, `outside active hours (${currentHour}:00)`];
  }

  if (!hasActionableContent(content)) {
    return [false, 'HEARTBEAT.md has no actionable content'];
  }

  if (heartbeatState.mainLaneLock) {
    return [false, 'main lane busy'];
  }

  if (heartbeatState.isRunning) {
    return [false, 'heartbeat already running'];
  }

  return [true, 'ok'];
}

function computeContentHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}

function isDuplicate(content, config) {
  const hash = computeContentHash(content);
  const now = Date.now();

  for (const [h, ts] of heartbeatState.contentHistory.entries()) {
    if (now - ts > config.dedupWindowSeconds * 1000) {
      heartbeatState.contentHistory.delete(h);
    }
  }

  if (heartbeatState.contentHistory.has(hash)) {
    return true;
  }

  heartbeatState.contentHistory.set(hash, now);
  return false;
}

function processHeartbeatResponse(response, config) {
  if (!response || typeof response !== 'string') {
    return { shouldSend: false, content: '' };
  }

  const trimmed = response.trim();

  if (trimmed === config.okToken) {
    console.log('[heartbeat-file] HEARTBEAT_OK received, suppressing output');
    return { shouldSend: false, content: '' };
  }

  if (isDuplicate(trimmed, config)) {
    console.log('[heartbeat-file] Duplicate content detected, suppressing');
    return { shouldSend: false, content: '' };
  }

  return { shouldSend: true, content: trimmed };
}

async function beforeAgentStartHandler(event, ctx) {
  const config = { ...DEFAULT_CONFIG, ...loadConfig() };

  if (!event.isHeartbeat) {
    heartbeatState.mainLaneLock = true;
    return null;
  }

  const [run, reason] = shouldRun(config);
  if (!run) {
    console.log(`[heartbeat-file] Skipping heartbeat: ${reason}`);
    return null;
  }

  const content = loadHeartbeatFile(config);
  if (!content) return null;

  heartbeatState.isRunning = true;
  const prompt = `[系统提示] 这是心跳检查。请按照以下指令检查是否有需要汇报的事项：

${content}

重要：
- 如果没有任何事项需要汇报，请只回复：${config.okToken}
- 如果有事项需要汇报，请直接说明，不要以"我检查了..."开头`;

  return { prependContext: prompt };
}

async function agentEndHandler(event, ctx) {
  heartbeatState.mainLaneLock = false;
  heartbeatState.isRunning = false;
  heartbeatState.lastRunTime = Date.now();

  if (event.isHeartbeat && event.response) {
    const config = { ...DEFAULT_CONFIG, ...loadConfig() };
    processHeartbeatResponse(event.response, config);
  }

  return null;
}

function createExampleHeartbeatFile() {
  const workspaceDir = getWorkspaceDir();
  const filePath = path.join(workspaceDir, 'HEARTBEAT.md');

  if (fs.existsSync(filePath)) return false;

  const example = `# Heartbeat Instructions

Check the following items and report ONLY if something needs attention.

## Check Items

1. **Pending Reminders**: Are there any reminders set by the user that are now due?
2. **Daily Summary**: If it's after 6 PM and no daily summary was sent today, prepare a brief one.
3. **Follow-ups**: Are there any topics from recent conversations that deserve a follow-up?

## Response Rules

- If nothing needs attention, respond with exactly: HEARTBEAT_OK
- If something needs reporting, be concise and actionable.
- Never start with "I checked..." or "During my heartbeat..."
- Prioritize urgency: reminders > follow-ups > summaries.
`;

  try {
    fs.mkdirSync(workspaceDir, { recursive: true });
    fs.writeFileSync(filePath, example, 'utf8');
    console.log(`[heartbeat-file] Created example HEARTBEAT.md at ${filePath}`);
    return true;
  } catch (err) {
    console.error('[heartbeat-file] Failed to create example file:', err.message);
    return false;
  }
}

function register(api) {
  console.log('[heartbeat-file] Plugin registering...');

  if (api.registerHook) {
    try {
      api.registerHook('before_agent_start', beforeAgentStartHandler, { name: 'heartbeat-file-plugin' });
      console.log('[heartbeat-file] before_agent_start hook registered');
    } catch (e) {
      console.log('[heartbeat-file] before_agent_start hook not available');
    }

    try {
      api.registerHook('agent_end', agentEndHandler, { name: 'heartbeat-file-plugin' });
      console.log('[heartbeat-file] agent_end hook registered');
    } catch (e) {
      console.log('[heartbeat-file] agent_end hook not available');
    }
  }

  createExampleHeartbeatFile();
  console.log('[heartbeat-file] Plugin registered successfully');
}

function activate() {
  console.log('[heartbeat-file] Plugin activated');
}

function deactivate() {
  console.log('[heartbeat-file] Plugin deactivated');
}

module.exports = {
  register,
  activate,
  deactivate,
  _internal: {
    loadHeartbeatFile,
    hasActionableContent,
    shouldRun
  }
};
