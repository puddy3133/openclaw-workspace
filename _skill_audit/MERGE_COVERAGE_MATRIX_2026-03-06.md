# Merge Coverage Matrix (2026-03-06)

Scope: Compare merged routers vs pre-merge source skills.

## 1) research-router
Source skills:
- multi-search-engine
- baidu-search
- baidu-scholar-search-skill
- baidu-baike-data
- tavily-search

Coverage:
- Multi-engine free search links: Covered
- Baidu web search (edition/recency/site/safe_search): Covered
- Baidu scholar (pagination + abstract switch): Covered
- Baidu baike (lemmaTitle/lemmaId/lemmaList): Covered
- Tavily search (deep/topic/news/days): Covered
- Tavily extract URL content: Covered (added `tavily-extract`)

Notes:
- Advanced operators from old skill are passed through query text.

## 2) content-studio-router
Source skills:
- ai-notes-ofvideo
- ai-picture-book
- ai-ppt-generator

Coverage:
- Video notes create/query/poll: Covered
- Picture-book create/query/poll, method 9/10: Covered
- PPT themes + generation: Covered
- Missing-key fallback plan: Covered (optimized)

Notes:
- Smart category model selection from old standalone script is partially covered (router uses template list + explicit tpl route).

## 3) web-capture-router
Source skills:
- agent-browser
- playwright-scraper-skill
- baoyu-url-to-markdown (capability layer)

Coverage:
- Static fetch and link/text extraction: Covered
- Dynamic capture path decision: Covered
- Playwright command generation: Covered
- Markdown extraction plan: Covered

Notes:
- Full browser automation action set (click/type/form/screenshot orchestration) is partially covered by design to keep OpenClaw safer.

## 4) skill-ops-router
Source skills:
- find-skills
- clawdhub
- skill-vetter
- skill-creator (ops aspects)

Coverage:
- Local inventory: Covered
- Static vetting: Covered
- Dedupe reporting: Covered
- Install command planning (skills.sh/clawdhub/github): Covered
- Publish readiness check: Covered

Notes:
- Intentionally does not auto-execute installs/publish (safer for OpenClaw).

## 5) publish-notify-router
Source skills:
- feishu-meeting-call
- baoyu-post-to-wechat
- baoyu-post-to-x

Coverage:
- Channel routing by urgency/goal: Covered
- Feishu send plan generation: Covered
- WeChat/X publish plan generation: Covered
- Outbound safety check: Covered

Notes:
- Real send/post execution is intentionally gated (plan-only + human confirmation).

## 6) agent-governance-router
Source skills:
- proactive-agent
- self-improving-agent
- task-status

Coverage:
- Governance intent routing: Covered
- Status message formatting: Covered
- Retro template generation: Covered
- Proactive policy mode selection: Covered

Notes:
- Intentional abstraction of large narrative frameworks into executable governance primitives.

## Overall Verdict
- Functional coverage for OpenClaw day-to-day usage: High
- Safety posture vs original mixed-source skills: Improved
- Remaining partial areas are deliberate safety/complexity tradeoffs, not accidental omissions.
