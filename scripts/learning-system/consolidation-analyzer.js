#!/usr/bin/env node
/**
 * consolidation-analyzer.js — 记忆合并分析器
 * 识别可合并的相似记忆，生成合并建议
 * 更新 .learning/consolidation-log.json
 */

const fs = require('fs');
const path = require('path');

const MEMORY = path.join(__dirname, '../../memory');
const LEARNING = path.join(MEMORY, '.learning');
const CONSOL_LOG = path.join(LEARNING, 'consolidation-log.json');

function tokenize(text) {
  if (!text) return [];
  return (text.toLowerCase().match(/[a-z0-9_-]{2,}|[\u4e00-\u9fff]{2,}/g) || []);
}

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = {};
  m[1].split('\n').forEach(line => {
    const [k, ...v] = line.split(':');
    if (k && v.length) fm[k.trim()] = v.join(':').trim();
  });
  return fm;
}

function computeJaccard(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = [...setA].filter(x => setB.has(x));
  const union = new Set([...setA, ...setB]);
  return union.size > 0 ? intersection.length / union.size : 0;
}

function getLifecycleStage(createdAt) {
  if (!createdAt) return 'active';
  const days = (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24);
  if (days <= 30) return 'active';
  if (days <= 60) return 'decay';
  return 'expired';
}

function readDir(dir) {
  const results = [];
  try {
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'README.md')) {
      const fp = path.join(dir, f);
      const content = fs.readFileSync(fp, 'utf8');
      const fm = parseFrontmatter(content);
      results.push({
        path: `${path.basename(dir)}/${f}`,
        content,
        tokens: tokenize(content),
        type: fm.type || path.basename(dir),
        created: fm.created_at || fm.created || '',
        lifecycle: getLifecycleStage(fm.created_at || fm.created)
      });
    }
  } catch {}
  return results;
}

function run() {
  const log = JSON.parse(fs.readFileSync(CONSOL_LOG, 'utf8'));
  const existingPairs = new Set(log.consolidations.map(c => c.source_memories.sort().join('|')));

  const allFiles = [
    ...readDir(path.join(MEMORY, 'lessons')),
    ...readDir(path.join(MEMORY, 'projects')),
  ];

  const newCandidates = [];

  for (let i = 0; i < allFiles.length; i++) {
    for (let j = i + 1; j < allFiles.length; j++) {
      const a = allFiles[i], b = allFiles[j];

      // Must be same type/directory
      if (a.type !== b.type) continue;

      // Must both be in active or decay
      if (a.lifecycle === 'expired' || b.lifecycle === 'expired') continue;

      const similarity = computeJaccard(a.tokens, b.tokens);
      if (similarity < 0.40) continue;

      const pairKey = [a.path, b.path].sort().join('|');
      if (existingPairs.has(pairKey)) continue;

      // Check temporal proximity (within 30 days)
      let temporalOk = true;
      if (a.created && b.created) {
        const diff = Math.abs(new Date(a.created) - new Date(b.created)) / (1000 * 60 * 60 * 24);
        temporalOk = diff <= 30;
      }

      newCandidates.push({
        consolidation_id: `c_${String(log.consolidations.length + newCandidates.length + 1).padStart(3, '0')}`,
        created_at: new Date().toISOString(),
        source_memories: [a.path, b.path],
        target_memory: null,
        similarity_score: Math.round(similarity * 100) / 100,
        temporal_proximity: temporalOk,
        status: 'pending',
        reason: `Jaccard similarity ${Math.round(similarity * 100)}%, both ${a.type}${temporalOk ? ', within 30 days' : ''}`
      });
    }
  }

  // Append new candidates
  log.consolidations.push(...newCandidates);
  log.total_consolidations = log.consolidations.length;
  log.pending_review = log.consolidations.filter(c => c.status === 'pending').length;
  log.last_updated = new Date().toISOString();

  fs.writeFileSync(CONSOL_LOG, JSON.stringify(log, null, 2));

  console.log(JSON.stringify({
    status: 'ok',
    files_compared: allFiles.length,
    new_candidates: newCandidates.length,
    total_candidates: log.total_consolidations,
    pending_review: log.pending_review,
    top_pairs: newCandidates.slice(0, 3).map(c => ({
      files: c.source_memories,
      similarity: c.similarity_score
    }))
  }));
}

run();
