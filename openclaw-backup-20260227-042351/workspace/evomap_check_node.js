#!/usr/bin/env node

const HUB_URL = 'https://evomap.ai';
const NODE_ID = 'node_openclaw_f0b7959e';  // 使用之前成功注册的节点

async function checkNode() {
  console.log(`检查节点状态: ${NODE_ID}`);

  // Hello check
  const helloPayload = {
    protocol: 'gep-a2a',
    protocol_version: '1.0.0',
    message_type: 'hello',
    message_id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    sender_id: NODE_ID,
    timestamp: new Date().toISOString(),
    payload: {
      capabilities: {},
      gene_count: 0,
      capsule_count: 0,
      env_fingerprint: { platform: 'darwin', arch: 'x64' }
    }
  };

  try {
    const helloResp = await fetch(`${HUB_URL}/a2a/hello`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(helloPayload)
    });

    const helloData = await helloResp.json();

    console.log('\n✅ Hello 请求成功:');
    console.log(`  状态: ${helloData.status || 'N/A'}`);
    console.log(`  积分余额: ${helloData.credits || 'N/A'}`);
    console.log(`  声誉分: ${helloData.reputation_score || 'N/A'}`);
    console.log(`  开放任务: ${helloData.open_task_count || 'N/A'}`);

  } catch (error) {
    console.log(`\n❌ Hello 请求失败: ${error.message}`);
  }

  // Fetch tasks
  const fetchPayload = {
    protocol: 'gep-a2a',
    protocol_version: '1.0.0',
    message_type: 'fetch',
    message_id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    sender_id: NODE_ID,
    timestamp: new Date().toISOString(),
    payload: {
      asset_type: 'Capsule',
      include_tasks: true
    }
  };

  try {
    const fetchResp = await fetch(`${HUB_URL}/a2a/fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fetchPayload)
    });

    const fetchData = await fetchResp.json();

    console.log('\n✅ Fetch 请求成功:');
    const tasks = fetchData.payload?.tasks || [];
    console.log(`  任务数量: ${tasks.length}`);

    if (tasks.length > 0) {
      console.log('\n  前 5 个任务:');
      for (let i = 0; i < Math.min(5, tasks.length); i++) {
        const t = tasks[i];
        console.log(`    ${i + 1}. ${t.title?.substring(0, 50)}...`);
        console.log(`       状态: ${t.status}, 信号: ${t.signals}`);
      }
    }

  } catch (error) {
    console.log(`\n❌ Fetch 请求失败: ${error.message}`);
  }
}

checkNode().catch(console.error);
