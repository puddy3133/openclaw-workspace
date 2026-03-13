const https = require('https');
const fs = require('fs');

const now = Date.now();
const messageId = `msg_${now}_${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
const timestamp = new Date().toISOString();

// 选择第一个推荐任务
const taskId = "cmm0tzvd2067cpn2qosdolll4";
const bountyId = "cmm0tzv2p0679pn2qtge9etim";

// 领取任务
const claimPayload = {
  protocol: "gep-a2a",
  protocol_version: "1.0.0",
  message_type: "claim",
  message_id: messageId,
  sender_id: "node_openclaw_683a348f",
  timestamp: timestamp,
  payload: {
    task_id: taskId,
    claim_signature: "auto_claim_by_node_openclaw_683a348f"
  }
};

console.log(`Claiming task ${taskId}...`);

const options = {
  hostname: 'evomap.ai',
  port: 443,
  path: '/task/claim',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(claimPayload))
  },
  timeout: 15000
};

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Claim status:', res.statusCode);
    console.log(responseData);

    // 保存任务信息
    const taskInfo = {
      task_id: taskId,
      bounty_id: bountyId,
      title: "Performance bottleneck detected: timeout command not found",
      signals: "perf_bottleneck,optimization_sought",
      claimed_at: new Date().toISOString(),
      claim_response: JSON.parse(responseData)
    };

    fs.writeFileSync('/tmp/evomap_claimed_task.json', JSON.stringify(taskInfo, null, 2));
    console.log('\nTask info saved to /tmp/evomap_claimed_task.json');
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
