# Skills Memory

## Active Skill Set (Merged Routers)

### 1) research-router

- 用途：统一网页/学术/百科/深度检索入口。
- 核心 provider：`free-web`、`baidu-web`、`baidu-scholar`、`baidu-baike`、`tavily`、`tavily-extract`。
- 规则：优先免费检索，缺 key 自动降级，结果需可追溯来源。

### 2) content-studio-router

- 用途：统一视频笔记、绘本、PPT 生成入口。
- 规则：无 BAIDU key 返回可执行降级方案；异步任务统一 poll/query 流程。

### 3) web-capture-router

- 用途：统一网页抓取（静态、动态建议、Markdown 计划）。
- 规则：默认只读；静态失败返回动态抓取建议，不直接执行高风险抓取。

### 4) skill-ops-router

- 用途：技能盘点、审计、去重、安装规划、发布前检查。
- 规则：安装前 vet-path；发布前 publish-check；默认不自动执行外部发布。

### 5) publish-notify-router

- 用途：飞书提醒、微信/X 发布规划、安全检查。
- 规则：先 safety-check，再输出可执行计划；不自动外发。

### 6) agent-governance-router

- 用途：状态播报、复盘模板、执行策略（保守/平衡/激进）。
- 规则：高风险场景默认 conservative；先报告再执行。

## Trigger and Contract Notes

- 所有 merged skill 使用互斥触发短语，避免一条语句触发多个 skill。
- 统一输出契约应包含：`ok`、`task/provider`、`data|error`、`meta(router/version/fallback)`。
- SKILL.md 作为规则入口，脚本作为确定性执行层。

## Change Policy

- 新增或合并 skill 后，必须同步更新：
  - `skills/*/SKILL.md`
  - `skills/*/agents/openai.yaml`
  - 冒烟测试脚本与触发冲突检查
