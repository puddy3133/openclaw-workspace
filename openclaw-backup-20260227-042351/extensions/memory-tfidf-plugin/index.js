/**
 * Memory TF-IDF Fallback Plugin
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = {
  evergreenFile: 'MEMORY.md',
  dailyDir: 'memory',
  maxRecentDays: 7,
  topK: 5,
  enableFallback: true,
  maxSnippetLength: 300
};

function loadConfig() {
  try {
    const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'openclaw.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.plugins?.entries?.['memory-tfidf']?.config || {};
    }
  } catch (err) {
    console.error('[memory-tfidf] Failed to load config:', err.message);
  }
  return {};
}

function getMemoryDir() {
  return process.env.OPENCLAW_WORKSPACE || 
    path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'workspace');
}

function tokenize(text) {
  if (!text) return [];
  const tokens = text.toLowerCase().match(/[a-z0-9]+|[\u4e00-\u9fff]/g) || [];
  return tokens.filter(t => t.length > 1 || /[\u4e00-\u9fff]/.test(t));
}

function computeTF(tokens) {
  const tf = {};
  const total = tokens.length;
  if (total === 0) return tf;
  
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  
  for (const key in tf) {
    tf[key] = tf[key] / total;
  }
  
  return tf;
}

function computeIDF(documents) {
  const idf = {};
  const nDocs = documents.length;
  if (nDocs === 0) return idf;
  
  const docFreq = {};
  for (const doc of documents) {
    const uniqueTokens = [...new Set(doc.tokens)];
    for (const token of uniqueTokens) {
      docFreq[token] = (docFreq[token] || 0) + 1;
    }
  }
  
  for (const token in docFreq) {
    const df = docFreq[token];
    idf[token] = Math.log(nDocs / df);
  }
  
  return idf;
}

function computeTFIDF(tf, idf) {
  const tfidf = {};
  for (const token in tf) {
    tfidf[token] = tf[token] * (idf[token] || 0);
  }
  return tfidf;
}

function cosineSimilarity(vecA, vecB) {
  const keysA = Object.keys(vecA);
  const keysB = Object.keys(vecB);
  
  if (keysA.length === 0 || keysB.length === 0) return 0;
  
  const commonKeys = keysA.filter(k => keysB.includes(k));
  if (commonKeys.length === 0) return 0;
  
  let dotProduct = 0;
  for (const key of commonKeys) {
    dotProduct += vecA[key] * vecB[key];
  }
  
  let normA = 0;
  for (const key of keysA) {
    normA += vecA[key] * vecA[key];
  }
  normA = Math.sqrt(normA);
  
  let normB = 0;
  for (const key of keysB) {
    normB += vecB[key] * vecB[key];
  }
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (normA * normB);
}

function splitByHeading(content, filePath) {
  const lines = content.split('\n');
  const chunks = [];
  let currentLines = [];
  let currentStart = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('#') && currentLines.length > 0) {
      const text = currentLines.join('\n').trim();
      if (text) {
        chunks.push({
          path: filePath,
          text,
          lineStart: currentStart,
          lineEnd: currentStart + currentLines.length - 1
        });
      }
      currentLines = [line];
      currentStart = i + 1;
    } else {
      currentLines.push(line);
    }
  }
  
  if (currentLines.length > 0) {
    const text = currentLines.join('\n').trim();
    if (text) {
      chunks.push({
        path: filePath,
        text,
        lineStart: currentStart,
        lineEnd: currentStart + currentLines.length - 1
      });
    }
  }
  
  return chunks;
}

class MemoryStore {
  constructor(config) {
    this.config = config;
    this.memoryDir = getMemoryDir();
    this.evergreenPath = path.join(this.memoryDir, config.evergreenFile);
    this.dailyDir = path.join(this.memoryDir, config.dailyDir);
    
    if (!fs.existsSync(this.dailyDir)) {
      fs.mkdirSync(this.dailyDir, { recursive: true });
    }
  }
  
  loadEvergreen() {
    try {
      if (fs.existsSync(this.evergreenPath)) {
        return fs.readFileSync(this.evergreenPath, 'utf8').trim();
      }
    } catch (err) {
      console.error('[memory-tfidf] Failed to load evergreen memory:', err.message);
    }
    return '';
  }
  
  getRecentMemories(days) {
    const results = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const filePath = path.join(this.dailyDir, `${dateStr}.md`);
      
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8').trim();
          results.push({ path: `memory/${dateStr}.md`, date: dateStr, content });
        } catch (err) {
          console.error(`[memory-tfidf] Failed to load ${dateStr}.md:`, err.message);
        }
      }
    }
    
    return results;
  }
  
  loadAllChunks() {
    const chunks = [];
    
    if (fs.existsSync(this.evergreenPath)) {
      try {
        const content = fs.readFileSync(this.evergreenPath, 'utf8');
        const evergreenChunks = splitByHeading(content, 'MEMORY.md');
        chunks.push(...evergreenChunks);
      } catch (err) {
        console.error('[memory-tfidf] Failed to load MEMORY.md chunks:', err.message);
      }
    }
    
    if (fs.existsSync(this.dailyDir)) {
      const files = fs.readdirSync(this.dailyDir)
        .filter(f => f.endsWith('.md'))
        .sort()
        .reverse();
      
      for (const file of files) {
        try {
          const filePath = path.join(this.dailyDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const dailyChunks = splitByHeading(content, `memory/${file}`);
          chunks.push(...dailyChunks);
        } catch (err) {
          console.error(`[memory-tfidf] Failed to load ${file}:`, err.message);
        }
      }
    }
    
    return chunks;
  }
  
  searchMemory(query, topK = null) {
    const k = topK || this.config.topK;
    const chunks = this.loadAllChunks();
    
    if (chunks.length === 0) return [];
    
    const documents = chunks.map(chunk => ({
      ...chunk,
      tokens: tokenize(chunk.text)
    }));
    
    const idf = computeIDF(documents);
    
    const docVectors = documents.map(doc => ({
      ...doc,
      vector: computeTFIDF(computeTF(doc.tokens), idf)
    }));
    
    const queryTokens = tokenize(query);
    const queryTF = computeTF(queryTokens);
    const queryVector = computeTFIDF(queryTF, idf);
    
    const scored = docVectors.map(doc => ({
      path: doc.path,
      lineStart: doc.lineStart,
      lineEnd: doc.lineEnd,
      score: cosineSimilarity(queryVector, doc.vector),
      snippet: doc.text.slice(0, this.config.maxSnippetLength)
    })).filter(doc => doc.score > 0.01);
    
    scored.sort((a, b) => b.score - a.score);
    
    return scored.slice(0, k);
  }
}

let memoryStore = null;

function getMemoryStore() {
  if (!memoryStore) {
    const config = { ...DEFAULT_CONFIG, ...loadConfig() };
    memoryStore = new MemoryStore(config);
  }
  return memoryStore;
}

function buildSystemPrompt(basePrompt) {
  const store = getMemoryStore();
  const config = { ...DEFAULT_CONFIG, ...loadConfig() };
  
  let prompt = basePrompt || '';
  
  const evergreen = store.loadEvergreen();
  if (evergreen) {
    prompt += `\n\n---\n\n## Evergreen Memory\n\n${evergreen}`;
  }
  
  const recent = store.getRecentMemories(config.maxRecentDays);
  if (recent.length > 0) {
    prompt += '\n\n---\n\n## Recent Memory Context';
    for (const entry of recent.slice(0, 3)) {
      const snippet = entry.content.slice(0, 500);
      prompt += `\n\n### ${entry.date}\n${snippet}`;
    }
  }
  
  return prompt;
}

async function beforeAgentStartHandler(event, ctx) {
  const config = { ...DEFAULT_CONFIG, ...loadConfig() };
  
  if (!config.enableFallback) return null;
  
  try {
    const enhancedPrompt = buildSystemPrompt(event.systemPrompt);
    
    if (enhancedPrompt !== event.systemPrompt) {
      return { systemPrompt: enhancedPrompt };
    }
  } catch (err) {
    console.error('[memory-tfidf] Error in before_agent_start:', err.message);
  }
  
  return null;
}

function createExampleMemoryFile() {
  const memoryDir = getMemoryDir();
  const filePath = path.join(memoryDir, 'MEMORY.md');
  
  if (fs.existsSync(filePath)) return false;
  
  const example = `# Evergreen Memory

> This file stores long-term facts and preferences.

## User Preferences

- Prefers concise answers
- Timezone: Asia/Shanghai (UTC+8)
- Primary language: Chinese
`;
  
  try {
    fs.mkdirSync(memoryDir, { recursive: true });
    fs.writeFileSync(filePath, example, 'utf8');
    console.log(`[memory-tfidf] Created example MEMORY.md at ${filePath}`);
    return true;
  } catch (err) {
    console.error('[memory-tfidf] Failed to create example file:', err.message);
    return false;
  }
}

function register(api) {
  console.log('[memory-tfidf] Plugin registering...');
  
  if (api.registerHook) {
    try {
      api.registerHook('before_agent_start', beforeAgentStartHandler, 'memory-tfidf');
      console.log('[memory-tfidf] before_agent_start hook registered');
    } catch (e) {
      console.log('[memory-tfidf] before_agent_start hook not available');
    }
  }
  
  createExampleMemoryFile();
  console.log('[memory-tfidf] Plugin registered successfully');
}

function activate() {
  console.log('[memory-tfidf] Plugin activated');
}

function deactivate() {
  console.log('[memory-tfidf] Plugin deactivated');
}

module.exports = {
  register,
  activate,
  deactivate,
  _internal: {
    tokenize,
    computeTF,
    cosineSimilarity
  }
};
