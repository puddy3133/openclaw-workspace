#!/usr/bin/env node
/**
 * 去重检查器
 * 对比新内容与已有知识，判断是否需要学习
 */

const fs = require('fs');
const path = require('path');

const INDEX_DIR = path.join(__dirname, '../../memory/.index');
const COMPLETED_DIR = path.join(__dirname, '../../memory/learning-queue/completed');

// 读取学习索引
function readLearningIndex() {
  const file = path.join(INDEX_DIR, 'learning-index.json');
  if (!fs.existsSync(file)) {
    return { version: '2.0', fingerprints: [], keywords: {} };
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// 计算相似度
function calculateSimilarity(fp1, fp2) {
  // Hash 完全匹配
  if (fp1.hash === fp2.hash) return 1.0;
  
  // 关键词交集
  const keywords1 = new Set(fp1.keywords);
  const keywords2 = new Set(fp2.keywords);
  
  const intersection = [...keywords1].filter(k => keywords2.has(k));
  const union = new Set([...keywords1, ...keywords2]);
  
  const jaccard = intersection.length / union.size;
  
  return jaccard;
}

// 去重检查
function deduplicateCheck(newFingerprint) {
  const index = readLearningIndex();
  
  const matches = [];
  
  for (const existing of index.fingerprints || []) {
    const similarity = calculateSimilarity(newFingerprint, existing);
    
    if (similarity > 0.95) {
      return {
        action: 'skip',
        reason: '完全重复',
        similarity,
        matched: existing
      };
    }
    
    if (similarity > 0.70) {
      matches.push({ similarity, item: existing });
    }
  }
  
  if (matches.length > 0) {
    // 取最相似的
    matches.sort((a, b) => b.similarity - a.similarity);
    return {
      action: 'incremental',
      reason: '部分相似',
      similarity: matches[0].similarity,
      matched: matches[0].item,
      allMatches: matches
    };
  }
  
  return {
    action: 'learn',
    reason: '全新内容'
  };
}

// 添加到索引
function addToIndex(item, fingerprint) {
  const index = readLearningIndex();
  
  index.fingerprints.push({
    id: item.id,
    hash: fingerprint.hash,
    keywords: fingerprint.keywords,
    source: item.source,
    addedAt: new Date().toISOString()
  });
  
  // 更新关键词映射
  for (const keyword of fingerprint.keywords) {
    if (!index.keywords[keyword]) {
      index.keywords[keyword] = [];
    }
    if (!index.keywords[keyword].includes(item.id)) {
      index.keywords[keyword].push(item.id);
    }
  }
  
  index.lastUpdated = new Date().toISOString();
  
  fs.writeFileSync(
    path.join(INDEX_DIR, 'learning-index.json'),
    JSON.stringify(index, null, 2)
  );
}

// 搜索相关内容
function searchByKeywords(keywords) {
  const index = readLearningIndex();
  const results = new Map();
  
  for (const keyword of keywords) {
    const ids = index.keywords[keyword] || [];
    for (const id of ids) {
      results.set(id, (results.get(id) || 0) + 1);
    }
  }
  
  // 按匹配数排序
  return [...results.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

module.exports = {
  deduplicateCheck,
  addToIndex,
  searchByKeywords,
  calculateSimilarity
};
