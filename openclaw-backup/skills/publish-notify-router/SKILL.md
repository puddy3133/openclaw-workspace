---
name: publish-notify-router
description: Unified publish and notification router for OpenClaw. Merges Feishu notification, WeChat/X publish planning, and urgent alert routing with safety guardrails.
---

# Publish Notify Router

统一外发入口（飞书通知 / 微信发布 / X 发布）的计划层 router。

`{baseDir}` = 本 `SKILL.md` 所在目录。

## When To Use
- 发送通知（普通/紧急）。
- 准备发布内容到微信或 X。
- 外发前做风险检查。

## Trigger Hints
- `通知团队` `紧急提醒` `发公众号` `发X`

## Auto Trigger Phrases (Exclusive)
<!-- TRIGGER_PHRASES_START -->
- `publish notify route`
- `发布通知路由`
- `飞书提醒规划路由`
- `微信发布规划路由`
- `x发布规划路由`
<!-- TRIGGER_PHRASES_END -->

## Decision Tree
1. 不确定渠道先 `route`。
2. 飞书通知走 `feishu-plan`。
3. 内容发布走 `publish-plan`。
4. 执行前必做 `safety-check`。

## Execution Template

```bash
python3 {baseDir}/scripts/publish_notify_router.py --task route --goal "{goal}" --urgency high
python3 {baseDir}/scripts/publish_notify_router.py --task feishu-plan --message "{message}" --phone-call
python3 {baseDir}/scripts/publish_notify_router.py --task publish-plan --platform wechat --content-file "{file}"
python3 {baseDir}/scripts/publish_notify_router.py --task publish-plan --platform x --content-file "{file}"
python3 {baseDir}/scripts/publish_notify_router.py --task safety-check --message "{message}"
```

## High-Value Examples
1. `线上事故，5分钟内叫醒值班人`  
`route(urgency=high) -> feishu-plan --phone-call -> safety-check`。

2. `把这篇文章发公众号`  
`publish-plan --platform wechat`。

3. `先检查这条通知有没有敏感词`  
`safety-check --message "..."`。

## Output Contract
返回 JSON：`task`、`ok`、`data|error`、`meta(router/version/fallback)`。

## Failure Fallback
- 安全检查不通过：只返回风险，不给执行命令。
- 渠道不明确：返回推荐渠道与原因。

## Security Rules
- 不回显任何 token/secret。
- 不自动执行真实外发。
