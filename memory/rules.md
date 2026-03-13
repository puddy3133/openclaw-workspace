# Rules Memory

## Security Rules

- 严禁在对话中回显 API Key、Token、Secret、Identity 类信息。
- 敏感操作优先最小权限原则；必要时保留审计记录。
- 不执行不明来源远程安装命令（如 `curl ... | bash`）。
- 发布、通知、外部写操作前，必须有人类确认。

## Execution Rules

- 本地可回滚操作可自动执行；外部高风险操作先确认。
- 出现异常时：先止血（降级/禁用冲突任务）再修复。
- 对失败链路做单点收敛：减少并发、缩短超时、收窄 fallback。
- **任务分解原则**：评估任务资源消耗，若预期引起系统长时间卡顿，必须先分解任务并向用户提供分步计划；子任务执行前需二次评估。

## Performance Rules

- 上下文控制优先：提前压缩阈值，保持短历史窗口。
- 记忆采用索引+分层，主 MEMORY.md 不堆叠长文。
- 插件与 cron 以“稳定优先”：非核心功能可默认关闭。

## Memory Maintenance Rules

- MEMORY.md 仅保留核心结论与导航（20-30 行）。
- 详细内容放 `memory/*.md`，通过“详见 path:line”引用。
- 事故复盘写入 `memory/incidents.md`，并在索引中保留 P0 摘要。

## Cron Rules

- 仅保留高价值任务，且默认 `sessionTarget=isolated`。
- 严禁高频重任务抢占主会话。
- 若出现超时风暴，立即降频并收紧 timeout。
- **交互状态标准**：所有任务必须即时回执、阶段进度反馈(Status/Duration/Overview/Progress)、先行需求确认。
