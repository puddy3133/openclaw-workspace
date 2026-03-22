#!/usr/bin/env node
/**
 * 记忆文件新鲜度检查脚本
 * 
 * 功能：
 * 1. 扫描 memory/lessons/、memory/projects/、memory/people/ 目录
 * 2. 检查文件最后修改时间
 * 3. 超过 30 天未更新的，添加 STALE 标记
 * 4. 生成报告
 * 
 * 用法：node memory-freshness.js [--mark-stale]
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  workspaceDir: process.env.OPENCLAW_WORKSPACE || path.join(process.env.HOME, '.openclaw', 'workspace'),
  staleDays: 30,
  staleMarker: '<!-- STALE: last updated {date} -->',
  directories: [
    'memory/lessons',
    'memory/projects', 
    'memory/people'
  ]
};

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getFileAge(filepath) {
  const stats = fs.statSync(filepath);
  const mtime = stats.mtime;
  const now = new Date();
  const ageDays = (now - mtime) / (1000 * 60 * 60 * 24);
  return {
    mtime: mtime.toISOString().split('T')[0],
    ageDays: Math.floor(ageDays)
  };
}

function markAsStale(filepath, mtime) {
  const content = fs.readFileSync(filepath, 'utf8');
  const staleTag = CONFIG.staleMarker.replace('{date}', mtime);
  
  // 检查是否已有 STALE 标记
  if (content.includes('<!-- STALE:')) {
    return false; // 已标记
  }
  
  // 在文件开头添加 STALE 标记
  const newContent = `${staleTag}\n\n${content}`;
  fs.writeFileSync(filepath, newContent, 'utf8');
  return true;
}

function scanDirectory(dirPath) {
  const results = [];
  
  if (!fs.existsSync(dirPath)) {
    return results;
  }
  
  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(dirPath, f));
  
  for (const file of files) {
    const { mtime, ageDays } = getFileAge(file);
    const relativePath = path.relative(CONFIG.workspaceDir, file);
    
    results.push({
      path: relativePath,
      mtime,
      ageDays,
      isStale: ageDays > CONFIG.staleDays
    });
  }
  
  return results;
}

function main() {
  const markStale = process.argv.includes('--mark-stale');
  const report = {
    date: getToday(),
    staleThreshold: `${CONFIG.staleDays} days`,
    directories: [],
    summary: {
      totalFiles: 0,
      staleFiles: 0,
      freshFiles: 0
    }
  };
  
  console.log(`[memory-freshness] 检查记忆文件新鲜度（阈值: ${CONFIG.staleDays} 天）\n`);
  
  for (const dir of CONFIG.directories) {
    const dirPath = path.join(CONFIG.workspaceDir, dir);
    const files = scanDirectory(dirPath);
    
    if (files.length === 0) {
      console.log(`📁 ${dir}: 无文件`);
      continue;
    }
    
    console.log(`\n📁 ${dir} (${files.length} 个文件):`);
    
    const staleFiles = files.filter(f => f.isStale);
    const freshFiles = files.filter(f => !f.isStale);
    
    report.directories.push({
      path: dir,
      total: files.length,
      stale: staleFiles.length,
      fresh: freshFiles.length,
      files: files
    });
    
    report.summary.totalFiles += files.length;
    report.summary.staleFiles += staleFiles.length;
    report.summary.freshFiles += freshFiles.length;
    
    for (const file of files) {
      const status = file.isStale ? '⚠️ STALE' : '✅';
      console.log(`  ${status} ${file.path} (${file.ageDays} 天前更新)`);
      
      if (markStale && file.isStale) {
        const marked = markAsStale(path.join(CONFIG.workspaceDir, file.path), file.mtime);
        if (marked) {
          console.log(`    → 已添加 STALE 标记`);
        }
      }
    }
  }
  
  console.log(`\n📊 总结:`);
  console.log(`   总文件: ${report.summary.totalFiles}`);
  console.log(`   新鲜: ${report.summary.freshFiles}`);
  console.log(`   过期: ${report.summary.staleFiles}`);
  
  // 保存报告
  const reportDir = path.join(CONFIG.workspaceDir, 'memory', 'reports');
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `freshness-${getToday()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 报告已保存: ${reportPath}`);
  
  return report;
}

main();
