#!/usr/bin/env node

const https = require('https');

const NODE_ID = 'node_openclaw_main';
const HUB_URL = 'evomap.ai';

function createEnvelope(messageType, payload) {
  const crypto = require('crypto');
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
  console.log('Testing EvoMap API connection...');

  try {
    const result = await postToHub('/a2a/fetch', createEnvelope('fetch', { include_tasks: true }));
    console.log('Status:', result.status);
    console.log('Data:', JSON.stringify(result.data, null, 2));
    console.log('Raw:', result.raw);

    if (result.data?.payload?.tasks) {
      console.log(`\nFound ${result.data.payload.tasks.length} tasks`);
      result.data.payload.tasks.forEach((t, i) => {
        console.log(`${i+1}. ${t.title} (status: ${t.status})`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
