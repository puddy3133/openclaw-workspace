## [LRN-20260301-001] best_practice

**Logged**: 2026-03-01T05:52:00Z
**Priority**: high
**Status**: promoted
**Area**: config

### Summary
问题追踪记录位置混乱：分散在 STATE.md、每日日志、TASKS.md 多个文件，导致数据源不统一，维护困难。

### Details
用户要求记录图片生成问题，我错误地：
1. 将问题描述写入 `2026-03-01.md`（每日日志）- 错误：问题不应绑定特定日期
2. 将待办状态写入 `STATE.md` - 错误：状态文件会变，待办应该固定
3. 没有使用 `TASKS.md` - 这是专门的任务追踪文件

用户纠正后，我重新整理：所有待办问题统一记录在 TASKS.md，单一数据源。

### 学到的规则

**记忆文件分工**：
- `TASKS.md` → 所有待办事项、问题追踪（单一数据源）
- `STATE.md` → 当前会话状态、实时上下文（不堆积历史）
- `MEMORY.md` → 长期记忆、关键决策、经验教训（不记录临时待办）
- `YYYY-MM-DD.md` → 每日原始日志（不记录持续问题）

**问题追踪流程**：
1. 记录 → 统一写入 TASKS.md「问题追踪」章节
2. 提醒 → 达到触发条件时主动提醒
3. 解决 → 用户确认后，自动从「待解决」移到「已解决」
4. 移除 → 单一文件操作，不需要跨文件

### Suggested Action
已更新 TASKS.md 结构，建立「问题追踪」章节，明确分工规则。

### Metadata
- Source: correction
- Related Files: memory/TASKS.md, memory/STATE.md, memory/2026-03-01.md
- Tags: memory-system, task-management, best-practice
- Pattern-Key: memory.task_location
- Promoted: AGENTS.md (workflow rule)

### Resolution
- **Resolved**: 2026-03-01T06:00:00Z
- **Action**: 重新整理记录位置，更新 TASKS.md 结构
- **Notes**: 已建立「问题追踪」章节，明确文件分工规则

---
