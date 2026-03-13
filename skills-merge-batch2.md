# 技能合并与第二批移植方案

## 🔧 相似 Skills 合并分析

### 1. 浏览器自动化类

| Skill | 技术栈 | 特点 | 建议 |
|-------|--------|------|------|
| agent-browser | Rust + Node.js | 快速、结构化命令 | ✅ 保留（系统级） |
| playwright-headless-browser | Playwright | WSL/Linux 专用配置 | ✅ 保留（系统级） |
| browser-tool (Kimi) | Playwright + Python | 中文、平台适配 | ⏳ 暂不移植（功能重叠） |

**合并决策**: 现有 agent-browser 和 playwright-headless-browser 已覆盖需求，browser-tool 暂不移植。

### 2. 内容提取/总结类

| Skill | 功能 | 特点 | 建议 |
|-------|------|------|------|
| summarize | URL/文件总结 | 通用、支持多格式 | ✅ 保留（系统级） |
| web-content-master (Kimi) | 平台智能识别 | 微信/小红书/B站/飞书专用 | ⭐ 建议移植（差异化） |

**合并决策**: summarize 是通用工具，web-content-master 是垂直领域专用，两者互补，建议移植。

---

## 📦 第二批 Skills 移植清单

基于飞书用户场景，推荐以下 skills：

### 核心飞书增强（推荐）

| 技能 | 功能 | 优先级 | 原因 |
|------|------|--------|------|
| **feishu-messaging** | 飞书消息发送封装 | ⭐⭐⭐ | 简化消息发送 |
| **feishu-card-message** | 飞书卡片消息 | ⭐⭐⭐ | 富文本消息 |
| **feishu-group-intelligence** | 飞书群智能感知 | ⭐⭐ | 群成员识别 |
| **feishu-doc-sync** | 飞书文档同步 | ⭐⭐ | 文档操作 |

### 内容工具（按需）

| 技能 | 功能 | 优先级 | 原因 |
|------|------|--------|------|
| **web-content-master** | 网页内容提取 | ⭐⭐⭐ | 微信/小红书/B站专用 |
| **bot-social** | 机器人社交 | ⭐ | 群聊机器人互动 |

---

## 🚀 执行计划

### 步骤 1：创建合并说明
- [x] 分析相似 skills
- [x] 制定合并策略
- [ ] 更新技能索引文档

### 步骤 2：第二批移植
- [ ] feishu-messaging
- [ ] feishu-card-message
- [ ] feishu-group-intelligence
- [ ] feishu-doc-sync
- [ ] web-content-master（可选）

### 步骤 3：更新文档
- [ ] 更新 memory/INDEX.md
- [ ] 更新 memory/TASKS.md
- [ ] 更新今日日志

---

## 📝 合并后 Skills 清单

### 系统级 Skills（~/.openclaw/skills/）
- brave-search ✅
- summarize ✅
- agent-browser ✅
- playwright-headless-browser ✅
- weekly-report ✅
- writing-assistant ✅
- ui-design ✅
- version-planner ✅
- prd-doc-writer ✅
- project-map-builder ✅
- req-change-workflow ✅
- self-improving-agent ✅
- skill-vetter ✅
- task-status ✅
- thinking-partner ✅
- thought-mining ✅
- data-analyst ✅
- image-assistant ✅
- priority-judge ✅
- weather ✅
- clawdhub ✅

### 工作区 Skills（~/.openclaw/workspace/skills/）
- memory-system ✅
- metadata-reader ✅
- openclaw-doc ✅
- context-manager ✅
- feishu-api ✅
- feishu-user-id ✅
- feishu-messaging ⏳（第二批）
- feishu-card-message ⏳（第二批）
- feishu-group-intelligence ⏳（第二批）
- feishu-doc-sync ⏳（第二批）
- web-content-master ⏳（第二批，可选）

---

*分析时间: 2026-02-27 | 分析师: 小乔*
