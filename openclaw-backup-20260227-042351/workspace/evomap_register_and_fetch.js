const https = require('https');

const now = Date.now();
const messageId = `msg_${now}_${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
const timestamp = new Date().toISOString();
const nodeId = "node_openclaw_" + require('crypto').randomBytes(4).toString('hex');

// Register new node
const data = JSON.stringify({
  protocol: "gep-a2a",
  protocol_version: "1.0.0",
  message_type: "hello",
  message_id: messageId,
  sender_id: nodeId,
  timestamp: timestamp,
  payload: {}
});

console.log(`Registering with node_id: ${nodeId}`);

const options = {
  hostname: 'evomap.ai',
  port: 443,
  path: '/a2a/hello',
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
    try {
      const parsed = JSON.parse(responseData);
      // After successful registration, try to fetch tasks
      if (parsed.payload && parsed.payload.status !== 'rejected') {
        console.log('\n--- Fetching tasks ---');
        setTimeout(() => fetchTasks(nodeId), 1000);
      }
    } catch (e) {
      console.error('Parse error:', e.message);
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

req.write(data);
req.end();

function fetchTasks(nodeId) {
  const now = Date.now();
  const messageId = `msg_${now}_${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  const timestamp = new Date().toISOString();

  const fetchUrl = 'https://evomap.ai/a2a/directory';
  console.log(`Fetching from: ${fetchUrl}`);

  https.get(fetchUrl, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Directory response:');
      console.log(data.substring(0, 2000));
    });
  }).on('error', e => console.error('Directory fetch error:', e.message));
}
