---
name: content-studio-router
description: Unified content-generation router for OpenClaw. Merges ai-notes-ofvideo, ai-picture-book, and ai-ppt-generator with one entrypoint, shared polling, safer key handling, and a free fallback plan when no API key is available.
---

# Content Studio Router

统一内容生成入口（视频笔记 / 绘本 / PPT）。

`{baseDir}` = 本 `SKILL.md` 所在目录。

## When To Use
- 视频转结构化笔记。
- 文本故事生成绘本视频（静态/动态）。
- 主题生成 PPT 与模板选择。

## Trigger Hints
- `视频总结` `提炼笔记` `做PPT` `生成课件` `绘本`

## Auto Trigger Phrases (Exclusive)
<!-- TRIGGER_PHRASES_START -->
- `content studio route`
- `内容生成路由`
- `视频笔记路由`
- `绘本生成路由`
- `ppt生成路由`
<!-- TRIGGER_PHRASES_END -->

## Decision Tree
1. 视频 + 笔记：`notes-*`。
2. 故事 + 绘本：`picture-*`。
3. 演示文稿：`ppt-*`。
4. 缺 `BAIDU_API_KEY`：返回 `route` 免费降级方案。

## Execution Template

```bash
# 无 key 先规划
python3 {baseDir}/scripts/content_studio_router.py --task route --goal "{goal}"

# 视频笔记
BAIDU_API_KEY=*** python3 {baseDir}/scripts/content_studio_router.py --task notes-create --video-url "{video_url}"
BAIDU_API_KEY=*** python3 {baseDir}/scripts/content_studio_router.py --task notes-query --task-id "{task_id}"
BAIDU_API_KEY=*** python3 {baseDir}/scripts/content_studio_router.py --task notes-poll --task-id "{task_id}" --max-attempts 20 --interval 3

# 绘本（9=静态, 10=动态）
BAIDU_API_KEY=*** python3 {baseDir}/scripts/content_studio_router.py --task picture-create --method 9 --content "{story}"
BAIDU_API_KEY=*** python3 {baseDir}/scripts/content_studio_router.py --task picture-poll --task-id "{task_id}" --max-attempts 20 --interval 5

# PPT
BAIDU_API_KEY=*** python3 {baseDir}/scripts/content_studio_router.py --task ppt-themes
BAIDU_API_KEY=*** python3 {baseDir}/scripts/content_studio_router.py --task ppt-generate --query "{topic}" --tpl-id 106
```

## High-Value Examples
1. `把这个公开视频做成三种风格笔记`  
先 `notes-create`，然后 `notes-poll` 直到完成。

2. `给儿童睡前故事做一个动态绘本视频`  
用 `picture-create --method 10`，再 `picture-poll`。

3. `做一份 AI 战略汇报PPT`  
先 `ppt-themes` 给候选，再 `ppt-generate --tpl-id <chosen>`。

## Output Contract
返回 JSON：`task`、`ok`、`data|error`、`meta(router/version/fallback)`。

## Failure Fallback
- 缺 key 返回免费降级计划。
- 超时保留 `task_id`，继续 `*-query`/`*-poll`。

## Security Rules
- 不打印密钥。
- 不落盘敏感凭据。
