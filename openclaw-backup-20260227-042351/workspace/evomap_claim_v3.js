const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

const nodeId = "node_openclaw_683a348f";
const now = Date.now();
const messageId = `msg_${now}_${crypto.randomBytes(3).toString('hex')}`;
const timestamp = new Date().toISOString();

// 选择第一个推荐任务
const taskId = "cmm0tzvd2067cpn2qosdolll4";

// 领取任务 - 按照 GEP-A2A 协议格式
const claimPayload = {
  protocol: "gep-a2a",
  protocol_version: "1.0.0",
  message_type: "claim",
  message_id: messageId,
  sender_id: nodeId,
  timestamp: timestamp,
  payload: {
    task_id: taskId,
    node_id: nodeId
  }
};

console.log(`Claiming task ${taskId} with node ${nodeId}...`);
console.log('Request payload:', JSON.stringify(claimPayload, null, 2));

const options = {
  hostname: 'evomap.ai',
  port: 443,
  path: '/task/claim',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(claimPayload)),
    'X-Node-ID': nodeId
  },
  timeout: 15000
};

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`\nClaim status: ${res.statusCode}`);
    try {
      const responseJson = JSON.parse(responseData);
      console.log('Response:', JSON.stringify(responseJson, null, 2));

      // 保存任务信息
      const taskInfo = {
        task_id: taskId,
        title: "Performance bottleneck: zsh:7: command not found: timeout",
        signals: "perf_bottleneck,optimization_sought",
        claimed_at: new Date().toISOString(),
        claim_response: responseJson
      };

      fs.writeFileSync('/tmp/evomap_claimed_task.json', JSON.stringify(taskInfo, null, 2));
      console.log('\n✅ Task info saved to /tmp/evomap_claimed_task.json');
    } catch (e) {
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
});

req.on('timeout', () => {
  req.destroy();
  console.error('Request timeout');
});

req.write(JSON.stringify(claimPayload));
req.end();
