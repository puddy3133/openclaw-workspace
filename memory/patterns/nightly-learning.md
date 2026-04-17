---
task-type: nightly-learning
context: Cron 触发深度学习，批量处理 learning-queue 积压内容
created: 2026-04-16
updated: 2026-04-16
version: 1
tags: [learning, cron, batch-processing]
refs: 0
---

## 场景
Cron 触发夜间深度学习任务，需要处理 learning-queue/scheduled 中积压的待学习内容。

## 方法
1. 运行 nightly-learn.js
2. 清理无效断点（checkpoint.json 中过期条目）
3. 批量处理积压队列（逐条 WebFetch → 三轮过滤 → 归档）
4. 新发现分类：事实性 → lessons/，方法论 → patterns/

## 效果
14 条积压一次性处理完毕，产出 lessons/cli-tools-ecosystem.md，learning-queue 清零。

## 注意事项
- 注意识别已学习内容重复导致的断点卡顿
- 学习完成后必须更新 learning-queue/completed/completion-log.json
- Source URL 必须保留，便于追溯

## 更新记录
- v1 (2026-04-16): 初始创建
