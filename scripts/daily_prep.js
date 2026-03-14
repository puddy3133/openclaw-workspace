#!/usr/bin/env node
/**
 * daily_prep.js — 每日日志内容填充
 * 
 * 在每日记忆日志创建后执行，填充昨日总结和今日计划
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceDir = path.resolve(__dirname, '..');

// 获取北京时间日期字符串
function getBeijingDate(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' });
}

function getYesterdayDate() {
    return getBeijingDate(-1);
}

function getTodayDate() {
    return getBeijingDate(0);
}

// 读取文件内容，不存在返回 null
function readFileSafe(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch {
        return null;
    }
}

// 提取昨日关键信息
function extractYesterdaySummary(content) {
    if (!content) return null;
    
    const lines = content.split('\n');
    const summary = {
        tasks: [],
        notes: [],
        events: []
    };
    
    let inSection = null;
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        // 识别章节
        if (trimmed.startsWith('## ')) {
            const section = trimmed.substring(3).trim();
            if (section.includes('待办') || section.includes('任务')) {
                inSection = 'tasks';
            } else if (section.includes('笔记') || section.includes('记录')) {
                inSection = 'notes';
            } else if (section.includes('事件') || section.includes('会话')) {
                inSection = 'events';
            } else {
                inSection = null;
            }
            continue;
        }
        
        // 收集列表项
        if (inSection && (trimmed.startsWith('- ') || trimmed.startsWith('* '))) {
            const item = trimmed.substring(2).trim();
            if (item && !item.includes('待续') && !item.includes('...')) {
                summary[inSection].push(item);
            }
        }
    }
    
    return summary;
}

// 读取 TASKS.md 获取今日待办
function extractTodayTasks() {
    const tasksFile = path.join(workspaceDir, 'memory', 'TASKS.md');
    const content = readFileSafe(tasksFile);
    
    if (!content) return [];
    
    const lines = content.split('\n');
    const tasks = [];
    let inPending = false;
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('## ')) {
            inPending = trimmed.toLowerCase().includes('待办') || 
                       trimmed.toLowerCase().includes('pending');
            continue;
        }
        
        if (inPending && (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]'))) {
            const task = trimmed.substring(5).trim();
            if (task) tasks.push(task);
        }
    }
    
    return tasks.slice(0, 5); // 最多取5个
}

function dailyPrep() {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    const memoryDir = path.join(workspaceDir, 'memory');
    const todayFile = path.join(memoryDir, `${today}.md`);
    const yesterdayFile = path.join(memoryDir, `${yesterday}.md`);
    
    // 检查今日日志是否存在
    if (!fs.existsSync(todayFile)) {
        console.error(`[daily-prep] 错误：今日日志 ${today}.md 不存在，请先运行 create_daily_log.js`);
        process.exit(1);
    }
    
    // 读取昨日日志
    const yesterdayContent = readFileSafe(yesterdayFile);
    const yesterdaySummary = extractYesterdaySummary(yesterdayContent);
    
    // 读取今日待办
    const todayTasks = extractTodayTasks();
    
    // 生成内容
    let prepContent = '';
    
    // 昨日回顾
    if (yesterdaySummary) {
        const hasContent = yesterdaySummary.tasks.length > 0 || 
                          yesterdaySummary.notes.length > 0 || 
                          yesterdaySummary.events.length > 0;
        
        if (hasContent) {
            prepContent += `\n## 昨日回顾 (${yesterday})\n\n`;
            
            if (yesterdaySummary.tasks.length > 0) {
                prepContent += `**完成任务：**\n`;
                yesterdaySummary.tasks.slice(0, 3).forEach(task => {
                    prepContent += `- ${task}\n`;
                });
                prepContent += '\n';
            }
            
            if (yesterdaySummary.events.length > 0) {
                prepContent += `**关键事件：**\n`;
                yesterdaySummary.events.slice(0, 3).forEach(event => {
                    prepContent += `- ${event}\n`;
                });
                prepContent += '\n';
            }
        } else {
            prepContent += `\n## 昨日回顾 (${yesterday})\n\n昨日无详细记录。\n\n`;
        }
    } else {
        prepContent += `\n## 昨日回顾\n\n昨日日志不存在或为空。\n\n`;
    }
    
    // 今日计划
    prepContent += `## 今日计划\n\n`;
    if (todayTasks.length > 0) {
        prepContent += `**来自 TASKS.md 的待办：**\n`;
        todayTasks.forEach(task => {
            prepContent += `- [ ] ${task}\n`;
        });
        prepContent += '\n';
    } else {
        prepContent += `**待办：**\n- [ ] （暂无待办任务，请检查 TASKS.md）\n\n`;
    }
    
    // 自我进化准备
    prepContent += `## 自我进化准备\n\n`;
    prepContent += `- [ ] 检查昨日执行效率\n`;
    prepContent += `- [ ] 识别可优化流程\n`;
    prepContent += `- [ ] 更新 MEMORY.md 如有新发现\n\n`;
    
    // 读取现有文件内容
    let existingContent = fs.readFileSync(todayFile, 'utf8');
    
    // 在 "## 会话记录" 之前插入新内容
    const insertMarker = '## 会话记录';
    const insertIndex = existingContent.indexOf(insertMarker);
    
    if (insertIndex !== -1) {
        const before = existingContent.substring(0, insertIndex);
        const after = existingContent.substring(insertIndex);
        existingContent = before + prepContent + after;
    } else {
        // 如果没找到标记，追加到文件末尾（在更新时间之前）
        const updateMarker = '*更新时间';
        const updateIndex = existingContent.indexOf(updateMarker);
        if (updateIndex !== -1) {
            const before = existingContent.substring(0, updateIndex);
            const after = existingContent.substring(updateIndex);
            existingContent = before + prepContent + '\n' + after;
        } else {
            existingContent += '\n' + prepContent;
        }
    }
    
    // 写回文件
    fs.writeFileSync(todayFile, existingContent, 'utf8');
    
    console.log(`[daily-prep] 已填充 ${today}.md 内容`);
    console.log(`[daily-prep] - 昨日回顾: ${yesterdaySummary ? '已生成' : '无数据'}`);
    console.log(`[daily-prep] - 今日计划: ${todayTasks.length} 项任务`);
    console.log(`[daily-prep] - 自我进化: 已添加检查项`);
    
    return { success: true, file: todayFile };
}

// 执行
dailyPrep();
