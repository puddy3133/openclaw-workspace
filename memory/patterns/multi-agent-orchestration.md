---
task-type: multi-agent-orchestration
context: 如何在多 Agent (小乔/大乔/Coder) 协同任务中保持记忆同步与任务接力
created: 2026-04-16
updated: 2026-04-16
version: 1
tags: [orchestration, memory-relay, teamwork]
refs: 0
---

## 场景
当一个任务涉及跨领域能力（如：小乔处理沟通，Coder 处理代码，大乔处理汇报），或者单个任务因为上下文限制需要重启/接力时。

## 方法
1. **状态锁 (State Lock)**：在 `STATE.md` 中写入明确的 `Current Subagent: {Name}` 和 `Checkpoint: {Step}`。
2. **任务接力棒 (Relay Token)**：在接力前，当前 Agent 将所有未完成的 context（包括已生成的代码、已获取的 API ID）写入 `TASKS.md` 的临时字段中。
3. **记忆对齐**：接力 Agent 启动时，必须先读取 `INDEX.md` -> `MEMORY.md` -> `TASKS.md`。
4. **统一反馈**：无论中间经过多少个 Agent，最终面向用户的反馈格式必须保持一致（遵循 `people/国栋.md` 中的简洁偏好）。

## 效果
用户感知不到 Agent 的切换成本，上下文保持高度连贯，且避免了重复读取文件。

## 注意事项
- 避免两个 Agent 同时写入同一个记忆文件，可能导致锁死。
- 接力时必须包含 `Raw Data` 而不仅仅是摘要，防止信息在传递中丢失。
