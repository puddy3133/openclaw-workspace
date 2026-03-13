import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

// Helper to handle both ESM and commonJS paths context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceDir = path.resolve(__dirname, '..');
const memoryDir = path.join(workspaceDir, 'memory');

// Get today's daily memory file
const today = new Date();
const dateStr = today.toISOString().split('T')[0];
const dailyFile = path.join(memoryDir, `${dateStr}.md`);

// Target files to update
const targets = {
  MEMORY: path.join(workspaceDir, 'MEMORY.md'),
  USER: path.join(workspaceDir, 'USER.md'),
  SOUL: path.join(workspaceDir, 'SOUL.md')
};

// Load API key from environment variable or config file
function loadApiKey() {
  // Priority 1: Environment variable
  const envKey = process.env.NVIDIA_API_KEY;
  if (envKey && !envKey.includes('YOUR_')) {
    console.log('[Memory Extractor] Using API key from environment variable');
    return envKey;
  }

  // Priority 2: Config file
  const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'openclaw.json');
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const configKey = config.models?.providers?.nvidia?.apiKey;
      if (configKey && !configKey.includes('YOUR_')) {
        console.log('[Memory Extractor] Using API key from config file');
        return configKey;
      }
    }
  } catch (err) {
    console.error('[Memory Extractor] Failed to load config:', err.message);
  }

  return null;
}

// Call NVIDIA API for LLM analysis
async function callLLM(prompt, apiKey) {
  return new Promise((resolve, reject) => {
    const requestBody = {
      model: 'z-ai/glm4.7',
      messages: [
        { role: 'system', content: '你是一个记忆提取助手。请从对话记录中提取重要信息，并以JSON格式返回。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    };
    
    const data = JSON.stringify(requestBody);
    const dataBuffer = Buffer.from(data, 'utf8');

    const options = {
      hostname: 'integrate.api.nvidia.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': dataBuffer.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed.choices?.[0]?.message?.content || '');
        } catch (e) {
          reject(new Error('Failed to parse LLM response: ' + e.message));
        }
      });
    });

    req.on('error', reject);
    req.write(dataBuffer);
    req.end();
  });
}

// Extract structured memory using LLM
async function extractStructuredMemory(content, apiKey) {
  const prompt = `请分析以下对话记录，提取重要信息并返回JSON格式：

${content}

请提取以下内容（如果没有则返回空数组或空字符串）：
{
  "userPreferences": ["用户偏好1", "用户偏好2"],
  "importantDecisions": ["决策1", "决策2"],
  "todos": ["待办1", "待办2"],
  "keyFacts": ["重要事实1", "重要事实2"],
  "summary": "简短总结"
}

只返回JSON，不要其他文字。`;

  try {
    const response = await callLLM(prompt, apiKey);
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.error('[Memory Extractor] LLM extraction failed:', err.message);
  }
  return null;
}

// Update MEMORY.md with extracted information
function updateMemoryFile(extracted, dateStr) {
  const timestamp = new Date().toISOString();
  let appendContent = `\n\n## ${dateStr} 记忆提取\n\n`;
  
  if (extracted.summary) {
    appendContent += `**总结**: ${extracted.summary}\n\n`;
  }
  
  if (extracted.userPreferences?.length > 0) {
    appendContent += `**用户偏好**:\n`;
    extracted.userPreferences.forEach(p => appendContent += `- ${p}\n`);
    appendContent += '\n';
  }
  
  if (extracted.importantDecisions?.length > 0) {
    appendContent += `**重要决策**:\n`;
    extracted.importantDecisions.forEach(d => appendContent += `- ${d}\n`);
    appendContent += '\n';
  }
  
  if (extracted.todos?.length > 0) {
    appendContent += `**待办事项**:\n`;
    extracted.todos.forEach(t => appendContent += `- [ ] ${t}\n`);
    appendContent += '\n';
  }
  
  if (extracted.keyFacts?.length > 0) {
    appendContent += `**关键信息**:\n`;
    extracted.keyFacts.forEach(f => appendContent += `- ${f}\n`);
    appendContent += '\n';
  }
  
  appendContent += `*提取时间: ${timestamp}*\n`;
  
  fs.appendFileSync(targets.MEMORY, appendContent);
  console.log('[Memory Extractor] Updated MEMORY.md');
}

// Update USER.md with user preferences
function updateUserFile(extracted) {
  if (!extracted.userPreferences || extracted.userPreferences.length === 0) {
    return;
  }
  
  const timestamp = new Date().toISOString();
  let appendContent = `\n\n## 偏好更新 (${timestamp.split('T')[0]})\n\n`;
  extracted.userPreferences.forEach(p => {
    appendContent += `- ${p}\n`;
  });
  
  fs.appendFileSync(targets.USER, appendContent);
  console.log('[Memory Extractor] Updated USER.md');
}

async function extractMemory() {
  console.log(`[Memory Extractor] Starting extraction for ${dateStr}`);
  
  if (!fs.existsSync(dailyFile)) {
    console.log('[Memory Extractor] No daily memory file found today. Skipping.');
    return;
  }

  const dailyContent = fs.readFileSync(dailyFile, 'utf8');
  if (dailyContent.trim().length < 50) {
    console.log('[Memory Extractor] Daily memory too short. Skipping.');
    return;
  }

  // Load API key from environment or config
  const apiKey = loadApiKey();
  if (!apiKey) {
    console.error('[Memory Extractor] No valid API key found. Falling back to basic logging.');
    // Fallback: just log execution
    const timestamp = new Date().toISOString();
    const memoryAppend = `\n- [${timestamp}] System Note: Daily memory extraction cron executed (no valid API key available).`;
    fs.appendFileSync(targets.MEMORY, memoryAppend);
    return;
  }

  console.log('[Memory Extractor] Calling LLM API for analysis...');
  
  try {
    const extracted = await extractStructuredMemory(dailyContent, apiKey);
    
    if (extracted) {
      updateMemoryFile(extracted, dateStr);
      updateUserFile(extracted);
      console.log('[Memory Extractor] Successfully extracted and updated memories.');
    } else {
      console.log('[Memory Extractor] No structured data extracted.');
    }
  } catch (err) {
    console.error('[Memory Extractor] Extraction failed:', err.message);
    // Fallback logging
    const timestamp = new Date().toISOString();
    const memoryAppend = `\n- [${timestamp}] System Note: Daily memory extraction cron executed with errors: ${err.message}`;
    fs.appendFileSync(targets.MEMORY, memoryAppend);
  }
}

extractMemory().catch(console.error);
