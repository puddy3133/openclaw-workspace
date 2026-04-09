#!/usr/bin/env node
/**
 * 内容处理器
 * 根据类型解析内容，提取经验
 */

const fs = require('fs');
const path = require('path');

const COMPLETED_DIR = path.join(__dirname, '../../memory/learning-queue/completed');

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 提取指纹用于去重
function extractFingerprint(content) {
  // 提取关键词
  const keywords = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
  
  // 取前20个高频词
  const topKeywords = Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
  
  // 生成简单hash
  const hash = require('crypto')
    .createHash('sha256')
    .update(content.substring(0, 2000))
    .digest('hex')
    .substring(0, 16);
  
  return { keywords: topKeywords, hash };
}

// 处理文章内容
async function processArticle(item, content) {
  const fingerprint = extractFingerprint(content);
  
  const result = {
    id: item.id,
    source: item.source,
    type: 'article',
    processedAt: new Date().toISOString(),
    fingerprint,
    summary: null, // 由调用方填充
    lessons: [],
    tags: fingerprint.keywords.slice(0, 5)
  };
  
  return result;
}

// 处理代码仓库
async function processRepo(item, repoPath) {
  // 分析仓库结构
  const structure = analyzeRepoStructure(repoPath);
  
  return {
    id: item.id,
    source: item.source,
    type: 'repo',
    processedAt: new Date().toISOString(),
    structure,
    lessons: [],
    tags: ['code', 'repository']
  };
}

// 分析仓库结构
function analyzeRepoStructure(repoPath) {
  const result = {
    files: [],
    languages: {},
    hasREADME: false
  };
  
  function scanDir(dir, basePath = '') {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item.startsWith('.') || item === 'node_modules') continue;
      
      const fullPath = path.join(dir, item);
      const relPath = path.join(basePath, item);
      
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath, relPath);
      } else {
        result.files.push(relPath);
        const ext = path.extname(item);
        if (ext) {
          result.languages[ext] = (result.languages[ext] || 0) + 1;
        }
        if (item.toLowerCase() === 'readme.md') {
          result.hasREADME = true;
        }
      }
    }
  }
  
  scanDir(repoPath);
  return result;
}

// 保存学习成果
function saveCompleted(item, result) {
  ensureDir(path.join(COMPLETED_DIR, item.id));
  
  fs.writeFileSync(
    path.join(COMPLETED_DIR, item.id, 'source.json'),
    JSON.stringify(item, null, 2)
  );
  
  fs.writeFileSync(
    path.join(COMPLETED_DIR, item.id, 'result.json'),
    JSON.stringify(result, null, 2)
  );
  
  if (result.summary) {
    fs.writeFileSync(
      path.join(COMPLETED_DIR, item.id, 'summary.md'),
      result.summary
    );
  }
  
  if (result.lessons?.length > 0) {
    fs.writeFileSync(
      path.join(COMPLETED_DIR, item.id, 'lessons-extracted.md'),
      result.lessons.map(l => `- ${l}`).join('\n')
    );
  }
  
  return path.join(COMPLETED_DIR, item.id);
}

module.exports = {
  processArticle,
  processRepo,
  extractFingerprint,
  saveCompleted
};
