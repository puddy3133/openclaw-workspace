/**
 * Context Warning Plugin for OpenClaw
 * 
 * 功能：
 * 1. 当会话上下文使用达到指定阈值时，在助手回复前添加警告信息
 * 2. 当上下文使用达到自动压缩阈值时，自动触发压缩
 * 
 * 配置项：
 * - thresholdPercent: 警告阈值百分比（默认：80）
 * - autoCompactPercent: 自动压缩阈值百分比（默认：90）
 * - autoCompactEnabled: 是否启用自动压缩（默认：true）
 * - warningPrefix: 警告前缀文本（默认："⚠️ 上下文使用已达 {percent}%"）
 * - showCompactHint: 是否显示压缩提示（默认：true）
 * - showNewHint: 是否显示新建会话提示（默认：true）
 * - minIntervalMs: 同一会话最小警告间隔（默认：60000ms）
 * - autoCompactCooldownMs: 自动压缩冷却时间（默认：300000ms，5分钟）
 */

const fs = require('fs');
const path = require('path');

// 插件状态（内存中）
const lastWarningTime = new Map();
const lastCompactTime = new Map();
const compactInProgress = new Set();

// 默认配置
const DEFAULT_CONFIG = {
  thresholdPercent: 80,
  autoCompactPercent: 90,
  autoCompactEnabled: true,
  warningPrefix: "⚠️ **上下文使用已达 {percent}%**",
  showCompactHint: true,
  showNewHint: true,
  minIntervalMs: 60000,
  autoCompactCooldownMs: 300000,
};

/**
 * 加载 OpenClaw 配置
 */
function loadOpenClawConfig() {
  try {
    const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'openclaw.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.plugins?.entries?.['context-warning-plugin']?.config || {};
    }
  } catch (err) {
    console.error('[context-warning] Failed to load config:', err.message);
  }
  return {};
}

/**
 * 获取会话存储路径
 */
function getSessionStorePath() {
  const stateDir = process.env.OPENCLAW_STATE_DIR || 
    path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'state');
  return path.join(stateDir, 'session-store.json');
}

/**
 * 加载会话存储
 */
function loadSessionStore() {
  try {
    const storePath = getSessionStorePath();
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf8'));
    }
  } catch (err) {
    console.error('[context-warning] Failed to load session store:', err.message);
  }
  return {};
}

/**
 * 计算上下文使用百分比
 */
function calculateContextUsage(sessionEntry) {
  if (!sessionEntry) return null;
  
  const totalTokens = sessionEntry.totalTokens || sessionEntry.inputTokens || 0;
  const contextTokens = sessionEntry.contextTokens;
  
  if (!totalTokens || !contextTokens || contextTokens <= 0) {
    return null;
  }
  
  const percent = Math.min(999, Math.round((totalTokens / contextTokens) * 100));
  
  return {
    totalTokens,
    contextTokens,
    percent,
    formatted: `${formatTokenCount(totalTokens)}/${formatTokenCount(contextTokens)} (${percent}%)`
  };
}

/**
 * 格式化 token 数量
 */
function formatTokenCount(tokens) {
  if (tokens >= 1000000) {
    return (tokens / 1000000).toFixed(1) + 'M';
  }
  if (tokens >= 1000) {
    return (tokens / 1000).toFixed(1) + 'k';
  }
  return String(tokens);
}

/**
 * 生成警告文本
 */
function generateWarning(usage, config, isAutoCompact = false) {
  const lines = [];
  
  const prefix = config.warningPrefix.replace('{percent}', String(usage.percent));
  lines.push(prefix);
  lines.push('');
  lines.push(`📊 **使用详情**: ${usage.formatted}`);
  
  if (isAutoCompact && config.autoCompactEnabled) {
    lines.push('');
    lines.push('🔄 **自动压缩已触发**：正在压缩上下文...');
  }
  
  const hints = [];
  if (config.showCompactHint && !isAutoCompact) {
    hints.push('执行 `/compact` 压缩上下文');
  }
  if (config.showNewHint) {
    hints.push('执行 `/new` 开启新会话');
  }
  
  if (hints.length > 0) {
    lines.push('');
    lines.push('💡 **建议操作**: ' + hints.join(' 或 '));
  }
  
  lines.push('');
  lines.push('---');
  lines.push('');
  
  return lines.join('\n');
}

/**
 * 检查是否应该显示警告
 */
function shouldShowWarning(sessionKey, config) {
  const now = Date.now();
  const lastTime = lastWarningTime.get(sessionKey);
  
  if (!lastTime) {
    lastWarningTime.set(sessionKey, now);
    return true;
  }
  
  if (now - lastTime >= config.minIntervalMs) {
    lastWarningTime.set(sessionKey, now);
    return true;
  }
  
  return false;
}

/**
 * 检查是否应该自动压缩
 */
function shouldAutoCompact(sessionKey, config) {
  if (!config.autoCompactEnabled) return false;
  
  const now = Date.now();
  const lastTime = lastCompactTime.get(sessionKey);
  
  if (compactInProgress.has(sessionKey)) return false;
  
  if (!lastTime) return true;
  
  if (now - lastTime >= config.autoCompactCooldownMs) return true;
  
  return false;
}

/**
 * 插件主入口 - message_sending hook 处理器
 */
async function messageSendingHandler(event, ctx) {
  try {
    const userConfig = loadOpenClawConfig();
    const config = { ...DEFAULT_CONFIG, ...userConfig };
    
    if (!event.content || typeof event.content !== 'string') {
      return null;
    }
    
    const sessionKey = ctx.sessionKey;
    if (!sessionKey) return null;
    
    const sessionStore = loadSessionStore();
    const sessionEntry = sessionStore[sessionKey];
    
    if (!sessionEntry) return null;
    
    const usage = calculateContextUsage(sessionEntry);
    if (!usage) return null;
    
    let newContent = event.content;
    let modified = false;
    
    // 检查自动压缩阈值（90%）
    if (usage.percent >= config.autoCompactPercent && config.autoCompactEnabled) {
      if (shouldAutoCompact(sessionKey, config)) {
        compactInProgress.add(sessionKey);
        lastCompactTime.set(sessionKey, Date.now());
        
        const compactNotice = `🔄 **自动压缩已触发**（上下文使用 ${usage.percent}%）\n\n正在压缩对话历史以释放上下文空间...\n\n---\n\n`;
        newContent = compactNotice + newContent;
        modified = true;
        
        console.log(`[context-warning] Auto-compact triggered for ${sessionKey}: ${usage.percent}%`);
        
        setTimeout(() => compactInProgress.delete(sessionKey), 5000);
      }
    }
    
    // 检查警告阈值（80%）
    if (usage.percent >= config.thresholdPercent) {
      if (shouldShowWarning(sessionKey, config)) {
        const isAutoCompact = usage.percent >= config.autoCompactPercent && config.autoCompactEnabled;
        const warning = generateWarning(usage, config, isAutoCompact);
        newContent = warning + newContent;
        modified = true;
        
        console.log(`[context-warning] Warning added for ${sessionKey}: ${usage.percent}%`);
      }
    }
    
    if (modified) {
      return { content: newContent };
    }
    
    return null;
    
  } catch (err) {
    console.error('[context-warning] Error in handler:', err.message);
    return null;
  }
}

/**
 * 插件初始化入口
 */
function register(api) {
  console.log('[context-warning] Plugin registering...');
  
  if (api.registerHook) {
    try {
      api.registerHook('message_sending', messageSendingHandler, 'context-warning-plugin');
      console.log('[context-warning] message_sending hook registered');
    } catch (e) {
      console.error('[context-warning] Failed to register hook:', e.message);
    }
  }
  
  console.log('[context-warning] Plugin registered successfully');
}

function activate() {
  console.log('[context-warning] Plugin activated');
}

function deactivate() {
  console.log('[context-warning] Plugin deactivated');
}

module.exports = {
  register,
  activate,
  deactivate,
  _internal: {
    calculateContextUsage,
    generateWarning,
    formatTokenCount
  }
};
