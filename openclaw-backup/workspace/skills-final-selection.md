# 按用户策略处理后的 Skills 清单

## 🎯 处理策略

1. **跳过需要额外 API/账号的** ❌
2. **合并功能重复的** 🔀
3. **保留高价值且独立的** ✅

---

## 📋 第三批 Skills 逐一分析

| 技能 | 需要额外API？ | 功能重复？ | 决策 |
|------|--------------|-----------|------|
| **infographic-prompt-generator** | ❌ 不需要 | ⚠️ 与 image-assistant 部分重叠 | 🔀 **合并** |
| **nanobanana-infographic** | ✅ 需要 nanobanana API | - | ❌ **跳过** |
| **video-analyzer-douyin** | ❌ 不需要 | ✅ 独立功能 | ✅ **保留** |
| **xiaohongshu-automation** | ✅ 需要小红书账号 | - | ❌ **跳过** |
| **knowledge-site-creator** | ❌ 不需要 | ✅ 独立功能 | ✅ **保留** |
| **frontend-aesthetics** | ❌ 不需要 | ⚠️ 与 ui-design 重叠 | 🔀 **合并** |
| **senior-frontend-aesthetics** | ❌ 不需要 | ⚠️ 与 ui-design 重叠 | 🔀 **合并** |
| **pages-mcp-deploy** | ❌ 不需要 | ✅ 独立功能 | ✅ **保留** |
| **moltbook-reporter** | ✅ 需要 Moltbook 账号 | - | ❌ **跳过** |
| **aetherviz-master** | ❌ 不需要 | ✅ 独立功能 | ✅ **保留** |
| **youmind** | ✅ 需要 Youmind 账号 | - | ❌ **跳过** |
| **bot-social** | ❌ 不需要 | ✅ 独立功能 | ⚠️ **可选** |
| **security-hardening** | ❌ 不需要 | ⚠️ 已集成到 SOUL.md | ❌ **跳过** |
| **access-guard** | ❌ 不需要 | ⚠️ 已集成到 SOUL.md | ❌ **跳过** |
| **browser-tool** | ❌ 不需要 | ⚠️ 与 agent-browser 重叠 | 🔀 **合并** |

---

## ✅ 最终推荐移植（4个）

| 技能 | 功能 | 原因 |
|------|------|------|
| **knowledge-site-creator** | 一句话生成知识网站 | 独立功能，高价值 |
| **aetherviz-master** | 互动教育可视化 | 独立功能，高价值 |
| **pages-mcp-deploy** | EdgeOne Pages 部署 | 独立功能，实用 |
| **video-analyzer-douyin** | 抖音视频分析 | 独立功能，内容提取 |

**可选**：
| 技能 | 功能 | 原因 |
|------|------|------|
| **bot-social** | 机器人社交 | 独立功能，但场景有限 |

---

## 🔀 合并方案

### 1. 前端设计类合并
**现有**: ui-design
**Kimi Claw**: frontend-aesthetics + senior-frontend-aesthetics

**合并策略**:
- 保留 ui-design 作为主要 skill
- 参考 Kimi Claw 的 aesthetics 理念，丰富 ui-design 的 SKILL.md
- 添加「参考对象」部分（Dieter Rams 等）

### 2. 信息图类合并
**现有**: image-assistant
**Kimi Claw**: infographic-prompt-generator

**合并策略**:
- 保留 image-assistant 作为主要 skill
- 参考 infographic-prompt-generator 的 Prompt 工程方法
- 添加「信息图专用 Prompt 模板」

### 3. 浏览器类合并
**现有**: agent-browser + playwright-headless-browser
**Kimi Claw**: browser-tool

**合并策略**:
- 保留现有 agent-browser（功能更强）
- 无需移植 browser-tool

---

## 📊 最终 Skills 清单

### 系统级 Skills（20个，保持不变）
brave-search, summarize, agent-browser, playwright-headless-browser, weekly-report, writing-assistant, ui-design, version-planner, prd-doc-writer, project-map-builder, req-change-workflow, self-improving-agent, skill-vetter, task-status, thinking-partner, thought-mining, data-analyst, image-assistant, priority-judge, weather, clawdhub

### 工作区 Skills（15个）

**已移植（11个）**:
1. memory-system
2. metadata-reader
3. openclaw-doc
4. context-manager
5. feishu-api
6. feishu-user-id
7. feishu-messaging
8. feishu-card-message
9. feishu-group-intelligence
10. feishu-doc-sync
11. web-content-master

**新移植（4个）**:
12. knowledge-site-creator ⭐
13. aetherviz-master ⭐
14. pages-mcp-deploy ⭐
15. video-analyzer-douyin ⭐

**可选（1个）**:
16. bot-social

---

## 🎯 总结

| 类别 | 数量 |
|------|------|
| 系统级 Skills | 20 |
| 工作区 Skills | 15（或16）|
| **总计** | **35（或36）** |

**处理结果**:
- ✅ 保留了所有核心功能
- ✅ 避免了 API 依赖
- ✅ 合并了重复功能
- ✅ 保持了精简（比全部移植少 11 个）

**小乔不会为难** 😊
