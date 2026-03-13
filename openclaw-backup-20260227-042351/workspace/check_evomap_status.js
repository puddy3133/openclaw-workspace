#!/usr/bin/env node

/**
 * 检查 EvoMap 节点状态
 */

const crypto = require('crypto');
const https = require('https');

const NODE_ID = 'node_openclaw_f0b7959e';
const HUB_URL = 'evomap.ai';

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
        'User-Agent': `EvoMap-Node/${NODE_ID}`
      },
      timeout: timeout
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', d => responseData += d);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: result
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: null,
            raw: responseData
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('检查 EvoMap 节点状态...');
  console.log('');

  // 发送 hello 消息
  console.log('1. 发送 Hello 消息...');
  const envelope = createEnvelope('hello', {});
  const response = await postToHub('/a2a/hello', envelope);

  if (response.status === 200 && response.data && response.data.payload) {
    const payload = response.data.payload;
    console.log('✅ Hello 成功');
    console.log('');
    console.log('节点信息:');
    console.log(`  节点 ID: ${payload.node_id || NODE_ID}`);
    console.log(`  积分: ${payload.credit_balance || 'N/A'}`);
    console.log(`  心跳间隔: ${payload.heartbeat_interval_ms || 'N/A'}ms`);
    console.log(`  状态: ${payload.status || 'N/A'}`);
    console.log('');

    if (payload.tasks && payload.tasks.length > 0) {
      console.log(`推荐任务 (${payload.tasks.length} 个):`);
      payload.tasks.forEach((task, i) => {
        console.log(`  ${i+1}. ${task.id || task.task_id}: ${task.summary || task.description || 'N/A'}`);
      });
    } else {
      console.log('推荐任务: 无');
    }
    console.log('');

    if (payload.niche_suggestions && payload.niche_suggestions.length > 0) {
      console.log(`领域建议 (${payload.niche_suggestions.length} 个):`);
      payload.niche_suggestions.slice(0, 10).forEach(niche => {
        console.log(`  - ${niche}`);
      });
    } else {
      console.log('领域建议: 无');
    }
  } else {
    console.log('❌ Hello 失败');
    console.log(`  Status: ${response.status}`);
    console.log(`  Raw: ${response.raw}`);
  }

  console.log('');
  console.log('2. 尝试 Fetch 任务...');
  const fetchEnvelope = createEnvelope('fetch', {
    query: {
      status: 'open',
      include_tasks: true,
      limit: 10
    }
  });

  const fetchResponse = await postToHub('/a2a/fetch', fetchEnvelope);

  if (fetchResponse.status === 200 && fetchResponse.data && fetchResponse.data.payload) {
    const payload = fetchResponse.data.payload;
    const tasks = payload.tasks || [];
    console.log(`✅ Fetch 成功，获取到 ${tasks.length} 个开放任务`);

    if (tasks.length > 0) {
      console.log('');
      tasks.forEach((task, i) => {
        console.log(`  ${i+1}. ID: ${task.id || task.task_id}`);
        console.log(`     领域: ${task.niche || task.category || 'N/A'}`);
        console.log(`     描述: ${task.summary || task.description || 'N/A'}`);
        if (task.status) console.log(`     状态: ${task.status}`);
        console.log('');
      });
    }
  } else {
    console.log(`❌ Fetch 失败`);
    console.log(`  Status: ${fetchResponse.status}`);
    console.log(`  Raw: ${fetchResponse.raw}`);
  }
}

main().catch(console.error);
