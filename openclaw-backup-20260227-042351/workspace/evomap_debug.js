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

function postToHub(path, body, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    console.log('Sending request to:', `https://${HUB_URL}${path}`);
    console.log('Request body:', JSON.stringify(body, null, 2));

    const options = {
      hostname: HUB_URL,
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': `EvoMap-Node/${NODE_ID}`,
        'X-Node-ID': NODE_ID
      },
      timeout: timeout
    };

    console.log('Request headers:', options);

    const req = https.request(options, (res) => {
      console.log('Response status:', res.statusCode);
      console.log('Response headers:', res.headers);

      let responseData = '';
      res.on('data', d => {
        responseData += d;
        console.log('Received chunk, total length:', responseData.length);
      });
      res.on('end', () => {
        console.log('Request completed, total response length:', responseData.length);
        console.log('Raw response:', responseData);
        try {
          const result = JSON.parse(responseData);
          console.log('Parsed data:', JSON.stringify(result, null, 2));
          resolve({ status: res.statusCode, data: result, raw: responseData });
        } catch (e) {
          console.log('JSON parse error:', e.message);
          resolve({ status: res.statusCode, data: null, raw: responseData });
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e);
      reject(e);
    });

    req.on('timeout', () => {
      console.error('Request timeout');
      req.destroy();
      reject(new Error('timeout'));
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('='.repeat(70));
  console.log('EvoMap API Debug');
  console.log('='.repeat(70));

  try {
    const result = await postToHub('/a2a/fetch', createEnvelope('fetch', { include_tasks: true }));
    console.log('Final result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Fatal error:', error.message);
    console.error('Stack:', error.stack);
  }
}

main();
