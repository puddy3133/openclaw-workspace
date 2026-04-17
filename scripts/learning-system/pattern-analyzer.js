#!/usr/bin/env node
/**
 * pattern-analyzer.js — 推理模式分析器
 * 扫描 lessons/ 和 patterns/ 中的关键词，识别重复出现的主题
 * 更新 .learning/patterns.json
 */

const fs = require('fs');
const path = require('path');

const MEMORY = path.join(__dirname, '../../memory');
const LEARNING = path.join(MEMORY, '.learning');
const PATTERNS_JSON = path.join(LEARNING, 'patterns.json');

// Stopwords to skip (markdown artifacts, common words)
const STOPWORDS = new Set(['---', '------', 'the', 'and', 'for', 'with', 'from', 'this', 'that', 'not', 'are', 'was', 'has', 'have', 'been', 'will', 'can', 'all', 'but', 'use', 'new', 'now', 'get', 'set', 'may', 'one', 'two', 'also', 'more', 'most', 'such', 'only', 'each', 'into', 'over', 'then', 'when', 'than', 'just', 'like', 'very', 'after', 'before', 'between', 'about']);

function tokenize(text) {
  if (!text) return [];
  // Strip frontmatter
  const clean = text.replace(/^---[\s\S]*?---\n?/, '');
  const tokens = clean.toLowerCase().match(/[a-z][a-z0-9_-]{2,}|[\u4e00-\u9fff]{2,}/g) || [];
  return tokens.filter(t => !STOPWORDS.has(t) && !/^-+$/.test(t) && !/^\d{4}/.test(t));
}

function readMdFiles(dir) {
  const results = [];
  try {
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'README.md')) {
      const content = fs.readFileSync(path.join(dir, f), 'utf8');
      results.push({ file: f, dir: path.basename(dir), path: `${path.basename(dir)}/${f}`, content, tokens: tokenize(content) });
    }
  } catch {}
  return results;
}

function computeJaccard(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = [...setA].filter(x => setB.has(x));
  const union = new Set([...setA, ...setB]);
  return union.size > 0 ? intersection.length / union.size : 0;
}

function run() {
  // Load current patterns
  const current = JSON.parse(fs.readFileSync(PATTERNS_JSON, 'utf8'));

  // Read all memory files
  const allFiles = [
    ...readMdFiles(path.join(MEMORY, 'lessons')),
    ...readMdFiles(path.join(MEMORY, 'patterns')),
    ...readMdFiles(path.join(MEMORY, 'projects')),
  ];

  // Build keyword frequency across files
  const keywordFreq = {};
  for (const f of allFiles) {
    const unique = [...new Set(f.tokens)];
    for (const t of unique) {
      if (!keywordFreq[t]) keywordFreq[t] = { count: 0, files: [] };
      keywordFreq[t].count++;
      keywordFreq[t].files.push(f.path);
    }
  }

  // Find topic patterns: keywords appearing in 3+ files
  const topicKeywords = Object.entries(keywordFreq)
    .filter(([kw, info]) => info.count >= 3 && kw.length > 2)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20);

  // Group related keywords (appearing in same files often)
  const clusters = [];
  const used = new Set();

  for (const [kw, info] of topicKeywords) {
    if (used.has(kw)) continue;
    const cluster = { keywords: [kw], files: new Set(info.files), frequency: info.count };

    for (const [kw2, info2] of topicKeywords) {
      if (kw2 === kw || used.has(kw2)) continue;
      const overlap = info.files.filter(f => info2.files.includes(f)).length;
      if (overlap >= 2) {
        cluster.keywords.push(kw2);
        info2.files.forEach(f => cluster.files.add(f));
        cluster.frequency = Math.max(cluster.frequency, info2.count);
        used.add(kw2);
      }
    }
    used.add(kw);
    if (cluster.files.size >= 2) {
      clusters.push(cluster);
    }
  }

  // Find consolidation candidates: file pairs with high similarity
  const consolidationCandidates = [];
  for (let i = 0; i < allFiles.length; i++) {
    for (let j = i + 1; j < allFiles.length; j++) {
      if (allFiles[i].dir !== allFiles[j].dir) continue; // same dir only
      const sim = computeJaccard(allFiles[i].tokens, allFiles[j].tokens);
      if (sim >= 0.40) { // 0.40 threshold for flagging
        consolidationCandidates.push({
          fileA: allFiles[i].path,
          fileB: allFiles[j].path,
          similarity: Math.round(sim * 100) / 100
        });
      }
    }
  }

  // Merge with existing patterns
  let nextId = current.patterns.length + 1;
  const now = new Date().toISOString();
  let newCount = 0;
  let updatedCount = 0;

  for (const cluster of clusters) {
    const name = cluster.keywords.slice(0, 3).join('+');
    const existing = current.patterns.find(p =>
      p.keywords.some(k => cluster.keywords.includes(k))
    );

    if (existing) {
      // Update existing pattern
      existing.frequency = Math.max(existing.frequency, cluster.frequency);
      existing.related_memories = [...new Set([...existing.related_memories, ...cluster.files])];
      existing.last_seen = now;
      existing.confidence = Math.min(0.95, existing.confidence + 0.02);
      const hasCandidates = consolidationCandidates.some(c =>
        cluster.files.has(c.fileA) || cluster.files.has(c.fileB)
      );
      existing.consolidation_candidate = hasCandidates;
      updatedCount++;
    } else {
      // New pattern
      const confidence = Math.min(0.95, 0.5 + cluster.frequency * 0.05);
      if (confidence >= 0.70 && cluster.files.size >= 2) {
        current.patterns.push({
          pattern_id: `p_${String(nextId++).padStart(3, '0')}`,
          name,
          type: 'topic',
          keywords: cluster.keywords.slice(0, 6),
          frequency: cluster.frequency,
          related_memories: [...cluster.files],
          confidence: Math.round(confidence * 100) / 100,
          first_seen: now,
          last_seen: now,
          consolidation_candidate: false,
          consolidation_target: null
        });
        newCount++;
      }
    }
  }

  // Update stats
  const byType = {};
  for (const p of current.patterns) {
    byType[p.type] = (byType[p.type] || 0) + 1;
  }
  current.total_patterns = current.patterns.length;
  current.pattern_stats = { by_type: byType };
  current.last_updated = now;

  fs.writeFileSync(PATTERNS_JSON, JSON.stringify(current, null, 2));

  console.log(JSON.stringify({
    status: 'ok',
    files_scanned: allFiles.length,
    clusters_found: clusters.length,
    new_patterns: newCount,
    updated_patterns: updatedCount,
    total_patterns: current.total_patterns,
    consolidation_candidates: consolidationCandidates.length,
    top_keywords: topicKeywords.slice(0, 5).map(([k, v]) => `${k}(${v.count})`)
  }));
}

run();
