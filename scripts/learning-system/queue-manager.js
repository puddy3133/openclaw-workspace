#!/usr/bin/env node
/**
 * 学习队列管理器
 * 处理内容入队、状态管理、批量处理
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const QUEUE_DIR = path.join(__dirname, '../../memory/learning-queue');
const INDEX_FILE = path.join(QUEUE_DIR, 'index.json');

// 生成简单UUID
function generateId() {
  return crypto.randomUUID();
}

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 读取索引
function readIndex() {
  if (!fs.existsSync(INDEX_FILE)) {
    return { version: '1.0', items: [], checkpoint: null };
  }
  return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
}

// 写入索引
function writeIndex(index) {
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
}

// 添加内容到队列
function addToQueue(source, type, content = null) {
  const index = readIndex();
  const id = generateId();
  
  const item = {
    id,
    source,
    type, // article|pdf|video|repo|skill|plugin|cli
    status: 'pending',
    addedAt: new Date().toISOString(),
    content: content ? content.substring(0, 1000) : null, // 预览
    decision: null,
    riskLevel: checkRiskLevel(type, source),
    tags: []
  };
  
  index.items.push(item);
  writeIndex(index);
  
  // 保存原始内容到 pending
  ensureDir(path.join(QUEUE_DIR, 'pending'));
  fs.writeFileSync(
    path.join(QUEUE_DIR, 'pending', `${id}.json`),
    JSON.stringify(item, null, 2)
  );
  
  return item;
}

// 检查风险等级
function checkRiskLevel(type, source) {
  const highRiskTypes = ['skill', 'plugin', 'cli'];
  if (highRiskTypes.includes(type)) return 'needs-approval';
  
  const highRiskKeywords = ['install', 'config', 'modify', 'delete'];
  if (highRiskKeywords.some(k => source.toLowerCase().includes(k))) {
    return 'needs-approval';
  }
  
  return 'safe';
}

// 批量添加
function addBatch(items) {
  return items.map(item => addToQueue(item.source, item.type, item.content));
}

// 更新决策
function updateDecision(id, decision) {
  const index = readIndex();
  const item = index.items.find(i => i.id === id);
  if (!item) return null;
  
  item.decision = decision; // 'immediate' | 'scheduled' | 'skip'
  item.status = decision === 'immediate' ? 'in-progress' : 
                decision === 'scheduled' ? 'scheduled' : 'completed';
  item.decidedAt = new Date().toISOString();
  
  // 移动文件
  const oldPath = path.join(QUEUE_DIR, 'pending', `${id}.json`);
  const newDir = decision === 'scheduled' ? 'scheduled' : 
                 decision === 'immediate' ? 'in-progress' : 'completed';
  ensureDir(path.join(QUEUE_DIR, newDir));
  
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, path.join(QUEUE_DIR, newDir, `${id}.json`));
  }
  
  writeIndex(index);
  return item;
}

// 获取待决定列表
function getPending() {
  const index = readIndex();
  return index.items.filter(i => i.status === 'pending');
}

// 获取已排期列表
function getScheduled() {
  const index = readIndex();
  return index.items
    .filter(i => i.status === 'scheduled')
    .sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));
}

// CLI
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'add':
      const source = process.argv[3];
      const type = process.argv[4] || 'article';
      const item = addToQueue(source, type);
      console.log(JSON.stringify(item, null, 2));
      break;
      
    case 'pending':
      console.log(JSON.stringify(getPending(), null, 2));
      break;
      
    case 'scheduled':
      console.log(JSON.stringify(getScheduled(), null, 2));
      break;
      
    case 'decide':
      const id = process.argv[3];
      const decision = process.argv[4];
      const result = updateDecision(id, decision);
      console.log(JSON.stringify(result, null, 2));
      break;
      
    default:
      console.log('Usage: queue-manager.js [add|pending|scheduled|decide]');
  }
}

module.exports = {
  addToQueue,
  addBatch,
  updateDecision,
  getPending,
  getScheduled,
  readIndex
};
