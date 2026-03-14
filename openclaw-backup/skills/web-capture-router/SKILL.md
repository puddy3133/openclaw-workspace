---
name: web-capture-router
description: Unified web capture router that merges static fetch, dynamic page capture, and markdown extraction workflows from agent-browser, playwright-scraper-skill, and url-to-markdown style skills.
---

# Web Capture Router

统一网页抓取入口（静态抓取 / 动态抓取计划 / Markdown 提取计划）。

`{baseDir}` = 本 `SKILL.md` 所在目录。

## When To Use
- 抓网页正文、链接、摘要。
- 遇到 JS 渲染、反爬页面需动态抓取建议。
- 交付 Markdown 化材料。

## Trigger Hints
- `抓网页` `提取正文` `网页转markdown` `动态页面`

## Auto Trigger Phrases (Exclusive)
<!-- TRIGGER_PHRASES_START -->
- `web capture route`
- `网页抓取路由`
- `动态抓取路由`
- `markdown抓取路由`
- `playwright抓取路由`
<!-- TRIGGER_PHRASES_END -->

## Decision Tree
1. 先 `route`。
2. static 场景先 `fetch-static`。
3. 不完整再 `dynamic-command`。
4. 输出文档时 `markdown-plan`。

## Execution Template

```bash
python3 {baseDir}/scripts/web_capture_router.py --task route --url "{url}"
python3 {baseDir}/scripts/web_capture_router.py --task fetch-static --url "{url}" --max-text 4000 --max-links 30
python3 {baseDir}/scripts/web_capture_router.py --task dynamic-command --url "{url}"
python3 {baseDir}/scripts/web_capture_router.py --task markdown-plan --url "{url}"
```

## High-Value Examples
1. `抓取官网文档首页核心要点`  
`route -> fetch-static`。

2. `这个微信文章抓不下来`  
`route -> dynamic-command`，生成 Playwright 命令。

3. `把这个网页整理成摘要Markdown`  
`fetch-static` 后按 `markdown-plan` 输出。

## Output Contract
返回 JSON：`task`、`ok`、`data|error`、`meta(router/version/fallback)`。

## Failure Fallback
- 静态失败时返回动态抓取建议命令。
- 动态不可行时返回人工补抓建议。

## Security Rules
- 默认只读。
- 不自动跑 cookie/session 抓取。
