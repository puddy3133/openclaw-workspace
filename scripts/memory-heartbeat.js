#!/usr/bin/env node
/**
 * Memory Heartbeat 补录脚本
 * 
 * 功能：
 * 1. 扫描活跃 Session
 * 2. 清洗消息（过滤 Tool Calling、System、Metadata）
 * 3. 提取关键信息（决策、教训、承诺、待办）
 * 4. 自动补录到每日日志
 * 
 * 用法：node memory-heartbeat.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  workspaceDir: process.env.OPENCLAW_WORKSPACE || path.join(process.env.HOME, '.openclaw', 'workspace'),
  sessionsDir: path.join(process.env.HOME, '.openclaw', 'agent_sessions'),
  timezone: 'Asia/Shanghai',
  minEntriesThreshold: 2, // 最少条目数（启动 + 任务）
};

// 获取当前日期（北京时间）
function getToday() {
  const now = new Date();
  const options = { timeZone: CONFIG.timezone, year: 'numeric', month: '2-digit', day: '2-digit' };
  return now.toLocaleString('zh-CN', options).replace(/\//g, '-');
}

// 读取今日日志
function readTodayLog() {
  const logPath = path.join(CONFIG.workspaceDir, 'memory', `${getToday()}.md`);
  if (fs.existsSync(logPath)) {
    return fs.readFileSync(logPath, 'utf8');
  }
  return null;
}

// 检查日志条目数
function countLogEntries(logContent) {
  if (!logContent) return 0;
  // 统计以 ### 开头的会话记录
  const matches = logContent.match(/^### /gm);
  return matches ? matches.length : 0;
}

// 扫描活跃 Session
function scanActiveSessions() {
  const sessions = [];
  
  if (!fs.existsSync(CONFIG.sessionsDir)) {
    return sessions;
  }
  
  const dirs = fs.readdirSync(CONFIG.sessionsDir).filter(d => {
    const stat = fs.statSync(path.join(CONFIG.sessionsDir, d));
    return stat.isDirectory() && d.startsWith('session-');
  });
  
  for (const dir of dirs) {
    const messagesPath = path.join(CONFIG.sessionsDir, dir, 'messages.json');
    if (fs.existsSync(messagesPath)) {
      try {
        const content = fs.readFileSync(messagesPath, 'utf8');
        const messages = JSON.parse(content);
        sessions.push({
          sessionId: dir,
          messages: messages,
          messageCount: messages.length
        });
      } catch (e) {
        // 忽略解析错误
      }
    }
  }
  
  return sessions;
}

// 清洗消息
function cleanMessages(messages) {
  return messages.filter(msg => {
    // 过滤 System 消息
    if (msg.role === 'system') return false;
    // 过滤 Tool Calling
    if (msg.tool_calls || msg.toolInvocations) return false;
    // 过滤空消息
    if (!msg.content || msg.content.trim() === '') return false;
    // 过滤过短的消息（可能是确认类）
    if (msg.content.length < 10) return false;
    return true;
  }).map(msg => ({
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp || new Date().toISOString()
  }));
}

// 提取关键信息
function extractKeyInfo(messages) {
  const keyInfo = {
    decisions: [],
    lessons: [],
    promises: [],
    todos: []
  };
  
  for (const msg of messages) {
    const content = msg.content.toLowerCase();
    
    // 提取决策
    if (content.includes('决定') || content.includes('方案') || content.includes('选择')) {
      keyInfo.decisions.push(msg.content.slice(0, 200));
    }
    
    // 提取教训
    if (content.includes('教训') || content.includes('踩坑') || content.includes('避免')) {
      keyInfo.lessons.push(msg.content.slice(0, 200));
    }
    
    // 提取承诺
    if (content.includes('现在就做') || content.includes('立即执行') || content.includes('马上')) {
      keyInfo.promises.push(msg.content.slice(0, 200));
    }
    
    // 提取待办
    const todoMatch = msg.content.match(/- \[ \] (.+)/g);
    if (todoMatch) {
      keyInfo.todos.push(...todoMatch.map(t => t.replace('- [ ] ', '')));
    }
  }
  
  return keyInfo;
}

// 格式化补录内容
function formatSupplement(keyInfo) {
  const lines = ['【心跳补录】'];
  
  if (keyInfo.decisions.length > 0) {
    lines.push('**决策**：');
    keyInfo.decisions.forEach(d => lines.push(`- ${d.slice(0, 100)}`));
  }
  
  if (keyInfo.lessons.length > 0) {
    lines.push('**教训**：');
    keyInfo.lessons.forEach(l => lines.push(`- ${l.slice(0, 100)}`));
  }
  
  if (keyInfo.promises.length > 0) {
    lines.push('**承诺**：');
    keyInfo.promises.forEach(p => lines.push(`- ${p.slice(0, 100)}`));
  }
  
  if (keyInfo.todos.length > 0) {
    lines.push('**待办**：');
    keyInfo.todos.forEach(t => lines.push(`- ${t}`));
  }
  
  return lines.length > 1 ? lines.join('\n') : null;
}

// 补录到日志
function appendToLog(content) {
  const logPath = path.join(CONFIG.workspaceDir, 'memory', `${getToday()}.md`);
  const timestamp = new Date().toLocaleString('zh-CN', { timeZone: CONFIG.timezone });
  
  const entry = `\n\n---\n\n### ${timestamp} — 心跳补录\n\n${content}\n`;
  
  // 确保目录存在
  const dir = path.dirname(logPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.appendFileSync(logPath, entry, 'utf8');
  return logPath;
}

// 主函数
async function main() {
  const dryRun = process.argv.includes('--dry-run');
  
  console.log(`[memory-heartbeat] 开始执行，日期: ${getToday()}`);
  
  // 1. 检查今日日志
  const todayLog = readTodayLog();
  const entryCount = countLogEntries(todayLog);
  
  console.log(`[memory-heartbeat] 今日日志条目: ${entryCount}`);
  
  if (entryCount >= CONFIG.minEntriesThreshold) {
    console.log('[memory-heartbeat] 日志条目充足，无需补录');
    return { status: 'ok', supplemented: false };
  }
  
  // 2. 扫描活跃 Session
  const sessions = scanActiveSessions();
  console.log(`[memory-heartbeat] 发现 ${sessions.length} 个活跃 Session`);
  
  if (sessions.length === 0) {
    console.log('[memory-heartbeat] 无活跃 Session，无法补录');
    return { status: 'no-sessions', supplemented: false };
  }
  
  // 3. 提取关键信息
  let allKeyInfo = {
    decisions: [],
    lessons: [],
    promises: [],
    todos: []
  };
  
  for (const session of sessions) {
    const cleaned = cleanMessages(session.messages);
    const keyInfo = extractKeyInfo(cleaned);
    
    allKeyInfo.decisions.push(...keyInfo.decisions);
    allKeyInfo.lessons.push(...keyInfo.lessons);
    allKeyInfo.promises.push(...keyInfo.promises);
    allKeyInfo.todos.push(...keyInfo.todos);
  }
  
  // 去重
  allKeyInfo.decisions = [...new Set(allKeyInfo.decisions)];
  allKeyInfo.lessons = [...new Set(allKeyInfo.lessons)];
  allKeyInfo.promises = [...new Set(allKeyInfo.promises)];
  allKeyInfo.todos = [...new Set(allKeyInfo.todos)];
  
  // 4. 格式化并补录
  const supplement = formatSupplement(allKeyInfo);
  
  if (!supplement) {
    console.log('[memory-heartbeat] 无关键信息需要补录');
    return { status: 'no-info', supplemented: false };
  }
  
  console.log('[memory-heartbeat] 准备补录内容:');
  console.log(supplement);
  
  if (dryRun) {
    console.log('[memory-heartbeat] --dry-run 模式，未实际写入');
    return { status: 'dry-run', supplemented: false, content: supplement };
  }
  
  // 5. 写入日志
  const logPath = appendToLog(supplement);
  console.log(`[memory-heartbeat] 已补录到: ${logPath}`);
  
  return { 
    status: 'supplemented', 
    supplemented: true, 
    logPath,
    entriesAdded: 1
  };
}

// 执行
main().then(result => {
  console.log('[memory-heartbeat] 执行完成:', result);
}).catch(err => {
  console.error('[memory-heartbeat] 执行失败:', err);
  process.exit(1);
});
