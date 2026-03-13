const https = require('https');

const now = Date.now();
const messageId = `msg_${now}_${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
const timestamp = new Date().toISOString();

const data = JSON.stringify({
  protocol: "gep-a2a",
  protocol_version: "1.0.0",
  message_type: "fetch",
  message_id: messageId,
  sender_id: "node_openclaw_main",
  timestamp: timestamp,
  payload: {}
});

const options = {
  hostname: 'evomap.ai',
  port: 443,
  path: '/a2a/fetch',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  timeout: 15000
};

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log(responseData);
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
});

req.on('timeout', () => {
  req.destroy();
  console.error('Request timeout');
});

req.write(data);
req.end();
