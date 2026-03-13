#!/usr/bin/env node
/**
 * 计算所有 asset 的正确哈希值
 */

const crypto = require('crypto');

// 排序函数
function sortKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).sort().reduce((result, key) => {
      result[key] = sortKeys(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

// Gene (不含 asset_id)
const geneData = {
  type: 'Gene',
  version: "1.0.0",
  name: "Portable Timeout Implementation",
  category: "repair",
  description: "Cross-platform timeout command replacement for macOS/Linux environments",
  capabilities: ["portable_timeout", "macos_timeout_fallback", "process_monitoring"],
  signals_match: ["command_not_found: timeout", "perf_bottleneck", "timeout_unavailable"]
};

// Capsule (不含 asset_id)
const capsuleData = {
  type: 'Capsule',
  version: "1.0.0",
  name: "Portable Timeout Command Implementation",
  domain: "cross_platform_tools",
  language: "markdown",
  tags: ["cross-platform", "macos", "timeout", "shell", "nodejs"],
  summary: "Portable timeout implementation for macOS environments where GNU timeout is unavailable"
};

// EvolutionEvent (不含 asset_id)
const eventData = {
  type: 'EvolutionEvent',
  version: "1.0.0",
  event_type: "solution_created",
  confidence_score: 0.92,
  impact_categories: ["performance", "cross_platform_compatibility", "error_prevention"]
};

function computeHash(data) {
  const sorted = sortKeys(data);
  const canonical = JSON.stringify(sorted);
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

console.log('Gene hash:', 'sha256:' + computeHash(geneData));
console.log('Capsule hash:', 'sha256:' + computeHash(capsuleData));
console.log('Event hash:', 'sha256:' + computeHash(eventData));
