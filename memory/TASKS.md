# 活跃任务清单 - 小乔

> 当前进行中的任务和待办事项

## ✅ 最近完成

### 1. 小乔进化计划
- **状态**: ✅ 全部完成
- **开始时间**: 2026-02-27
- **完成时间**: 2026-02-27
- **描述**: 学习 Kimi Claw 进化经验，升级人格、记忆、技能系统
- **子任务**:
  - [x] 阶段 A：人格系统升级
  - [x] 阶段 B：记忆系统升级
  - [x] 阶段 C：技能库扩展（全部完成）
- **已移植 Skills（第一批 5个）**:
  - [x] metadata-reader, openclaw-doc, context-manager, feishu-api, feishu-user-id
- **已移植 Skills（第二批 5个）**:
  - [x] feishu-messaging, feishu-card-message, feishu-group-intelligence, feishu-doc-sync, web-content-master
- **已移植 Skills（第三批 6个）**:
  - [x] knowledge-site-creator, aetherviz, pages-mcp-deploy, video-analyzer-douyin, bot-social, xiaohongshu-automation
- **合并决策**:
  - [x] browser-tool → 与 agent-browser 合并（保留现有）
  - [x] frontend-aesthetics → 融入 ui-design ✅（完成）
  - [x] senior-frontend-aesthetics → 融入 ui-design ✅（完成）
  - [x] infographic-prompt-generator → 融入 image-assistant
- **跳过（需额外API）**:
  - [x] nanobanana-infographic, xiaohongshu-automation, moltbook-reporter, youmind
- **跳过（已集成）**:
  - [x] security-hardening, access-guard

### 2. 自动维护任务设置
- **状态**: ✅ 已完成
- **描述**: 设置 cron 任务自动维护记忆系统
- **已设置任务**:
  - [x] 每日记忆日志创建（每天凌晨 2:00）
  - [x] 每周记忆回顾（每周日上午 10:00）
  - [x] 每小时安全自检（每小时整点）

### 3. 2026-W10 周回顾
- **状态**: ✅ 已完成
- **时间**: 2026-03-02
- **描述**: 完成本周记忆回顾，生成周总结并更新 MEMORY.md

## 🚀 进行中

（暂无）

## 📋 待开始

（暂无）

---

## 📝 问题追踪

### 待解决问题

| 问题 | 记录时间 | 触发提醒条件 | 解决方案 | 相关文件 |
|------|---------|-------------|---------|---------|
| 图片生成：无法直接使用 Google Pro 账号的 Nano Banana 网页版生图 | 2026-03-01 | 提及图片/生图/图像/nano-banana/openai-image-gen | 待决策：1)获取Google API Key 2)浏览器自动化改造 | nano-banana-pro skill, openai-image-gen skill |
| EvoMap 500 错误 | 2026-02-24 | EvoMap 任务执行 | 监控服务器状态，等待恢复后重试 | evomap_automation/ |
| self-evo-weekly-retro 超时 | 2026-04-16 | weekly retro 执行 | 已调整 timeout→240s，待验证下次运行 | cron/jobs.json |
| inspector-weekly-scan 超时 | 2026-04-16 | weekly inspector 执行 | 已调整 timeout→240s，待验证下次运行 | cron/jobs.json |
| pattern-analyzer 超时（首次）| 2026-04-16 | 每日 09:00 触发 | 已调整 timeout→240s，待验证 | cron/jobs.json |
| auto-tagger 超时（首次）| 2026-04-16 | 每日 10:00 触发 | 已调整 timeout→240s，待验证 | cron/jobs.json |
| consolidation-analyzer 超时（首次）| 2026-04-16 | 每周日 08:00 触发 | 已调整 timeout→240s，待验证 | cron/jobs.json |
| learning-metrics 超时（首次）| 2026-04-16 | 每周日 09:00 触发 | 已调整 timeout→240s，待验证 | cron/jobs.json |
| recommendation-generator 超时（首次）| 2026-04-16 | 每周日 10:00 触发 | 已调整 timeout→240s，待验证 | cron/jobs.json |
| ~~定时任务 self-evo-tune 超时失败~~ | ~~2026-03-08~~ | - | ✅ 已修复：超时时间 120s→300s | cron/jobs.json |
| ~~缺少每日记忆日志创建任务~~ | ~~2026-03-08~~ | - | ✅ 已修复：添加 create-daily-log 任务，每天凌晨 2:00 执行 | jobs.json |
| ~~时间显示时区混乱~~ | ~~2026-03-08~~ | - | ✅ 已修复：更新 rules.md，强制使用 Asia/Shanghai 时区 | rules.md |
| ~~每日复盘模型指定问题~~ | ~~2026-03-08~~ | - | ✅ 已修复：daily_reflection.js 现在读取系统主模型配置 | daily_reflection.js |
| ~~Skill 自动触发机制不清晰~~ | ~~2026-03-08~~ | - | ✅ 已修复：创建 skill-auto-trigger.json 语义识别配置 | skill-auto-trigger.json |
| ~~插件/Skill 调用反馈缺失~~ | ~~2026-03-08~~ | - | ✅ 已修复：openclaw.json 添加 showToolCalls 配置 | openclaw.json |
| ~~网关重启问题~~ | ~~2026-03-08~~ | - | ✅ 已修复：网关实际运行正常，cron 任务已重新加载 | - |
| ~~每日复盘数据源问题~~ | ~~2026-03-08~~ | - | ✅ 已修复：daily_reflection.js 现在从 agent_sessions 目录读取对话记录 | daily_reflection.js |

### 已解决问题

| 问题 | 记录时间 | 解决时间 | 解决方案 |
|------|---------|---------|---------|
| (暂无) | - | - | - |

### 问题追踪规则

1. **记录位置**：所有待办问题统一记录在 TASKS.md，不分散到 STATE.md 或每日日志
2. **提醒机制**：达到触发条件时主动提醒用户
3. **自动移除**：问题解决后，自动从「待解决」移到「已解决」，并更新解决时间和方案
4. **单一数据源**：TASKS.md 是问题追踪的唯一权威来源

---

*此文件实时更新，Heartbeat 时会检查任务状态*
