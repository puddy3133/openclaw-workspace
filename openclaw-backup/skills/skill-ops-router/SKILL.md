---
name: skill-ops-router
description: Unified skill operations router for OpenClaw. Merges skill discovery, install planning, static vetting, and publish prep workflows that overlap with find-skills, clawdhub, skill-vetter, and skill-creator.
---

# Skill Ops Router

统一 skill 生命周期入口（发现 / 审计 / 安装计划 / 发布检查）。

`{baseDir}` = 本 `SKILL.md` 所在目录。

## When To Use
- 查找、安装、升级、审计、发布 skill。

## Trigger Hints
- `找skill` `装skill` `审计这个skill` `发布skill`

## Auto Trigger Phrases (Exclusive)
<!-- TRIGGER_PHRASES_START -->
- `skill ops route`
- `技能运维路由`
- `skill审计路由`
- `skill安装规划路由`
- `skill发布检查路由`
<!-- TRIGGER_PHRASES_END -->

## Decision Tree
1. 不确定流程：`route`。
2. 先盘点本地：`scan-local`。
3. 安装/发布前必跑：`vet-path`。
4. 清理重复：`dedupe-report`。
5. 生成命令：`install-plan`。
6. 发布门禁：`publish-check`。

## Execution Template

```bash
python3 {baseDir}/scripts/skill_ops_router.py --task route --goal "{goal}"
python3 {baseDir}/scripts/skill_ops_router.py --task scan-local --skills-dir "skills"
python3 {baseDir}/scripts/skill_ops_router.py --task vet-path --target "{skill_dir}"
python3 {baseDir}/scripts/skill_ops_router.py --task dedupe-report --skills-dir "{skills_dir}"
python3 {baseDir}/scripts/skill_ops_router.py --task install-plan --source clawdhub --package "owner/skill@1.0.0"
python3 {baseDir}/scripts/skill_ops_router.py --task publish-check --target "{skill_dir}"
```

## High-Value Examples
1. `我想只保留不重复的skill`  
`scan-local -> dedupe-report`。

2. `这份第三方skill安全吗`  
`vet-path` 输出风险级别与片段。

3. `帮我准备发布这个新skill`  
`vet-path -> publish-check`。

## Output Contract
返回 JSON：`task`、`ok`、`data|error`、`meta(router/version/fallback)`。

## Failure Fallback
- 路径不存在时给建议路径。
- 审计疑似误报时保留 findings 给人工确认。

## Security Rules
- 默认只读。
- 不自动执行安装/发布命令。
