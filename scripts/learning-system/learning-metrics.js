#!/usr/bin/env node
/**
 * learning-metrics.js — 学习指标聚合
 * 统计记忆系统各维度数据，写入 .learning/learning-metrics.json
 */

const fs = require('fs');
const path = require('path');

const MEMORY = path.join(__dirname, '../../memory');
const LEARNING = path.join(MEMORY, '.learning');
const OUTPUT = path.join(LEARNING, 'learning-metrics.json');

function countFiles(dir, ext = '.md') {
  try {
    return fs.readdirSync(dir).filter(f => f.endsWith(ext)).length;
  } catch { return 0; }
}

function readJSON(fp) {
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); }
  catch { return null; }
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

function getLifecycleStage(createdAt) {
  if (!createdAt) return 'unknown';
  const created = new Date(createdAt);
  const now = new Date();
  const days = (now - created) / (1000 * 60 * 60 * 24);
  if (days <= 30) return 'active';
  if (days <= 60) return 'decay';
  return 'expired';
}

function run() {
  // Count files
  const lessonsCount = countFiles(path.join(MEMORY, 'lessons'));
  const patternsCount = countFiles(path.join(MEMORY, 'patterns')) - 1; // exclude README.md
  const projectsCount = countFiles(path.join(MEMORY, 'projects'));
  const peopleCount = countFiles(path.join(MEMORY, 'people'));
  const dayActive = countFiles(path.join(MEMORY, 'day'));
  const dayArchived = countFiles(path.join(MEMORY, 'archive', 'day'));
  const weeklyCount = countFiles(path.join(MEMORY, 'weekly'));

  // Lifecycle analysis
  const lifecycle = { active: 0, decay: 0, expired: 0, unknown: 0 };
  const dirs = ['lessons', 'projects', 'patterns', 'people'].map(d => path.join(MEMORY, d));
  for (const dir of dirs) {
    try {
      for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'README.md')) {
        const content = fs.readFileSync(path.join(dir, f), 'utf8');
        const fm = parseFrontmatter(content);
        const stage = getLifecycleStage(fm.created_at || fm.created);
        lifecycle[stage] = (lifecycle[stage] || 0) + 1;
      }
    } catch {}
  }

  // Tag coverage
  const tagIndex = readJSON(path.join(LEARNING, 'tag-index.json'));
  const tagCoverage = tagIndex?.tag_stats?.coverage || 0;
  const totalTags = tagIndex?.tag_stats?.total_tags || 0;
  const autoRatio = tagIndex?.tag_stats?.auto_assigned_ratio || 0;

  // Pattern stats
  const patterns = readJSON(path.join(LEARNING, 'patterns.json'));
  const patternCount = patterns?.total_patterns || 0;
  const avgConfidence = patterns?.patterns?.length
    ? patterns.patterns.reduce((s, p) => s + p.confidence, 0) / patterns.patterns.length
    : 0;
  const consolidationCandidates = (patterns?.patterns || []).filter(p => p.consolidation_candidate).length;

  // Pattern refs (from pattern files' frontmatter)
  let totalRefs = 0;
  try {
    for (const f of fs.readdirSync(path.join(MEMORY, 'patterns')).filter(f => f.endsWith('.md') && f !== 'README.md')) {
      const content = fs.readFileSync(path.join(MEMORY, 'patterns', f), 'utf8');
      const fm = parseFrontmatter(content);
      totalRefs += parseInt(fm.refs || '0', 10);
    }
  } catch {}

  // Learning queue stats
  const completionLog = readJSON(path.join(MEMORY, 'learning-queue', 'completed', 'completion-log.json'));
  const learningCompleted = completionLog?.stats?.totalCompleted || completionLog?.records?.length || 0;

  // Consolidation stats
  const consolLog = readJSON(path.join(LEARNING, 'consolidation-log.json'));
  const pendingReview = consolLog?.pending_review || 0;

  const now = new Date();
  const dateStr = now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' });
  const period16ago = new Date(now - 16 * 86400000).toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' });

  const result = {
    version: '1.0',
    period: `${period16ago} to ${dateStr}`,
    last_updated: now.toISOString(),
    access_metrics: {
      total_queries: 0,
      query_types: { exact: 0, keyword: 0, fuzzy: 0 },
      top_queries: [],
      avg_query_latency_ms: 0,
      cache_hit_ratio: 0
    },
    memory_metrics: {
      total_memories: lessonsCount + patternsCount + projectsCount + peopleCount,
      by_type: { lessons: lessonsCount, projects: projectsCount, people: peopleCount, patterns: patternsCount },
      by_lifecycle: lifecycle,
      day_active: dayActive,
      day_archived: dayArchived,
      weekly_count: weeklyCount,
      avg_access_count: 0,
      most_accessed: []
    },
    pattern_metrics: {
      total_patterns_detected: patternCount,
      consolidation_candidates: consolidationCandidates,
      avg_pattern_confidence: Math.round(avgConfidence * 100) / 100,
      total_refs: totalRefs,
      patterns_reused: totalRefs > 0
    },
    tag_metrics: {
      total_tags: totalTags,
      auto_assigned_ratio: autoRatio,
      coverage: tagCoverage
    },
    learning_metrics: {
      completed: learningCompleted,
      pending_review: pendingReview
    },
    performance_metrics: {
      index_build_time_ms: 0,
      query_cache_size_mb: 0,
      archive_size_mb: 0
    }
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(result, null, 2));
  console.log(JSON.stringify({
    status: 'ok',
    total_memories: result.memory_metrics.total_memories,
    patterns: patternCount,
    tag_coverage: tagCoverage,
    lifecycle: lifecycle,
    refs: totalRefs,
    learning_completed: learningCompleted
  }));
}

run();
