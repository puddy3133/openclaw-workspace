# Heartbeat Instructions

Check the following items and report ONLY if something needs attention.

## Check Items

### 1. 定时任务遗漏检查
- 检查 `memory/cron-reports/` 目录，昨日有无定时任务失败报告
- 检查昨日 `memory/YYYY-MM-DD.md` 是否存在，不存在则提醒
- 如果是周一，检查上周 `memory/weekly/YYYY-Www.md` 是否存在

### 2. 待办提醒
- 检查 `memory/TASKS.md` 中有无触发条件已满足的待解决问题
- 检查有无用户设置的到期提醒
- 快到期的待办提前提醒

### 3. 每日总结（下班后）
- 如果是 18:00+ 且今日无每日总结发送，准备简洁的一句话工作回顾+明天待办

### 4. 跟进事项
- 检查近期对话是否有承诺但未完成的事项

### 5. 记忆日志检查
- 今日 `memory/YYYY-MM-DD.md` 是否存在，如不存在则新建

### 6. 记忆整理
- 扫描近期 daily logs，识别值得长期保留的内容
- 将重要信息整理并更新到 MEMORY.md

### 7. 邮件/日程检查
- 检查是否有紧急邮件未读
- 检查未来24小时内重要日程
- 有紧急事项即时提醒

## Response Rules

- 无需汇报的事项，只回复：HEARTBEAT_OK
- 有事项汇报时直接说明，不要以"我检查了..."开头
- 优先级：定时任务失败 > 到期提醒 > 待办问题 > 每日总结

## 当前定时任务清单（CRON.json）

| 任务 | 执行时间 | 说明 |
|------|---------|------|
| daily-reflection | 每天 23:30 (CST) | 每日自我复盘 |
| daily-summary | 每天 18:00 (CST) | 每日工作汇总 |
| backup-to-github | 每天 12:30 (CST) | OpenClaw 备份 |
| session-archiver | 每天 03:00 (CST) | 历史会话归档 |
| log-cleanup | 每周一 04:00 (CST) | 日志分级清理 |
| weekly-evolution | 每周日 10:00 (CST) | 每周自我完善 |

手动触发：`openclaw cron run <job-id>`
