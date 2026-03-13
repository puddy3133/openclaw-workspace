#!/usr/bin/env node
/**
 * EvoMap 知识包发布脚本 v2 - 修复 asset_type -> type
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
  console.log('EvoMap 知识包发布 v2 - 2026-02-24 Task');
  console.log('='.repeat(70));

  // 读取 bundle
  const bundlePath = '/Users/puddy/.openclaw/workspace/evomap_bundle_20260224.json';
  const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));

  // 检查 Hub 连接
  log('Ping', '检查 Hub 连接...');
  const pingResult = await postToHub('/a2a/fetch', createEnvelope('fetch', {}));
  log('Ping', `Hub 状态: ${pingResult.status === 200 ? '✅ 正常' : '❌ 异常'}`);

  if (pingResult.status !== 200) {
    log('END', '❌ Hub 连接失败');
    process.exit(1);
  }

  // 转换 assets 数组 - 使用正确的字段名
  const assets = [];

  // Gene
  assets.push({
    type: 'Gene',
    asset_id: bundle.gene.asset_id,
    name: bundle.gene.name,
    category: bundle.gene.category,
    summary: bundle.gene.description,
    signals_match: bundle.gene.signals_match,
    version: bundle.gene.version,
    capabilities: bundle.gene.capabilities
  });

  // Capsule
  assets.push({
    type: 'Capsule',
    asset_id: bundle.capsule.asset_id,
    name: bundle.capsule.name,
    domain: bundle.capsule.domain,
    language: bundle.capsule.language,
    tags: bundle.capsule.tags,
    summary: bundle.capsule.summary,
    version: bundle.capsule.version
  });

  // EvolutionEvent
  assets.push({
    type: 'EvolutionEvent',
    asset_id: bundle.evolution_event.asset_id,
    event_type: bundle.evolution_event.event_type,
    confidence_score: bundle.evolution_event.confidence_score,
    impact_categories: bundle.evolution_event.impact_categories,
    version: bundle.evolution_event.version
  });

  log('Publish', '发布知识包: 便携式超时命令实现');
  console.log(`   Gene: ${assets[0].type} - ${assets[0].name}`);
  console.log(`   Capsule: ${assets[1].type} - ${assets[1].name}`);
  console.log(`   Event: ${assets[2].type} - confidence: ${assets[2].confidence_score}`);

  console.log('\n发送的 assets 数据:');
  console.log(JSON.stringify(assets, null, 2).substring(0, 800) + '...');

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
      console.log(`   响应: ${JSON.stringify(result.data).substring(0, 500)}`);
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
  fs.writeFileSync('/tmp/evomap_publish_result_20260224_v2.json', JSON.stringify(publishResult, null, 2));
  console.log('\n发布结果已保存');
}

main().catch(console.error);
