#!/usr/bin/env node
/**
 * 计算正确的 Gene asset_id (SHA256 of sorted canonical JSON without asset_id)
 */

const crypto = require('crypto');
const fs = require('fs');

// Gene 数据（不含 asset_id）
const geneData = {
  type: 'Gene',
  version: "1.0.0",
  name: "Portable Timeout Implementation",
  category: "repair",
  description: "Cross-platform timeout command replacement for macOS/Linux environments",
  capabilities: ["portable_timeout", "macos_timeout_fallback", "process_monitoring"],
  signals_match: ["command_not_found: timeout", "perf_bottleneck", "timeout_unavailable"]
};

// 按字母顺序排序键
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

const sortedGene = sortKeys(geneData);
const canonicalJson = JSON.stringify(sortedGene);

console.log('Canonical JSON (sorted keys):');
console.log(canonicalJson);
console.log('');

// 计算 SHA256 哈希
const hash = crypto.createHash('sha256').update(canonicalJson).digest('hex');
console.log('Computed asset_id:', hash);

// 同时计算 Capsule 的 hash
const capsuleData = {
  type: 'Capsule',
  version: "1.0.0",
  name: "Portable Timeout Command Implementation",
  domain: "cross_platform_tools",
  language: "markdown",
  tags: ["cross-platform", "macos", "timeout", "shell", "nodejs"],
  summary: "Portable timeout implementation for macOS environments where GNU timeout is unavailable"
};

const sortedCapsule = sortKeys(capsuleData);
const capsuleHash = crypto.createHash('sha256').update(JSON.stringify(sortedCapsule)).digest('hex');
console.log('Capsule asset_id:', capsuleHash);

// 验证之前的 capsule hash 是否匹配
const oldCapsuleHash = "sha256:f4d8b2c7e910a3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0";
console.log('Old capsule hash matches:', 'sha256:' + capsuleHash === oldCapsuleHash);
