#!/usr/bin/env node
/**
 * create_daily_log.js — 每日记忆日志自动创建
 * 
 * 在每天凌晨自动创建当天的记忆日志文件
 * 如果文件已存在则跳过
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceDir = path.resolve(__dirname, '..');

// 获取北京时间日期字符串
function getBeijingDate() {
    return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' });
}

function getBeijingDateTime() {
    return new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
}

// 获取星期几
function getWeekday() {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const d = new Date();
    // 使用北京时间计算
    const beijingTime = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    return weekdays[beijingTime.getDay()];
}

function createDailyLog() {
    const dateStr = getBeijingDate();
    const weekday = getWeekday();
    const memoryDir = path.join(workspaceDir, 'memory');
    const logFile = path.join(memoryDir, `${dateStr}.md`);
    
    // 确保目录存在
    fs.mkdirSync(memoryDir, { recursive: true });
    
    // 如果文件已存在，跳过
    if (fs.existsSync(logFile)) {
        console.log(`[create-daily-log] ${dateStr} 日志已存在，跳过创建`);
        return { skipped: true, file: logFile };
    }
    
    // 创建日志模板
    const template = `# ${dateStr} - ${weekday}

> 北京时间 ${getBeijingDateTime()} 自动创建

## 启动检查

- [ ] 昨日记忆日志检查
- [ ] 今日日志创建：完成
- [ ] TASKS.md 检查

## 会话记录

*(待续...)*

---

## 今日复盘

*(23:30 自动复盘后更新)*
`;
    
    fs.writeFileSync(logFile, template, 'utf8');
    console.log(`[create-daily-log] 已创建 ${dateStr} 记忆日志: ${logFile}`);
    
    return { success: true, file: logFile, date: dateStr };
}

// 执行
createDailyLog();
