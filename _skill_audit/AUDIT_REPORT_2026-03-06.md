# OpenClaw Skill Audit Report

Date: 2026-03-06
Scope: `/Users/puddy/Downloads/skill_Clear.zip` (解包后共 39 个 SKILL.md)
Method: 静态审计（未执行第三方脚本）

## 1) 免费使用评估（含“有免费额度”）

### A. 可免费使用（无 API Key 或本地工具）
- `weather`（wttr/open-meteo 公共接口）
- `multi-search-engine`（拼接搜索 URL，无专属 key）
- `playwright-scraper-skill`（本地 Playwright）
- `openai-whisper`（本地 whisper CLI，算力成本自担）
- `agent-browser`（本地 node 工具）
- `skill-creator` / `skill-vetter` / `find-skills`（工具类）

### B. 可免费起步，但依赖外部免费额度（超额会收费）
- `tavily-search`（`TAVILY_API_KEY`）
- `baidu-search` / `baidu-scholar-search-skill` / `baidu-baike-data`
- `ai-notes-ofvideo` / `ai-picture-book` / `ai-ppt-generator` / `deepresearch-conversation`
  - 上述均依赖 `BAIDU_API_KEY`（千帆/相关服务）

### C. 默认偏付费或企业配额型
- `feishu-meeting-call`
  - 应用内消息通常可用；电话/短信加急取决于企业配额
- `baoyu-image-gen`（OpenAI / Google / Dashscope / Replicate key）
- `baoyu-post-to-x`（平台能力约束，且部分场景需 X Premium）

### D. 无法判定“长期免费”的项
- `Agent-Reach-main`、`clawdhub`、`mcporter`、`byterover`
  - 本体可运行，但所接入服务/云同步能力可能随版本调整计费

## 2) 安全审计结论

## 总体结论
- 未发现典型木马特征（反弹 shell、远控下载执行、持久化恶意脚本）。
- 发现多处“高权限环境下应谨慎”的行为，风险主要来自：
  - 外部 API 访问与凭据使用
  - 浏览器 cookie/会话读取
  - 自动安装/外部命令调用

## 高风险（建议默认禁用或隔离）
- `baoyu-danger-gemini-web`
  - 读取浏览器 cookie、访问 Gemini Web 会话、含 `execSync/spawn`
  - 名称已标注 `danger`，建议仅在隔离环境手动启用
- `baoyu-danger-x-to-markdown`
  - 依赖 X 会话态抓取，涉及 cookie/token 处理
- `Agent-Reach-main`
  - 大量 `subprocess.run`，并包含自动安装依赖逻辑（`apt-get`/`brew`/`npm`）

## 中风险（可用但需收敛权限）
- `playwright-scraper-skill`
  - 动态页面抓取能力强，需限制目标域名与数据落盘
- `task-status`
  - 向本地 gateway/Telegram 发送状态，存在信息外发面
- `feishu-meeting-call`
  - 可触发消息/电话通知，若误用会造成骚扰或信息误投

## 低风险
- 文档/写作/规划类 skill（`skill-creator`, `frontend-design`, `humanizer`, `summarize` 等）
  - 主要是流程指令，执行面较小

## 建议的安全基线
- 仅允许白名单域名出网（Baidu/Feishu/Tavily/必要站点）。
- API key 仅放环境变量，不写入仓库文件。
- 禁止 skill 自动执行 `curl | bash`、`npm -g`、系统包管理安装。
- 对 `danger`/`post-to-*`/`cookie` 类 skill 采用单独 profile。

## 3) 功能重复与合并建议

## 重复簇 A（搜索检索）
- `multi-search-engine`
- `baidu-search`
- `baidu-scholar-search-skill`
- `baidu-baike-data`
- `tavily-search`

建议：合并为一个路由 skill，免费优先，按场景自动切换 provider。

## 重复簇 B（网页抓取）
- `agent-browser`
- `playwright-scraper-skill`
- `baoyu-url-to-markdown`

建议：保留 1 个主 skill + 1 个备用 skill；避免 3 个同时启用。

## 重复簇 C（内容生成）
- `ai-picture-book`
- `ai-ppt-generator`
- `ai-notes-ofvideo`
- `baoyu-image-gen` / `baoyu-comic` / `baoyu-cover-image`

建议：按“输入类型（文本/视频/图）”整合为一个内容工坊 skill，内部再分路由。

## 已落地合并
- 新建：`skills/research-router/`
- 目的：合并“重复簇 A”并加入安全约束。

## 4) 本轮继续合并（新增）

已新增第二批合并 skill：

1. `skills/content-studio-router`
- 合并来源：`ai-notes-ofvideo` + `ai-picture-book` + `ai-ppt-generator`
- 统一任务：`notes-*` / `picture-*` / `ppt-*` / `route`
- 特点：统一轮询、统一错误返回、无 key 时给免费降级方案

2. `skills/web-capture-router`
- 合并来源：`agent-browser` + `playwright-scraper-skill` + `url-to-markdown`（能力层面）
- 统一任务：`route` / `fetch-static` / `dynamic-command` / `markdown-plan`
- 特点：默认静态抓取，动态抓取只给命令不自动执行高风险链路

推荐保留组合：
- 研究检索：`research-router`
- 内容生成：`content-studio-router`
- 网页抓取：`web-capture-router`

## 5) 本轮新增合并（Skill 运维）

新增：`skills/skill-ops-router`

合并来源（能力层面）：
- `find-skills`
- `clawdhub`
- `skill-vetter`
- `skill-creator`

统一任务：
- `route`
- `scan-local`
- `vet-path`
- `dedupe-report`
- `install-plan`
- `publish-check`

说明：
- 默认只读，不自动执行安装或发布命令。
- 先给操作计划，再由用户确认执行。

## 6) 本轮新增合并（发布通知 + 治理）

新增：`skills/publish-notify-router`
- 合并来源（能力层面）：`feishu-meeting-call` + `baoyu-post-to-wechat` + `baoyu-post-to-x`
- 统一任务：`route` / `feishu-plan` / `publish-plan` / `safety-check`
- 策略：只给执行计划，不自动外发

新增：`skills/agent-governance-router`
- 合并来源（能力层面）：`proactive-agent` + `self-improving-agent` + `task-status`
- 统一任务：`route` / `status-format` / `retro-plan` / `proactive-policy`
- 策略：治理建议与格式化输出，不直接执行系统变更
