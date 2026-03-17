#!/usr/bin/env node

/**
 * 记忆强制归档脚本
 * 任务完成后自动调用
 * 
 * 用法：node memory-flush.js '{"summary":"任务摘要","result":"结果","decision":false,"issue":false,"lesson":false}'
 */

const fs = require('fs');
const path = require('path');

// 配置
const MEMORY_DIR = path.join(__dirname, '../memory');
const TODAY = new Date().toISOString().split('T')[0];
const TIME = new Date().toTimeString().slice(0, 5);

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 确保文件存在
function ensureFile(file, content) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, content, 'utf8');
    return true;
  }
  return false;
}

// 追加到文件
function appendToFile(file, content) {
  fs.appendFileSync(file, content, 'utf8');
}

// 获取今日日志模板
function getLogTemplate() {
  return `# ${TODAY} 记忆日志

## 今日启动

- **时间**: ${new Date().toISOString()}
- **状态**: 正常启动

## 任务记录

`;
}

// 格式化任务条目
function formatTaskEntry(task) {
  return `- [${TIME}] ${task.summary} - ${task.result}\n`;
}

// 归档决策
function archiveDecision(decision) {
  const decisionsDir = path.join(MEMORY_DIR, 'decisions');
  ensureDir(decisionsDir);
  
  const slug = decision.title.toLowerCase().replace(/\s+/g, '-').substring(0, 50);
  const file = path.join(decisionsDir, `${TODAY}-${slug}.md`);
  
  const content = `# ${decision.title}

**日期**: ${TODAY}
**时间**: ${TIME}

## 决策内容

${decision.content}

## 影响

${decision.impact || '待补充'}

---
`;
  
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

// 归档问题
function archiveIssue(issue) {
  const tasksFile = path.join(MEMORY_DIR, 'TASKS.md');
  ensureFile(tasksFile, '# TASKS.md - 任务追踪\n\n## 待办\n\n## 已完成\n\n');
  
  const entry = `- [ ] ${issue.description}（${TODAY} ${TIME}发现）\n`;
  // 插入到"待办"部分
  let content = fs.readFileSync(tasksFile, 'utf8');
  content = content.replace('## 待办\n', `## 待办\n${entry}`);
  fs.writeFileSync(tasksFile, content, 'utf8');
  
  return tasksFile;
}

// 归档经验
function archiveLesson(lesson) {
  const lessonsFile = path.join(MEMORY_DIR, 'lessons/learned.md');
  ensureDir(path.dirname(lessonsFile));
  ensureFile(lessonsFile, '# 经验教训\n\n');
  
  const entry = `\n## ${TODAY} ${TIME}\n\n${lesson.content}\n\n**场景**: ${lesson.context || '通用'}\n`;
  appendToFile(lessonsFile, entry);
  
  return lessonsFile;
}

// 主函数
async function archiveTask(taskInfo) {
  const results = {
    logged: false,
    locations: [],
    entries: 0
  };
  
  // 1. 确保今日日志存在
  const todayLog = path.join(MEMORY_DIR, `${TODAY}.md`);
  const isNew = ensureFile(todayLog, getLogTemplate());
  if (isNew) {
    results.locations.push(todayLog);
  }
  
  // 2. 写入任务记录
  const entry = formatTaskEntry(taskInfo);
  appendToFile(todayLog, entry);
  results.entries++;
  results.logged = true;
  
  // 3. 分类归档（如有）
  if (taskInfo.decision) {
    const loc = archiveDecision(taskInfo.decision);
    results.locations.push(loc);
  }
  
  if (taskInfo.issue) {
    const loc = archiveIssue(taskInfo.issue);
    results.locations.push(loc);
  }
  
  if (taskInfo.lesson) {
    const loc = archiveLesson(taskInfo.lesson);
    results.locations.push(loc);
  }
  
  // 4. 更新索引
  await updateIndex(taskInfo);
  
  return results;
}

// 更新关键词索引
async function updateIndex(taskInfo) {
  const indexDir = path.join(MEMORY_DIR, '.index');
  ensureDir(indexDir);
  
  const indexFile = path.join(indexDir, 'keywords.json');
  let index = {};
  
  if (fs.existsSync(indexFile)) {
    index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  }
  
  // 提取关键词（简单实现：分词取名词）
  const text = `${taskInfo.summary} ${taskInfo.result}`;
  const keywords = extractKeywords(text);
  
  // 更新索引
  keywords.forEach(keyword => {
    if (!index[keyword]) {
      index[keyword] = [];
    }
    if (!index[keyword].includes(TODAY)) {
      index[keyword].push(TODAY);
    }
  });
  
  fs.writeFileSync(indexFile, JSON.stringify(index, null, 2), 'utf8');
}

// 简单关键词提取
function extractKeywords(text) {
  // 简单的关键词提取：取长度>2的中文词和英文单词
  const words = text.match(/[\u4e00-\u9fa5]{2,}|[a-zA-Z]{3,}/g) || [];
  return [...new Set(words)].slice(0, 5); // 去重，最多5个
}

// 执行
if (require.main === module) {
  const taskInfo = JSON.parse(process.argv[2] || '{}');
  archiveTask(taskInfo)
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error('归档失败:', err);
      process.exit(1);
    });
}

module.exports = { archiveTask, updateIndex };
