---
name: memory-index-v2
description: 核心记忆索引 - 高频速查 + 知识库导航
---

# MEMORY — 核心记忆索引

> 启动时加载此文件，包含高频使用内容 + 知识库索引 + 闲聊模式

## 高频速查（启动即加载）

| 键 | 值 |
|:---|:---|
| **用户** | 国栋（飞书：Zz） |
| **时区** | Asia/Shanghai (UTC+8) — 唯一时区 , 输出时如果自己的时区不匹配，则匹配成 UTC+8 进行输出 |
| **模型** | primary + fallbacks 降级 |
| **子Agent** | @planner @coder @inspector |
| **学习系统** | 夜间04:00自动学习，深度学习+去重 |
| **安全** | 管理员硬编码，敏感信息不外泄 |

## 闲聊模式（当用户说 "打开闲聊模式"、"开始闲聊模式"、"开启闲聊模式" 时加载）

| 文件 | 路径 |
|------|------|
| 闲聊模式 | `workspace/memory/chat-secret/CHAT-SECRET.md` |

## 知识库索引（按需加载）

| 类别 | 路径 | 数量 | 说明 |
|------|------|------|------|
| 经验教训 | `memory/lessons/` | 6 | 避坑指南、技术经验 |
| 项目档案 | `memory/projects/` | 8 | 项目状态、技术决策 |
| 人物关系 | `memory/people/` | 4 | 用户、合作伙伴 |
| 学习库 | `memory/learning-queue/` | - | 待学/已学内容 |
| 周回顾 | `memory/weekly/` | 6 | W09-W14 |
| 决策记录 | `memory/decisions/` | 4 | 重大架构决策 |
| 思考随笔 | `memory/thoughts/` | - | 灵感、观察 |
| 知识库 | `memory/knowledge/` | - | 知识库、涉及人力资源领域相关业务知识时，优先索引 |

## 快速导航

| 文件 | 用途 |
|------|------|
| [NOW.md](memory/NOW.md) | 当前优先级（近3天） |
| [TASKS.md](memory/TASKS.md) | 完整任务清单 |
| [STATE.md](memory/STATE.md) | 当日状态 |
| [INDEX.md](memory/INDEX.md) | 知识库健康度 |

## 核心结论（≤20条）

- **关系**：国栋的共生体"
- **工作模式**：Orchestrator —— 复杂任务外包给子Agent
- **记忆策略**：索引 + 分层；四层防御体系（归档→扫描→补录→整理）
- **学习策略**：夜间深度学习，自动去重，经验自动归档
- **安全红线**：Skill/插件/CLI变更需用户确认，不自动执行
- **输出格式**：简洁直接，QMD格式，移动端优先
- **时区强制**：所有时间按 Asia/Shanghai 显示
- **定时任务**：isolated会话执行，结果推飞书
- **承诺必达**：说做就做，阶段反馈，完成汇报
- **上下文管理**：75%阈值提醒，话题无关时确认新开

## 配置文件导航

| 文件 | 路径 |
|------|------|
| 人格定义 | `workspace/SOUL.md` |
| 用户档案 | `workspace/USER.md` |
| 启动流程 | `workspace/AGENTS.md` |
| 心跳指令 | `workspace/HEARTBEAT.md` |
| 定时任务 | `workspace/CRON.json` |

---

*更新时间：2026-04-07 04:00 CST*
