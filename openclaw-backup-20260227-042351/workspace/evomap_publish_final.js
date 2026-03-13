#!/usr/bin/env node
/**
 * EvoMap 最终发布脚本 - 使用正确的哈希值
 */

const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

const NODE_ID = 'node_openclaw_683a348f';
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
        'X-Node-ID': NODE_ID
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
  console.log('EvoMap 最终发布 - 2026-02-24 Task v2');
  console.log('='.repeat(70));

  // 读取 bundle
  const bundlePath = '/Users/puddy/.openclaw/workspace/evomap_bundle_final_v2.json';
  const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));

  // 检查 Hub 连接
  log('Ping', '检查 Hub 连接...');
  const pingResult = await postToHub('/a2a/fetch', createEnvelope('fetch', {}));
  log('Ping', `Hub 状态: ${pingResult.status === 200 ? '✅ 正常' : '❌ 异常'}`);

  if (pingResult.status !== 200) {
    log('END', '❌ Hub 连接失败');
    process.exit(1);
  }

  // 直接使用 bundle 中的 assets 结构
  const assets = [
    bundle.gene,
    bundle.capsule,
    bundle.evolution_event
  ];

  log('Publish', '发布知识包: 便携式超时命令实现');
  console.log(`   Gene: ${bundle.gene.name}`);
  console.log(`   Capsule: ${bundle.capsule.name}`);
  console.log(`   Gene ID: ${bundle.gene.asset_id}`);
  console.log(`   Capsule ID: ${bundle.capsule.asset_id}`);

  const result = await postToHub('/a2a/publish', createEnvelope('publish', {
    assets: assets
  }), 45000);

  console.log('\n' + '='.repeat(70));
  console.log('发布结果:');
  console.log(`   HTTP Status: ${result.status}`);

  if (result.status === 200 && result.data) {
    if (result.data.payload && result.data.payload.credits_earned !== undefined) {
      const credits = result.data.payload.credits_earned;
      console.log(`   ✅ 发布成功！`);
      console.log(`   获得积分: ${credits}`);
    } else {
      console.log(`   ✅ 请求成功`);
      console.log(`   响应: ${JSON.stringify(result.data, null, 2).substring(0, 1000)}`);
    }
  } else {
    console.log(`   ⚠️ 发布结果:`);
    console.log(`   ${result.raw || result.data}`);
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`   总耗时: ${elapsed} 秒`);
  console.log('='.repeat(70));

  const publishResult = {
    timestamp: new Date().toISOString(),
    bundle_id: bundle.bundle_id,
    status: result.status,
    credits_earned: result.data?.payload?.credits_earned || null,
    elapsed_seconds: elapsed,
    response: result.data
  };
  fs.writeFileSync('/tmp/evomap_publish_final_v2.json', JSON.stringify(publishResult, null, 2));
  console.log('\n发布结果已保存到 /tmp/evomap_publish_final_v2.json');
}

main().catch(console.error);
