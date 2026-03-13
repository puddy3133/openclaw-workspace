# Cron 任务管理规范

> 配置格式、调度选择、维护注意事项

## 格式规范

`simple-cron-plugin` 支持的 schedule 格式：

```json
{ "kind": "every", "every": "24h", "anchor": "2026-03-07T13:00:00+08:00" }
{ "kind": "every", "every": "1d",  "anchor": "..." }
{ "kind": "at",    "at": "2026-03-10T10:00:00+08:00" }
{ "kind": "cron",  "cron": "0 13 * * *", "timezone": "Asia/Shanghai" }
```

## 当前任务清单（更新于 2026-03-07）

| 任务 ID | 名称 | 调度 | 状态 |
|--------|------|------|------|
| daily-summary | 每日总结 | 每天 18:00 (SGT) | ✅ 启用 |
| memory-extractor | 旧记忆提取 | 每天 13:00 | ✅ 启用（待被 daily-reflection 替代） |
| backup-to-github | 备份同步 | 每天 12:30 | ✅ 启用 |
| lunch-reminder | 订餐提醒 | 工作日 10:55 | ❌ 禁用 |
| daily-reflection | 每日自我复盘 | 每天 23:30 | ✅ 启用（新增） |
| session-archiver | 会话归档 | 每天 03:00 | ✅ 启用（新增） |
| log-cleanup | 日志清理 | 每周一 04:00 | ✅ 启用（新增） |
| weekly-evolution | 每周自我完善 | 每周日 10:00 | ✅ 启用（新增） |

## 执行规则

- 所有任务在 isolated 会话中执行，不污染主对话
- 结果只推飞书，不推 TUI/Web
- 遗漏任务在服务恢复后自动补跑
- 多任务积压时顺序排队，主线程优先
- 连续失败 5 次自动禁用，飞书报警

## 报告存储

- 执行报告：`memory/cron-reports/{job-id}-YYYY-MM-DD.md`
- 待处理消息：`memory/cron-reports/_pending.md`
