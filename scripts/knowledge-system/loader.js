#!/usr/bin/env node
/**
 * 知识加载器
 * 按需加载记忆文件
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, '../../memory');

// 加载人物信息
function loadPerson(name) {
  const files = [
    path.join(MEMORY_DIR, 'people', `${name}.md`),
    path.join(MEMORY_DIR, 'people', `${name.toLowerCase()}.md`)
  ];
  
  for (const file of files) {
    if (fs.existsSync(file)) {
      return {
        name,
        content: fs.readFileSync(file, 'utf8'),
        path: file
      };
    }
  }
  
  return null;
}

// 加载项目信息
function loadProject(projectName) {
  const file = path.join(MEMORY_DIR, 'projects', `${projectName}.md`);
  if (fs.existsSync(file)) {
    return {
      name: projectName,
      content: fs.readFileSync(file, 'utf8'),
      path: file
    };
  }
  return null;
}

// 搜索索引
function searchIndex(keyword) {
  // 读取人物索引
  const peopleIndex = JSON.parse(
    fs.readFileSync(path.join(MEMORY_DIR, '.index/people-relations.json'), 'utf8')
  );
  
  // 读取项目索引
  const projectIndex = JSON.parse(
    fs.readFileSync(path.join(MEMORY_DIR, '.index/project-tags.json'), 'utf8')
  );
  
  // 读取学习索引
  const learningIndex = JSON.parse(
    fs.readFileSync(path.join(MEMORY_DIR, '.index/learning-index.json'), 'utf8')
  );
  
  const results = {
    people: [],
    projects: [],
    lessons: []
  };
  
  // 搜索人物
  for (const [name, info] of Object.entries(peopleIndex.people || {})) {
    if (name.includes(keyword) || 
        info.tags?.some(t => t.includes(keyword)) ||
        info.aliases?.some(a => a.includes(keyword))) {
      results.people.push({ name, ...info });
    }
  }
  
  // 搜索项目
  for (const [name, info] of Object.entries(projectIndex.projects || {})) {
    if (name.includes(keyword) || 
        info.tags?.some(t => t.includes(keyword))) {
      results.projects.push({ name, ...info });
    }
  }
  
  // 搜索学习内容
  const learningIds = learningIndex.keywords[keyword] || [];
  results.lessons = learningIds.map(id => ({
    id,
    path: path.join(MEMORY_DIR, 'learning-queue/completed', id)
  }));
  
  return results;
}

// 加载经验教训
function loadLessons() {
  const file = path.join(MEMORY_DIR, 'lessons/learned.md');
  if (fs.existsSync(file)) {
    return fs.readFileSync(file, 'utf8');
  }
  return null;
}

module.exports = {
  loadPerson,
  loadProject,
  searchIndex,
  loadLessons
};
