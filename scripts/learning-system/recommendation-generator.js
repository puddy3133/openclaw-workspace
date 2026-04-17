#!/usr/bin/env node
/**
 * recommendation-generator.js — 优化建议生成器
 * 读取 .learning/ 下所有 JSON 数据，生成优化建议
 * 写入 .learning/recommendations.json
 */

const fs = require('fs');
const path = require('path');

const MEMORY = path.join(__dirname, '../../memory');
const LEARNING = path.join(MEMORY, '.learning');
const OUTPUT = path.join(LEARNING, 'recommendations.json');

function readJSON(fp) {
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); }
  catch { return null; }
}

function run() {
  const metrics = readJSON(path.join(LEARNING, 'learning-metrics.json'));
  const patterns = readJSON(path.join(LEARNING, 'patterns.json'));
  const tagIndex = readJSON(path.join(LEARNING, 'tag-index.json'));
  const consolLog = readJSON(path.join(LEARNING, 'consolidation-log.json'));

  const recs = { merge: [], tag: [], archive: [], retrieval: [], performance: [] };

  // --- Merge recommendations ---
  if (consolLog && consolLog.pending_review > 0) {
    recs.merge.push({
      id: 'm_auto_001', priority: 'medium',
      title: `${consolLog.pending_review} 对记忆待合并审核`,
      description: `consolidation-analyzer 检测到 ${consolLog.pending_review} 对相似记忆，请人工审核确认是否合并。`,
      estimated_impact: `减少 ${consolLog.pending_review} 条冗余记忆`,
      affected_memories: consolLog.consolidations.filter(c => c.status === 'pending').flatMap(c => c.source_memories)
    });
  }

  // --- Tag recommendations ---
  const coverage = tagIndex?.tag_stats?.coverage || 0;
  const autoRatio = tagIndex?.tag_stats?.auto_assigned_ratio || 0;

  if (coverage < 0.80) {
    recs.tag.push({
      id: 't_auto_001', priority: coverage < 0.60 ? 'high' : 'medium',
      title: `标签覆盖率 ${Math.round(coverage * 100)}%，目标 80%`,
      description: `当前有 ${Math.round((1 - coverage) * 100)}% 的记忆未打标签。auto-tagger 每日运行应逐步提升。`,
      estimated_impact: '提升检索命中率 20-30%'
    });
  }

  if (autoRatio < 0.30 && tagIndex?.tag_stats?.total_tags > 0) {
    recs.tag.push({
      id: 't_auto_002', priority: 'low',
      title: `自动标签占比 ${Math.round(autoRatio * 100)}%`,
      description: '大部分标签仍为手动分配，auto-tagger 规则覆盖度可扩展。',
      action: '审查 TAG_RULES 映射表，补充缺失的关键词规则'
    });
  }

  // --- Archive recommendations ---
  if (metrics) {
    const expired = metrics.memory_metrics?.by_lifecycle?.expired || 0;
    const decay = metrics.memory_metrics?.by_lifecycle?.decay || 0;

    if (expired > 0) {
      recs.archive.push({
        id: 'a_auto_001', priority: 'medium',
        title: `${expired} 条过期记忆待归档`,
        description: '已超过 60 天生命周期，建议运行 memory-lifecycle 归档或手动审查延长。'
      });
    }
    if (decay > 5) {
      recs.archive.push({
        id: 'a_auto_002', priority: 'low',
        title: `${decay} 条记忆处于衰减期`,
        description: '30-60 天内未更新，检索时权重降低 50%。可考虑重新激活或准备归档。'
      });
    }

    const dayActive = metrics.memory_metrics?.day_active || 0;
    if (dayActive > 40) {
      recs.archive.push({
        id: 'a_auto_003', priority: 'medium',
        title: `day/ 目录活跃日志 ${dayActive} 个，建议归档`,
        description: '超过 45 天的日志应迁移至 archive/day/，减少扫描负担。'
      });
    }
  }

  // --- Pattern recommendations ---
  const patternCount = patterns?.total_patterns || 0;
  const totalRefs = metrics?.pattern_metrics?.total_refs || 0;

  if (patternCount < 5) {
    recs.retrieval.push({
      id: 'r_auto_001', priority: 'high',
      title: `推理模式仅 ${patternCount} 个，学习闭环积累不足`,
      description: 'Hermes 学习闭环需要持续从成功任务中提取 pattern。当前 pattern 数量过少，难以发挥检索复用效果。',
      action: '确保 learning-loop-plugin 和 daily_reflection 正常运行'
    });
  }

  if (totalRefs === 0 && patternCount > 0) {
    recs.retrieval.push({
      id: 'r_auto_002', priority: 'high',
      title: 'Pattern 从未被引用过',
      description: '所有 pattern 的 refs 计数为 0，说明 pattern-loader 插件未在任务启动时检索和引用历史模式。',
      action: '确认 pattern-loader-plugin 已注册并在 before_agent_start hook 中运行'
    });
  }

  // --- Performance recommendations ---
  if (metrics?.access_metrics?.total_queries === 0) {
    recs.performance.push({
      id: 'p_auto_001', priority: 'low',
      title: '查询指标未采集',
      description: 'total_queries=0，当前无查询日志记录。此指标需要 memory-tfidf-plugin 配合写入。',
    });
  }

  // Summary
  const allRecs = [...recs.merge, ...recs.tag, ...recs.archive, ...recs.retrieval, ...recs.performance];
  const byPriority = { high: 0, medium: 0, low: 0 };
  allRecs.forEach(r => byPriority[r.priority]++);

  const result = {
    version: '1.0',
    generated_at: new Date().toISOString(),
    period: metrics?.period || 'unknown',
    recommendations: recs,
    summary: {
      total: allRecs.length,
      by_priority: byPriority
    },
    high_priority_items: allRecs.filter(r => r.priority === 'high').map(r => `${r.id}: ${r.title}`)
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(result, null, 2));

  console.log(JSON.stringify({
    status: 'ok',
    total_recommendations: allRecs.length,
    high: byPriority.high,
    medium: byPriority.medium,
    low: byPriority.low,
    high_items: result.high_priority_items
  }));
}

run();
