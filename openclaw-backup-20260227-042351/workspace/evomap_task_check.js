#!/usr/bin/env node
/**
 * EvoMap 任务更新脚本 - 获取并显示任务
 */

const https = require('https');
const crypto = require('crypto');

const NODE_ID = 'node_openclaw_main';
const HUB_URL = 'evomap.ai';

function createEnvelope(messageType, payload) {
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
  console.log('='.repeat(70));
  console.log('EvoMap 任务查询');
  console.log('='.repeat(70));

  // 尝试不同的获取任务方式
  const attempts = [
    { name: 'Standard fetch with include_tasks', payload: { asset_type: 'Capsule', include_tasks: true } },
    { name: 'Minimal fetch', payload: { include_tasks: true } },
    { name: 'Empty payload', payload: {} }
  ];

  for (const attempt of attempts) {
    console.log(`\n[${attempt.name}]`);
    console.log(`Payload: ${JSON.stringify(attempt.payload)}`);
    
    const result = await postToHub('/a2a/fetch', createEnvelope('fetch', attempt.payload));
    
    console.log(`Status: ${result.status}`);
    
    if (result.status === 200 && result.data) {
      const payload = result.data.payload;
      
      // 检查各种可能的数据结构
      if (payload.results && Array.isArray(payload.results)) {
        const withTask = payload.results.filter(r => r.task);
        console.log(`- Total results: ${payload.results.length}`);
        console.log(`- With task field: ${withTask.length}`);
        
        if (withTask.length > 0) {
          console.log('\n任务列表:');
          withTask.slice(0, 3).forEach((r, i) => {
            const task = r.task || {};
            console.log(`  ${i+1}. ${task.title || 'N/A'} (ID: ${r.asset_id?.substring(0, 20)}...)`);
            console.log(`     信号: ${r.trigger_text || task.signals || 'N/A'}`);
            console.log(`     状态: ${task.status || 'N/A'}`);
          });
        }
      }
      
      if (payload.tasks && Array.isArray(payload.tasks)) {
        console.log(`\n- Tasks array length: ${payload.tasks.length}`);
        if (payload.tasks.length > 0) {
          console.log('\n任务列表 (tasks字段):');
          payload.tasks.slice(0, 3).forEach((t, i) => {
            console.log(`  ${i+1}. ${t.title || 'N/A'} (ID: ${t.task_id?.substring(0, 20)}...)`);
            console.log(`     信号: ${t.signals || 'N/A'}`);
            console.log(`     状态: ${t.status || 'N/A'}`);
          });
        }
      }
      
      if (payload.count !== undefined) {
        console.log(`\n- Count: ${payload.count}`);
      }
      
      if (payload.asset_type) {
        console.log(`- Asset type: ${payload.asset_type}`);
      }
    } else {
      console.log(`Raw response (first 500 chars): ${result.raw?.substring(0, 500)}`);
    }
  }

  // 尝试直接访问 /task/list 端点
  console.log('\n\n' + '='.repeat(70));
  console.log('尝试 /task/list 端点');
  console.log('='.repeat(70));
  
  try {
    const taskListResult = await postToHub('/task/list', {
      node_id: NODE_ID
    }, 15000);
    
    console.log(`Status: ${taskListResult.status}`);
    console.log(`Response: ${taskListResult.raw?.substring(0, 800)}`);
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }

  console.log('\n' + '='.repeat(70));
}

main().catch(console.error);
