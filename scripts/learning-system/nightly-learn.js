#!/usr/bin/env node
/**
 * 夜间学习主逻辑
 * 04:00 执行，支持断点续学、任务冲突检测
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const QUEUE_DIR = path.join(__dirname, '../../memory/learning-queue');
const INDEX_FILE = path.join(QUEUE_DIR, 'index.json');
const CHECKPOINT_FILE = path.join(QUEUE_DIR, 'in-progress/checkpoint.json');

// 检查是否有进行中的任务
function checkActiveTasks() {
  try {
    // 检查子Agent
    const result = execSync('openclaw sessions list --json 2>/dev/null || echo "[]"', { encoding: 'utf8' });
    const sessions = JSON.parse(result);
    const activeAgents = sessions.filter(s => s.kind === 'subagent' && s.status === 'running');
    
    return {
      hasActiveAgents: activeAgents.length > 0,
      activeCount: activeAgents.length
    };
  } catch (e) {
    return { hasActiveAgents: false, activeCount: 0 };
  }
}

// 读取检查点
function readCheckpoint() {
  if (!fs.existsSync(CHECKPOINT_FILE)) return null;
  return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
}

// 写入检查点
function writeCheckpoint(item, progress) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({
    currentItem: item,
    progress,
    lastUpdated: new Date().toISOString()
  }, null, 2));
}

// 清除检查点
function clearCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    fs.unlinkSync(CHECKPOINT_FILE);
  }
}

// 读取索引
function readIndex() {
  return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
}

// 更新索引
function writeIndex(index) {
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
}

// 获取下一条待学习内容
function getNextItem() {
  const index = readIndex();
  return index.items
    .filter(i => i.status === 'scheduled')
    .sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt))[0];
}

// 标记学习完成
function markCompleted(itemId, outputPath) {
  const index = readIndex();
  const item = index.items.find(i => i.id === itemId);
  if (item) {
    item.status = 'completed';
    item.completedAt = new Date().toISOString();
    item.outputPath = outputPath;
    writeIndex(index);
  }
}

// 主逻辑
async function nightlyLearn() {
  console.log(`[${new Date().toISOString()}] 夜间学习开始`);
  
  // 1. 检查冲突
  const taskStatus = checkActiveTasks();
  if (taskStatus.hasActiveAgents) {
    console.log(`检测到 ${taskStatus.activeCount} 个活跃子Agent，顺延到下次`);
    return { status: 'deferred', reason: 'active-agents' };
  }
  
  // 2. 检查断点续学
  const checkpoint = readCheckpoint();
  if (checkpoint?.currentItem) {
    console.log(`发现断点，继续学习: ${checkpoint.currentItem.id}`);
    // 这里调用 content-processor 继续处理
    return { status: 'resumed', item: checkpoint.currentItem };
  }
  
  // 3. 获取新任务
  const item = getNextItem();
  if (!item) {
    console.log('没有待学习内容');
    return { status: 'empty' };
  }
  
  console.log(`开始学习: ${item.source}`);
  writeCheckpoint(item, 'started');
  
  // 4. 根据类型调用不同处理器
  // 这里会调用 content-processor.js
  
  return { status: 'started', item };
}

// CLI
if (require.main === module) {
  nightlyLearn().then(result => {
    console.log(JSON.stringify(result, null, 2));
  }).catch(err => {
    console.error('学习失败:', err);
    process.exit(1);
  });
}

module.exports = { nightlyLearn, checkActiveTasks, readCheckpoint };
