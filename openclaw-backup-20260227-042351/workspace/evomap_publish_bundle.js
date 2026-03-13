#!/usr/bin/env node
/**
 * EvoMap 知识包发布脚本 - 使用现有 Bundle 格式
 */

const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

const NODE_ID = 'node_openclaw_main';
const HUB_URL = 'evomap.ai';

function log(step, message) {
  console.log(`[${step}] ${message}`);
}

function createEnvelope(messageType, payload = {}) {
  return {
    protocol: "gep-a2a",
    protocol_version: "1.0.0",
    message_type: messageType,
    message_id: `msg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    sender_id: NODE_ID,
    timestamp: new Date().toISOString(),
    payload: payload
  };
}

function postToHub(path, body, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: HUB_URL,
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'User-Agent': `EvoMap-Node/${NODE_ID}`,
        'X-Node-ID': NODE_ID,
        'X-Protocol-Version': '1.0.0'
      },
      timeout: timeout
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', d => responseData += d);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: result, raw: responseData });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, raw: responseData });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(data);
    req.end();
  });
}

async function main() {
  const startTime = Date.now();
  console.log('='.repeat(70));
  console.log('EvoMap 知识包发布 - 异步预检模式');
  console.log('='.repeat(70));

  // 读取 bundle
  const bundlePath = '/Users/puddy/.openclaw/workspace/evomap_bundle_final.json';
  const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));

  // 检查 Hub 连接
  log('Ping', '检查 Hub 连接...');
  const pingResult = await postToHub('/a2a/fetch', createEnvelope('fetch', {}));
  log('Ping', `Hub 状态: ${pingResult.status === 200 ? '✅ 正常' : '❌ 异常'}`);

  if (pingResult.status !== 200) {
    logError('END', 'Hub 连接失败');
    process.exit(1);
  }

  // 将 bundle 转换为 assets 数组格式
  const assets = [
    bundle.gene,
    bundle.capsule,
    bundle.evolution_event
  ];

  log('Publish', '发布知识包...');
  console.log(`   Gene ID: ${bundle.gene.asset_id.substring(0, 20)}...`);
  console.log(`   Capsule ID: ${bundle.capsule.asset_id.substring(0, 20)}...`);
  console.log(`   Event ID: ${bundle.evolution_event.asset_id.substring(0, 20)}...`);

  const result = await postToHub('/a2a/publish', createEnvelope('publish', {
    assets: assets
  }), 45000);

  console.log('\n' + '='.repeat(70));
  console.log('发布结果:');
  console.log(`   HTTP Status: ${result.status}`);

  if (result.status === 200 && result.data) {
    if (result.data.payload) {
      const credits = result.data.payload.credits_earned || 0;
      console.log(`   ✅ 发布成功！`);
      console.log(`   获得积分: ${credits}`);
    } else {
      console.log(`   ✅ 请求成功`);
      console.log(`   响应: ${JSON.stringify(result.data, null, 2)}`);
    }
  } else {
    console.log(`   ❌ 发布失败`);
    console.log(`   响应: ${result.raw || result.data}`);
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`   总耗时: ${elapsed} 秒`);
  console.log('='.repeat(70));
}

main().catch(console.error);
