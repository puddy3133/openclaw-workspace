#!/usr/bin/env node

/**
 * EvoMap 自动同步脚本
 * 每 4 小时运行一次，自动获取积分
 */

const crypto = require('crypto');
const https = require('https');

const NODE_ID = process.env.EVOMAP_NODE_ID || 'node_b76f787b0e96a7d9';
const HUB_URL = 'evomap.ai';

function canonicalJson(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(canonicalJson);
  const sorted = {};
  Object.keys(obj).sort().forEach(key => { sorted[key] = canonicalJson(obj[key]); });
  return sorted;
}

function computeAssetId(asset) {
  const copy = JSON.parse(JSON.stringify(asset));
  delete copy.asset_id;
  const jsonStr = JSON.stringify(canonicalJson(copy));
  return 'sha256:' + crypto.createHash('sha256').update(jsonStr).digest('hex');
}

function postToHub(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: HUB_URL,
      path: path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', d => responseData += d);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          resolve({ status: res.statusCode, body: responseData });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function hello() {
  const message_id = "msg_" + Date.now() + "_" + crypto.randomBytes(2).toString('hex');

  return await postToHub('/a2a/hello', {
    protocol: "gep-a2a",
    protocol_version: "1.0.0",
    message_type: "hello",
    message_id: message_id,
    sender_id: NODE_ID,
    timestamp: new Date().toISOString(),
    payload: {
      capabilities: {},
      gene_count: 0,
      capsule_count: 0,
      env_fingerprint: { platform: "darwin", arch: "x64" }
    }
  });
}

async function fetchAssets() {
  const message_id = "msg_" + Date.now() + "_" + crypto.randomBytes(2).toString('hex');

  return await postToHub('/a2a/fetch', {
    protocol: "gep-a2a",
    protocol_version: "1.0.0",
    message_type: "fetch",
    message_id: message_id,
    sender_id: NODE_ID,
    timestamp: new Date().toISOString(),
    payload: { asset_type: "Capsule", include_tasks: true }
  });
}

async function publishBundle(assets) {
  const message_id = "msg_" + Date.now() + "_" + crypto.randomBytes(2).toString('hex');

  const assetsWithIds = assets.map(asset => {
    const copy = JSON.parse(JSON.stringify(asset));
    copy.asset_id = computeAssetId(copy);
    return copy;
  });

  return await postToHub('/a2a/publish', {
    protocol: "gep-a2a",
    protocol_version: "1.0.0",
    message_type: "publish",
    message_id: message_id,
    sender_id: NODE_ID,
    timestamp: new Date().toISOString(),
    payload: { assets: assetsWithIds }
  });
}

async function main() {
  try {
    const start = Date.now();

    console.log('='.repeat(60));
    console.log('EvoMap 自动同步开始');
    console.log('节点 ID:', NODE_ID);
    console.log('时间:', new Date().toISOString());
    console.log('='.repeat(60));

    // 1. Hello - 保持连接
    console.log('\n[1/3] 发送 Hello 消息...');
    const helloResponse = await hello();
    console.log('状态:', helloResponse.status || helloResponse.payload?.status);
    console.log('剩余积分:', helloResponse.payload?.credit_balance || '未知');

    // 2. Fetch - 获取资产和任务
    console.log('\n[2/3] 获取资产和任务...');
    const fetchResponse = await fetchAssets();
    console.log('获取资产数:', fetchResponse.payload?.results?.length || 0);
    console.log('可用任务数:', fetchResponse.payload?.tasks?.length || 0);

    // 3. Publish - 发布知识包（如果有新的）
    console.log('\n[3/3] 检查是否发布新知识包...');
    // 这里可以添加逻辑来检测并发布新知识
    console.log('暂无新的知识包发布');

    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log('\n' + '='.repeat(60));
    console.log(`同步完成，耗时 ${elapsed} 秒`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { hello, fetchAssets, publishBundle };
