# 永续Agent架构 - 项目档案

> 项目级别的长期记忆

## 项目概述

**名称**：永续Agent架构 v2.0

**目标**：解决Agent跨会话"失忆"问题，实现永续记忆能力

**核心洞察**：失忆的本质是Context压缩时丢失了"当前状态"的完整快照

## 架构设计

### 三层架构

1. **状态层（State Layer）**
   - .state/current.md: 当前会话状态
   - .state/focus.md: 当前专注任务
   - .state/context-summary.md: 上下文压缩摘要

2. **任务层（Task Layer）**
   - tasks/inbox.md: 快速收集
   - tasks/active/: 进行中任务
   - tasks/waiting/: 等待外部输入
   - tasks/recurring/: 周期性任务
   - tasks/archive/: 已完成任务

3. **记忆层（Memory Layer）**
   - memory/YYYY-MM-DD.md: 每日日志
   - memory/weekly/: 周回顾
   - memory/people/: 人物档案
   - memory/projects/: 项目档案
   - memory/INDEX.md: 快速索引

## 关键决策

| 日期 | 决策 | 原因 |
|-----|------|------|
| 2026-02-22 | 三层架构设计 | 分层读取，按需加载 |
| 2026-02-22 | 状态显性化 | 所有可能丢失的状态都写入文件 |
| 2026-02-22 | 单任务聚焦 | 避免多线程混乱 |

## 启动恢复流程

1. 读 SOUL.md → 我是谁
2. 读 USER.md → 我在帮谁
3. 读 .state/current.md → 我之前在干嘛
4. 读 memory/INDEX.md → 快速定位关键信息
5. 读今天/昨天的 daily log → 最近发生了什么
6. 扫 tasks/active/ → 列出当前任务
7. 生成启动摘要："我回来了，当前状态是..."

## Heartbeat 策略

- **30分钟巡检**：轻量检查，生成报告不执行
- **深夜归档**：深度整理，生成次日简报

## 状态

**当前状态**：进行中

**创建时间**：2026-02-22

**最后更新**：2026-02-22

---

*此文件记录项目的长期记忆，供后续参考*
