---
name: agent-governance-router
description: Unified governance router for proactive behavior, self-improvement, and task status reporting. Merges overlapping workflows from proactive-agent, self-improving-agent, and task-status.
---

# Agent Governance Router

统一治理入口（状态汇报 / 复盘沉淀 / 主动策略）。

`{baseDir}` = 本 `SKILL.md` 所在目录。

## When To Use
- 需要长任务状态同步模板。
- 需要问题复盘与改进清单。
- 需要选择保守/平衡/激进执行策略。

## Trigger Hints
- `状态汇报` `复盘` `改进机制` `执行策略`

## Auto Trigger Phrases (Exclusive)
<!-- TRIGGER_PHRASES_START -->
- `agent governance route`
- `治理路由`
- `状态汇报路由`
- `复盘策略路由`
- `主动策略路由`
<!-- TRIGGER_PHRASES_END -->

## Decision Tree
1. 目标不清先 `route`。
2. 生成状态文本 `status-format`。
3. 生成复盘模板 `retro-plan`。
4. 生成策略建议 `proactive-policy`。

## Execution Template

```bash
python3 {baseDir}/scripts/agent_governance_router.py --task route --goal "{goal}"
python3 {baseDir}/scripts/agent_governance_router.py --task status-format --status progress --step "{step}" --message "{msg}"
python3 {baseDir}/scripts/agent_governance_router.py --task retro-plan --incident "{incident}"
python3 {baseDir}/scripts/agent_governance_router.py --task proactive-policy --context "{context}"
```

## High-Value Examples
1. `给我一个每30分钟的进度播报文案`  
`status-format` 快速产出统一格式。

2. `这次合并哪里做错了，给行动项`  
`retro-plan` 输出结构化复盘模板。

3. `生产环境操作，策略怎么设`  
`proactive-policy` 返回 conservative 规则。

## Output Contract
返回 JSON：`task`、`ok`、`data|error`、`meta(router/version/fallback)`。

## Failure Fallback
- 输入信息不足时返回最小模板。
- 场景不明确时默认 `balanced`。

## Security Rules
- 本 skill 不直接执行命令。
- 不直接改系统策略文件。
