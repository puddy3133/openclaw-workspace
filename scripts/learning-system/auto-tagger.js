#!/usr/bin/env node
/**
 * auto-tagger.js — 自动标签分配
 * 扫描 lessons/projects/patterns/ 中缺少 frontmatter tags 的文件，
 * 基于内容关键词匹配已有标签，更新 .learning/tag-index.json
 */

const fs = require('fs');
const path = require('path');

const MEMORY = path.join(__dirname, '../../memory');
const LEARNING = path.join(MEMORY, '.learning');
const TAG_INDEX = path.join(LEARNING, 'tag-index.json');

// 预定义标签→关键词映射
const TAG_RULES = {
  agent:        ['agent', 'subagent', 'orchestration', '多agent', 'openclaw', 'hermes', '编排'],
  feishu:       ['feishu', '飞书', 'lark', '群聊', '机器人', 'webhook'],
  tts:          ['tts', '语音', 'fish.audio', '音色', 'voice', '朗读', '播客'],
  memory:       ['memory', '记忆', 'lifecycle', '归档', '索引', 'pattern'],
  cron:         ['cron', '定时', '计划任务', 'heartbeat', '调度'],
  security:     ['security', '安全', '权限', 'token', 'api key', '审计'],
  server:       ['server', '服务器', 'mac mini', 'frpc', '远程', '运维'],
  learning:     ['learning', '学习', '知识', '蒸馏', 'distillation', '教训'],
  bidding:      ['bidding', '投标', '招标', '采购', '评分', '方案'],
  frontend:     ['frontend', '前端', 'ppt', 'slides', '幻灯片', 'react', 'html'],
  orchestration:['orchestration', '编排', '协作', '中继', 'relay', 'multi-agent'],
  'memory-system': ['memory-system', '记忆系统', '生命周期', 'expiration', '标签', '索引']
};

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return { raw: null, tags: [] };
  const raw = m[0];
  const tagsMatch = m[1].match(/tags:\s*\[(.*?)\]/);
  const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, '')).filter(Boolean) : [];
  return { raw, tags };
}

function extractKeywords(content) {
  const lower = content.toLowerCase();
  const words = new Set();
  // Extract Chinese and English tokens
  const tokens = lower.match(/[a-z0-9_-]+|[\u4e00-\u9fff]+/g) || [];
  tokens.forEach(t => words.add(t));
  return words;
}

function matchTags(keywords) {
  const matched = [];
  for (const [tag, rules] of Object.entries(TAG_RULES)) {
    const hits = rules.filter(r => {
      for (const kw of keywords) {
        if (kw.includes(r.toLowerCase()) || r.toLowerCase().includes(kw)) return true;
      }
      return false;
    });
    if (hits.length >= 1) {
      matched.push({ tag, score: hits.length / rules.length });
    }
  }
  return matched.filter(m => m.score >= 0.1).map(m => m.tag); // low threshold since rules are specific
}

function run() {
  const tagIndex = JSON.parse(fs.readFileSync(TAG_INDEX, 'utf8'));
  const dirs = ['lessons', 'projects', 'patterns'];
  let totalTagged = 0;
  let newTags = 0;
  const allTaggedFiles = {};

  for (const dir of dirs) {
    const dirPath = path.join(MEMORY, dir);
    if (!fs.existsSync(dirPath)) continue;

    for (const file of fs.readdirSync(dirPath).filter(f => f.endsWith('.md') && f !== 'README.md')) {
      const fp = path.join(dirPath, file);
      const content = fs.readFileSync(fp, 'utf8');
      const { tags: existingTags } = parseFrontmatter(content);
      const keywords = extractKeywords(content);
      const suggestedTags = matchTags(keywords);

      // Find new tags not already assigned
      const newForFile = suggestedTags.filter(t => !existingTags.includes(t));
      const allTags = [...new Set([...existingTags, ...suggestedTags])];

      const relativePath = `${dir}/${file}`;

      // Update tag index for all tags (existing + new)
      for (const tag of allTags) {
        if (!tagIndex.tags[tag]) {
          tagIndex.tags[tag] = { count: 0, memories: [], auto_assigned: 0, manual_assigned: 0 };
          newTags++;
        }
        if (!tagIndex.tags[tag].memories.includes(relativePath)) {
          tagIndex.tags[tag].memories.push(relativePath);
          tagIndex.tags[tag].count = tagIndex.tags[tag].memories.length;
          if (newForFile.includes(tag)) {
            tagIndex.tags[tag].auto_assigned++;
          }
        }
      }

      if (newForFile.length > 0) totalTagged++;
      allTaggedFiles[relativePath] = allTags;
    }
  }

  // Recalculate stats
  const totalFiles = Object.keys(allTaggedFiles).length;
  const taggedFiles = Object.values(allTaggedFiles).filter(t => t.length > 0).length;
  const totalAutoAssigned = Object.values(tagIndex.tags).reduce((s, t) => s + t.auto_assigned, 0);
  const totalManual = Object.values(tagIndex.tags).reduce((s, t) => s + t.manual_assigned, 0);

  tagIndex.tag_stats = {
    total_tags: Object.keys(tagIndex.tags).length,
    auto_assigned_ratio: totalAutoAssigned / Math.max(1, totalAutoAssigned + totalManual),
    coverage: totalFiles > 0 ? Math.round((taggedFiles / totalFiles) * 100) / 100 : 0
  };
  tagIndex.last_updated = new Date().toISOString();

  fs.writeFileSync(TAG_INDEX, JSON.stringify(tagIndex, null, 2));

  console.log(JSON.stringify({
    status: 'ok',
    files_scanned: totalFiles,
    files_tagged: totalTagged,
    new_tags: newTags,
    total_tags: tagIndex.tag_stats.total_tags,
    coverage: tagIndex.tag_stats.coverage
  }));
}

run();
