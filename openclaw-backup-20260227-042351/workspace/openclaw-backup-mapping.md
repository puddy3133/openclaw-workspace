# OpenClaw 备份路径映射表

> 生成时间: 2026-02-27  
> 源目录: ~/.openclaw/  
> 目标目录: openclaw-backup/

---

## 图例说明

| 标记 | 含义 |
|------|------|
| ✅ | 备份 - 原路径保留 |
| ⚠️ | 脱敏后备份 - 内容需处理 |
| ❌ | 不备份 - 跳过 |

---

## 一、根目录文件

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/openclaw.json` | `openclaw-backup/openclaw.json` | ⚠️ 脱敏 | 核心配置，API Key 需替换为占位符 |
| `~/.openclaw/AGENTS.md` | `openclaw-backup/AGENTS.md` | ✅ 备份 | Agent 行为规范 |
| `~/.openclaw/README.md` | `openclaw-backup/README.md` | ✅ 备份 | 项目说明 |
| `~/.openclaw/TOOLS.md` | `openclaw-backup/TOOLS.md` | ✅ 备份 | 工具备注 |
| `~/.openclaw/setup.sh` | `openclaw-backup/setup.sh` | ✅ 备份 | 安装脚本 |
| `~/.openclaw/.env` | `openclaw-backup/.env` | ⚠️ 脱敏 | 环境变量，敏感信息需清除 |
| `~/.openclaw/.DS_Store` | - | ❌ 跳过 | macOS 系统文件 |

---

## 二、agents/ 目录

### 2.1 agents/main/agent/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/agents/main/agent/models.json` | `openclaw-backup/agents/main/agent/models.json` | ✅ 备份 | 自定义模型配置 |

### 2.2 agents/main/qmd/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/agents/main/qmd/sessions/*.md` | - | ❌ 跳过 | 会话历史摘要 |
| `~/.openclaw/agents/main/qmd/xdg-cache/bun/*` | - | ❌ 跳过 | Bun 运行时缓存 |
| `~/.openclaw/agents/main/qmd/xdg-cache/qmd/index.sqlite` | - | ❌ 跳过 | 向量数据库 |
| `~/.openclaw/agents/main/qmd/xdg-cache/qmd/index.sqlite-shm` | - | ❌ 跳过 | 共享内存文件 |
| `~/.openclaw/agents/main/qmd/xdg-cache/qmd/index.sqlite-wal` | - | ❌ 跳过 | 预写日志 |
| `~/.openclaw/agents/main/qmd/xdg-config/` | `openclaw-backup/agents/main/qmd/xdg-config/` | ✅ 备份 | QMD 配置目录 |

### 2.3 agents/main/sessions/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/agents/main/sessions/*.jsonl` | - | ❌ 跳过 | 会话数据文件 |
| `~/.openclaw/agents/main/sessions/*.jsonl.lock` | - | ❌ 跳过 | 锁文件 |
| `~/.openclaw/agents/main/sessions/sessions.json` | - | ❌ 跳过 | 会话索引 |

---

## 三、canvas/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/canvas/index.html` | `openclaw-backup/canvas/index.html` | ✅ 备份 | Canvas 页面模板 |

---

## 四、completions/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/completions/openclaw.bash` | `openclaw-backup/completions/openclaw.bash` | ⚠️ 可选 | Bash 补全脚本 |
| `~/.openclaw/completions/openclaw.fish` | `openclaw-backup/completions/openclaw.fish` | ⚠️ 可选 | Fish 补全脚本 |
| `~/.openclaw/completions/openclaw.ps1` | `openclaw-backup/completions/openclaw.ps1` | ⚠️ 可选 | PowerShell 补全脚本 |
| `~/.openclaw/completions/openclaw.zsh` | `openclaw-backup/completions/openclaw.zsh` | ⚠️ 可选 | Zsh 补全脚本 |

---

## 五、credentials/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/credentials/feishu-allowFrom.json` | `openclaw-backup/credentials/feishu-allowFrom.json` | ✅ 备份 | 飞书白名单 |
| `~/.openclaw/credentials/feishu-pairing.json` | `openclaw-backup/credentials/feishu-pairing.json` | ✅ 备份 | 飞书配对信息 |

---

## 六、cron/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/cron/jobs.json` | `openclaw-backup/cron/jobs.json` | ✅ 备份 | 定时任务定义 |
| `~/.openclaw/cron/jobs.json.bak` | - | ❌ 跳过 | 自动备份文件 |
| `~/.openclaw/cron/runs/*.jsonl` | - | ❌ 跳过 | 任务执行历史 |

---

## 七、devices/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/devices/paired.json` | `openclaw-backup/devices/paired.json` | ✅ 备份 | 已配对设备 |
| `~/.openclaw/devices/pending.json` | `openclaw-backup/devices/pending.json` | ✅ 备份 | 待配对请求 |

---

## 八、extensions/ 目录

### 8.1 context-warning-plugin/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/extensions/context-warning-plugin/index.js` | `openclaw-backup/extensions/context-warning-plugin/index.js` | ✅ 备份 | 插件代码 |
| `~/.openclaw/extensions/context-warning-plugin/openclaw.plugin.json` | `openclaw-backup/extensions/context-warning-plugin/openclaw.plugin.json` | ✅ 备份 | 插件配置 |

### 8.2 heartbeat-file-plugin/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/extensions/heartbeat-file-plugin/index.js` | `openclaw-backup/extensions/heartbeat-file-plugin/index.js` | ✅ 备份 | 插件代码 |
| `~/.openclaw/extensions/heartbeat-file-plugin/openclaw.plugin.json` | `openclaw-backup/extensions/heartbeat-file-plugin/openclaw.plugin.json` | ✅ 备份 | 插件配置 |

### 8.3 memory-tfidf-plugin/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/extensions/memory-tfidf-plugin/index.js` | `openclaw-backup/extensions/memory-tfidf-plugin/index.js` | ✅ 备份 | 插件代码 |
| `~/.openclaw/extensions/memory-tfidf-plugin/openclaw.plugin.json` | `openclaw-backup/extensions/memory-tfidf-plugin/openclaw.plugin.json` | ✅ 备份 | 插件配置 |

### 8.4 simple-cron-plugin/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/extensions/simple-cron-plugin/index.js` | `openclaw-backup/extensions/simple-cron-plugin/index.js` | ✅ 备份 | 插件代码 |
| `~/.openclaw/extensions/simple-cron-plugin/openclaw.plugin.json` | `openclaw-backup/extensions/simple-cron-plugin/openclaw.plugin.json` | ✅ 备份 | 插件配置 |
| `~/.openclaw/extensions/simple-cron-plugin/package.json` | `openclaw-backup/extensions/simple-cron-plugin/package.json` | ✅ 备份 | 依赖配置 |

---

## 九、identity/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/identity/device.json` | `openclaw-backup/identity/device.json` | ✅ 备份 | 设备信息 |
| `~/.openclaw/identity/device-auth.json` | `openclaw-backup/identity/device-auth.json` | ✅ 备份 | 设备认证 |

---

## 十、logs/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/logs/gateway.err.log` | - | ❌ 跳过 | 错误日志 |
| `~/.openclaw/logs/gateway.log` | - | ❌ 跳过 | 运行日志 |

---

## 十一、memory/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/memory/main.sqlite` | - | ❌ 跳过 | 内存数据库 |

---

## 十二、nodes/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/nodes/node_openclaw_main.json` | `openclaw-backup/nodes/node_openclaw_main.json` | ✅ 备份 | 主节点配置 |

---

## 十三、skills/ 目录

### 13.1 agent-browser/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/agent-browser/.clawhub/origin.json` | `openclaw-backup/skills/agent-browser/.clawhub/origin.json` | ✅ 备份 | 来源信息 |
| `~/.openclaw/skills/agent-browser/CONTRIBUTING.md` | `openclaw-backup/skills/agent-browser/CONTRIBUTING.md` | ✅ 备份 | 贡献指南 |
| `~/.openclaw/skills/agent-browser/SKILL.md` | `openclaw-backup/skills/agent-browser/SKILL.md` | ✅ 备份 | 技能文档 |
| `~/.openclaw/skills/agent-browser/_meta.json` | `openclaw-backup/skills/agent-browser/_meta.json` | ✅ 备份 | 元数据 |

### 13.2 brave-search/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/brave-search/.clawhub/origin.json` | `openclaw-backup/skills/brave-search/.clawhub/origin.json` | ✅ 备份 | 来源信息 |
| `~/.openclaw/skills/brave-search/SKILL.md` | `openclaw-backup/skills/brave-search/SKILL.md` | ✅ 备份 | 技能文档 |
| `~/.openclaw/skills/brave-search/_meta.json` | `openclaw-backup/skills/brave-search/_meta.json` | ✅ 备份 | 元数据 |
| `~/.openclaw/skills/brave-search/content.js` | `openclaw-backup/skills/brave-search/content.js` | ✅ 备份 | 代码 |
| `~/.openclaw/skills/brave-search/package.json` | `openclaw-backup/skills/brave-search/package.json` | ✅ 备份 | 依赖配置 |
| `~/.openclaw/skills/brave-search/package-lock.json` | `openclaw-backup/skills/brave-search/package-lock.json` | ✅ 备份 | 锁定文件 |
| `~/.openclaw/skills/brave-search/search.js` | `openclaw-backup/skills/brave-search/search.js` | ✅ 备份 | 代码 |
| `~/.openclaw/skills/brave-search/node_modules/` | - | ❌ 跳过 | npm 依赖 |

### 13.3 clawdhub/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/clawdhub/.clawhub/origin.json` | `openclaw-backup/skills/clawdhub/.clawhub/origin.json` | ✅ 备份 | 来源信息 |
| `~/.openclaw/skills/clawdhub/SKILL.md` | `openclaw-backup/skills/clawdhub/SKILL.md` | ✅ 备份 | 技能文档 |
| `~/.openclaw/skills/clawdhub/_meta.json` | `openclaw-backup/skills/clawdhub/_meta.json` | ✅ 备份 | 元数据 |

### 13.4 data-analyst/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/data-analyst/.clawhub/origin.json` | `openclaw-backup/skills/data-analyst/.clawhub/origin.json` | ✅ 备份 | 来源信息 |
| `~/.openclaw/skills/data-analyst/SKILL.md` | `openclaw-backup/skills/data-analyst/SKILL.md` | ✅ 备份 | 技能文档 |
| `~/.openclaw/skills/data-analyst/_meta.json` | `openclaw-backup/skills/data-analyst/_meta.json` | ✅ 备份 | 元数据 |

### 13.5 image-assistant/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/image-assistant/SKILL.md` | `openclaw-backup/skills/image-assistant/SKILL.md` | ✅ 备份 | 技能文档 |
| `~/.openclaw/skills/image-assistant/examples/ai-tools-selection.md` | `openclaw-backup/skills/image-assistant/examples/ai-tools-selection.md` | ✅ 备份 | 示例 |
| `~/.openclaw/skills/image-assistant/stages/01-brief.md` | `openclaw-backup/skills/image-assistant/stages/01-brief.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/skills/image-assistant/stages/02-plan.md` | `openclaw-backup/skills/image-assistant/stages/02-plan.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/skills/image-assistant/stages/03-copy.md` | `openclaw-backup/skills/image-assistant/stages/03-copy.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/skills/image-assistant/stages/04-prompts.md` | `openclaw-backup/skills/image-assistant/stages/04-prompts.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/skills/image-assistant/stages/05-iterate.md` | `openclaw-backup/skills/image-assistant/stages/05-iterate.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/skills/image-assistant/templates/16x9-3cards-insights.md` | `openclaw-backup/skills/image-assistant/templates/16x9-3cards-insights.md` | ✅ 备份 | 模板 |
| `~/.openclaw/skills/image-assistant/templates/16x9-5panel-comic.md` | `openclaw-backup/skills/image-assistant/templates/16x9-5panel-comic.md` | ✅ 备份 | 模板 |
| `~/.openclaw/skills/image-assistant/templates/16x9-contrast-2cards.md` | `openclaw-backup/skills/image-assistant/templates/16x9-contrast-2cards.md` | ✅ 备份 | 模板 |
| `~/.openclaw/skills/image-assistant/templates/16x9-cover-roadmap.md` | `openclaw-backup/skills/image-assistant/templates/16x9-cover-roadmap.md` | ✅ 备份 | 模板 |
| `~/.openclaw/skills/image-assistant/templates/16x9-infographic.md` | `openclaw-backup/skills/image-assistant/templates/16x9-infographic.md` | ✅ 备份 | 模板 |
| `~/.openclaw/skills/image-assistant/templates/checklist.md` | `openclaw-backup/skills/image-assistant/templates/checklist.md` | ✅ 备份 | 模板 |
| `~/.openclaw/skills/image-assistant/templates/style-block.md` | `openclaw-backup/skills/image-assistant/templates/style-block.md` | ✅ 备份 | 模板 |

### 13.6 playwright-headless-browser/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/playwright-headless-browser/.clawhub/origin.json` | `openclaw-backup/skills/playwright-headless-browser/.clawhub/origin.json` | ✅ 备份 | 来源信息 |
| `~/.openclaw/skills/playwright-headless-browser/SKILL.md` | `openclaw-backup/skills/playwright-headless-browser/SKILL.md` | ✅ 备份 | 技能文档 |
| `~/.openclaw/skills/playwright-headless-browser/_meta.json` | `openclaw-backup/skills/playwright-headless-browser/_meta.json` | ✅ 备份 | 元数据 |

### 13.7 prd-doc-writer/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/prd-doc-writer/SKILL.md` | `openclaw-backup/skills/prd-doc-writer/SKILL.md` | ✅ 备份 | 技能文档 |
| `~/.openclaw/skills/prd-doc-writer/assets/prd-template.md` | `openclaw-backup/skills/prd-doc-writer/assets/prd-template.md` | ✅ 备份 | 模板 |
| `~/.openclaw/skills/prd-doc-writer/references/example-us01.md` | `openclaw-backup/skills/prd-doc-writer/references/example-us01.md` | ✅ 备份 | 参考 |
| `~/.openclaw/skills/prd-doc-writer/references/mermaid-examples.md` | `openclaw-backup/skills/prd-doc-writer/references/mermaid-examples.md` | ✅ 备份 | 参考 |
| `~/.openclaw/skills/prd-doc-writer/references/prd-registry-demo.md` | `openclaw-backup/skills/prd-doc-writer/references/prd-registry-demo.md` | ✅ 备份 | 参考 |
| `~/.openclaw/skills/prd-doc-writer/references/ui-wireframe-examples.md` | `openclaw-backup/skills/prd-doc-writer/references/ui-wireframe-examples.md` | ✅ 备份 | 参考 |

### 13.8 priority-judge/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/priority-judge/skill.md` | `openclaw-backup/skills/priority-judge/skill.md` | ✅ 备份 | 技能文档 |

### 13.9 project-map-builder/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/project-map-builder/SKILL.md` | `openclaw-backup/skills/project-map-builder/SKILL.md` | ✅ 备份 | 技能文档 |

### 13.10 req-change-workflow/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/req-change-workflow/SKILL.md` | `openclaw-backup/skills/req-change-workflow/SKILL.md` | ✅ 备份 | 技能文档 |
| `~/.openclaw/skills/req-change-workflow/references/change-brief-template.md` | `openclaw-backup/skills/req-change-workflow/references/change-brief-template.md` | ✅ 备份 | 模板 |
| `~/.openclaw/skills/req-change-workflow/references/decision-log-template.md` | `openclaw-backup/skills/req-change-workflow/references/decision-log-template.md` | ✅ 备份 | 模板 |
| `~/.openclaw/skills/req-change-workflow/references/regression-checklist.md` | `openclaw-backup/skills/req-change-workflow/references/regression-checklist.md` | ✅ 备份 | 模板 |

### 13.11 self-improving-agent/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/self-improving-agent/.clawhub/origin.json` | `openclaw-backup/skills/self-improving-agent/.clawhub/origin.json` | ✅ 备份 | 来源信息 |
| `~/.openclaw/skills/self-improving-agent/.learnings/ERRORS.md` | `openclaw-backup/skills/self-improving-agent/.learnings/ERRORS.md` | ✅ 备份 | 学习记录 |
| `~/.openclaw/skills/self-improving-agent/.learnings/FEATURE_REQUESTS.md` | `openclaw-backup/skills/self-improving-agent/.learnings/FEATURE_REQUESTS.md` | ✅ 备份 | 学习记录 |
| `~/.openclaw/skills/self-improving-agent/.learnings/LEARNINGS.md` | `openclaw-backup/skills/self-improving-agent/.learnings/LEARNINGS.md` | ✅ 备份 | 学习记录 |
| `~/.openclaw/skills/self-improving-agent/SKILL.md` | `openclaw-backup/skills/self-improving-agent/SKILL.md` | ✅ 备份 | 技能文档 |
| `~/.openclaw/skills/self-improving-agent/_meta.json` | `openclaw-backup/skills/self-improving-agent/_meta.json` | ✅ 备份 | 元数据 |
| `~/.openclaw/skills/self-improving-agent/assets/LEARNINGS.md` | `openclaw-backup/skills/self-improving-agent/assets/LEARNINGS.md` | ✅ 备份 | 学习记录 |
| `~/.openclaw/skills/self-improving-agent/assets/SKILL-TEMPLATE.md` | `openclaw-backup/skills/self-improving-agent/assets/SKILL-TEMPLATE.md` | ✅ 备份 | 模板 |
| `~/.openclaw/skills/self-improving-agent/hooks/openclaw/HOOK.md` | `openclaw-backup/skills/self-improving-agent/hooks/openclaw/HOOK.md` | ✅ 备份 | Hook 文档 |
| `~/.openclaw/skills/self-improving-agent/hooks/openclaw/handler.js` | `openclaw-backup/skills/self-improving-agent/hooks/openclaw/handler.js` | ✅ 备份 | Hook 代码 |
| `~/.openclaw/skills/self-improving-agent/references/examples.md` | `openclaw-backup/skills/self-improving-agent/references/examples.md` | ✅ 备份 | 参考 |
| `~/.openclaw/skills/self-improving-agent/references/hooks-setup.md` | `openclaw-backup/skills/self-improving-agent/references/hooks-setup.md` | ✅ 备份 | 参考 |
| `~/.openclaw/skills/self-improving-agent/references/openclaw-integration.md` | `openclaw-backup/skills/self-improving-agent/references/openclaw-integration.md` | ✅ 备份 | 参考 |

### 13.12 skill-vetter/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/skill-vetter/.clawhub/origin.json` | `openclaw-backup/skills/skill-vetter/.clawhub/origin.json` | ✅ 备份 | 来源信息 |
| `~/.openclaw/skills/skill-vetter/SKILL.md` | `openclaw-backup/skills/skill-vetter/SKILL.md` | ✅ 备份 | 技能文档 |
| `~/.openclaw/skills/skill-vetter/_meta.json` | `openclaw-backup/skills/skill-vetter/_meta.json` | ✅ 备份 | 元数据 |

### 13.13 summarize/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/summarize/.clawhub/origin.json` | `openclaw-backup/skills/summarize/.clawhub/origin.json` | ✅ 备份 | 来源信息 |
| `~/.openclaw/skills/summarize/SKILL.md` | `openclaw-backup/skills/summarize/SKILL.md` | ✅ 备份 | 技能文档 |
| `~/.openclaw/skills/summarize/_meta.json` | `openclaw-backup/skills/summarize/_meta.json` | ✅ 备份 | 元数据 |

### 13.14 task-status/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/task-status/.clawhub/origin.json` | `openclaw-backup/skills/task-status/.clawhub/origin.json` | ✅ 备份 | 来源信息 |
| `~/.openclaw/skills/task-status/README.md` | `openclaw-backup/skills/task-status/README.md` | ✅ 备份 | 说明文档 |
| `~/.openclaw/skills/task-status/SKILL.md` | `openclaw-backup/skills/task-status/SKILL.md` | ✅ 备份 | 技能文档 |
| `~/.openclaw/skills/task-status/_meta.json` | `openclaw-backup/skills/task-status/_meta.json` | ✅ 备份 | 元数据 |
| `~/.openclaw/skills/task-status/references/usage.md` | `openclaw-backup/skills/task-status/references/usage.md` | ✅ 备份 | 参考 |

### 13.15 thinking-partner/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/thinking-partner/SKILL.md` | `openclaw-backup/skills/thinking-partner/SKILL.md` | ✅ 备份 | 技能文档 |

### 13.16 thought-mining/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/thought-mining/SKILL.md` | `openclaw-backup/skills/thought-mining/SKILL.md` | ✅ 备份 | 技能文档 |
| `~/.openclaw/skills/thought-mining/examples/claude-skills-case.md` | `openclaw-backup/skills/thought-mining/examples/claude-skills-case.md` | ✅ 备份 | 示例 |
| `~/.openclaw/skills/thought-mining/stages/01-mining.md` | `openclaw-backup/skills/thought-mining/stages/01-mining.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/skills/thought-mining/stages/02-topic.md` | `openclaw-backup/skills/thought-mining/stages/02-topic.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/skills/thought-mining/stages/03-validation.md` | `openclaw-backup/skills/thought-mining/stages/03-validation.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/skills/thought-mining/stages/04-writing.md` | `openclaw-backup/skills/thought-mining/stages/04-writing.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/skills/thought-mining/stages/05-review.md` | `openclaw-backup/skills/thought-mining/stages/05-review.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/skills/thought-mining/stages/course-01-understand.md` | `openclaw-backup/skills/thought-mining/stages/course-01-understand.md` | ✅ 备份 | 课程文档 |
| `~/.openclaw/skills/thought-mining/stages/course-02-outline.md` | `openclaw-backup/skills/thought-mining/stages/course-02-outline.md` | ✅ 备份 | 课程文档 |
| `~/.openclaw/skills/thought-mining/stages/course-03-content.md` | `openclaw-backup/skills/thought-mining/stages/course-03-content.md` | ✅ 备份 | 课程文档 |
| `~/.openclaw/skills/thought-mining/templates/insights-template.md` | `openclaw-backup/skills/thought-mining/templates/insights-template.md` | ✅ 备份 | 模板 |
| `~/.openclaw/skills/thought-mining/templates/writing-record-template.md` | `openclaw-backup/skills/thought-mining/templates/writing-record-template.md` | ✅ 备份 | 模板 |

### 13.17 ui-design/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/ui-design/SKILL.md` | `openclaw-backup/skills/ui-design/SKILL.md` | ✅ 备份 | 技能文档 |

### 13.18 version-planner/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/version-planner/SKILL.md` | `openclaw-backup/skills/version-planner/SKILL.md` | ✅ 备份 | 技能文档 |

### 13.19 weather/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/weather/.clawhub/origin.json` | `openclaw-backup/skills/weather/.clawhub/origin.json` | ✅ 备份 | 来源信息 |
| `~/.openclaw/skills/weather/SKILL.md` | `openclaw-backup/skills/weather/SKILL.md` | ✅ 备份 | 技能文档 |
| `~/.openclaw/skills/weather/_meta.json` | `openclaw-backup/skills/weather/_meta.json` | ✅ 备份 | 元数据 |

### 13.20 weekly-report/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/weekly-report/SKILL.md` | `openclaw-backup/skills/weekly-report/SKILL.md` | ✅ 备份 | 技能文档 |

### 13.21 writing-assistant/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/writing-assistant/SKILL.md` | `openclaw-backup/skills/writing-assistant/SKILL.md` | ✅ 备份 | 技能文档 |
| `~/.openclaw/skills/writing-assistant/stages/00-diagnosis.md` | `openclaw-backup/skills/writing-assistant/stages/00-diagnosis.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/skills/writing-assistant/stages/01-mining.md` | `openclaw-backup/skills/writing-assistant/stages/01-mining.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/skills/writing-assistant/stages/02-topic.md` | `openclaw-backup/skills/writing-assistant/stages/02-topic.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/skills/writing-assistant/stages/03-framework.md` | `openclaw-backup/skills/writing-assistant/stages/03-framework.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/skills/writing-assistant/stages/04-writing.md` | `openclaw-backup/skills/writing-assistant/stages/04-writing.md` | ✅ 备份 | 阶段文档 |

---

## 十四、subagents/ 目录

### 14.1 coder/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/subagents/coder/MEMORY.md` | `openclaw-backup/subagents/coder/MEMORY.md` | ✅ 备份 | 记忆 |
| `~/.openclaw/subagents/coder/SOUL.md` | `openclaw-backup/subagents/coder/SOUL.md` | ✅ 备份 | 人格 |

### 14.2 planner/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/subagents/planner/MEMORY.md` | `openclaw-backup/subagents/planner/MEMORY.md` | ✅ 备份 | 记忆 |
| `~/.openclaw/subagents/planner/SOUL.md` | `openclaw-backup/subagents/planner/SOUL.md` | ✅ 备份 | 人格 |

---

## 十五、workspace/ 目录

### 15.1 根目录文件

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/workspace/AGENTS.md` | `openclaw-backup/workspace/AGENTS.md` | ✅ 备份 | Agent 配置 |
| `~/.openclaw/workspace/CRON.json` | `openclaw-backup/workspace/CRON.json` | ✅ 备份 | 定时配置 |
| `~/.openclaw/workspace/HEARTBEAT-CHECK.md` | `openclaw-backup/workspace/HEARTBEAT-CHECK.md` | ✅ 备份 | 心跳检查 |
| `~/.openclaw/workspace/HEARTBEAT.md` | `openclaw-backup/workspace/HEARTBEAT.md` | ✅ 备份 | 心跳指令 |
| `~/.openclaw/workspace/IDENTITY.md` | `openclaw-backup/workspace/IDENTITY.md` | ✅ 备份 | 身份定义 |
| `~/.openclaw/workspace/MEMORY.md` | `openclaw-backup/workspace/MEMORY.md` | ✅ 备份 | 长期记忆 |
| `~/.openclaw/workspace/SOUL.md` | `openclaw-backup/workspace/SOUL.md` | ✅ 备份 | 核心人格 |
| `~/.openclaw/workspace/STARTUP.md` | `openclaw-backup/workspace/STARTUP.md` | ✅ 备份 | 启动配置 |
| `~/.openclaw/workspace/TOOLS.md` | `openclaw-backup/workspace/TOOLS.md` | ✅ 备份 | 工具备注 |
| `~/.openclaw/workspace/USER.md` | `openclaw-backup/workspace/USER.md` | ✅ 备份 | 用户信息 |

### 15.2 memory/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/workspace/memory/YYYY-MM-DD.md` | `openclaw-backup/workspace/memory/YYYY-MM-DD.md` | ✅ 备份 | 模板 |
| `~/.openclaw/workspace/memory/2026-02-21.md` | `openclaw-backup/workspace/memory/2026-02-21.md` | ✅ 备份 | 每日记忆 |
| `~/.openclaw/workspace/memory/2026-02-22.md` | `openclaw-backup/workspace/memory/2026-02-22.md` | ✅ 备份 | 每日记忆 |
| `~/.openclaw/workspace/memory/2026-02-23.md` | `openclaw-backup/workspace/memory/2026-02-23.md` | ✅ 备份 | 每日记忆 |
| `~/.openclaw/workspace/memory/2026-02-24.md` | `openclaw-backup/workspace/memory/2026-02-24.md` | ✅ 备份 | 每日记忆 |
| `~/.openclaw/workspace/memory/2026-02-24-1825-evomap.md` | `openclaw-backup/workspace/memory/2026-02-24-1825-evomap.md` | ✅ 备份 | 项目记忆 |
| `~/.openclaw/workspace/memory/2026-02-24-evomap.md` | `openclaw-backup/workspace/memory/2026-02-24-evomap.md` | ✅ 备份 | 项目记忆 |
| `~/.openclaw/workspace/memory/2026-02-24-evomap-1242.md` | `openclaw-backup/workspace/memory/2026-02-24-evomap-1242.md` | ✅ 备份 | 项目记忆 |
| `~/.openclaw/workspace/memory/INDEX.md` | `openclaw-backup/workspace/memory/INDEX.md` | ✅ 备份 | 索引 |
| `~/.openclaw/workspace/memory/test.txt` | `openclaw-backup/workspace/memory/test.txt` | ✅ 备份 | 测试文件 |
| `~/.openclaw/workspace/memory/people/puddy.md` | `openclaw-backup/workspace/memory/people/puddy.md` | ✅ 备份 | 用户档案 |
| `~/.openclaw/workspace/memory/projects/persistent-agent-architecture.md` | `openclaw-backup/workspace/memory/projects/persistent-agent-architecture.md` | ✅ 备份 | 项目文档 |

### 15.3 puddy_skillshub/ 目录

#### image-assistant/

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/workspace/puddy_skillshub/image-assistant/SKILL.md` | `openclaw-backup/workspace/puddy_skillshub/image-assistant/SKILL.md` | ✅ 备份 | 技能文档 |
| `~/.openclaw/workspace/puddy_skillshub/image-assistant/examples/ai-tools-selection.md` | `openclaw-backup/workspace/puddy_skillshub/image-assistant/examples/ai-tools-selection.md` | ✅ 备份 | 示例 |
| `~/.openclaw/workspace/puddy_skillshub/image-assistant/out/apimart.requests.example.jsonl` | `openclaw-backup/workspace/puddy_skillshub/image-assistant/out/apimart.requests.example.jsonl` | ✅ 备份 | 示例数据 |
| `~/.openclaw/workspace/puddy_skillshub/image-assistant/scripts/README.md` | `openclaw-backup/workspace/puddy_skillshub/image-assistant/scripts/README.md` | ✅ 备份 | 脚本说明 |
| `~/.openclaw/workspace/puddy_skillshub/image-assistant/scripts/apimart.env` | `openclaw-backup/workspace/puddy_skillshub/image-assistant/scripts/apimart.env` | ✅ 备份 | 环境配置 |
| `~/.openclaw/workspace/puddy_skillshub/image-assistant/scripts/apimart_batch_generate.py` | `openclaw-backup/workspace/puddy_skillshub/image-assistant/scripts/apimart_batch_generate.py` | ✅ 备份 | Python 脚本 |
| `~/.openclaw/workspace/puddy_skillshub/image-assistant/stages/01-brief.md` | `openclaw-backup/workspace/puddy_skillshub/image-assistant/stages/01-brief.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/workspace/puddy_skillshub/image-assistant/stages/02-plan.md` | `openclaw-backup/workspace/puddy_skillshub/image-assistant/stages/02-plan.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/workspace/puddy_skillshub/image-assistant/stages/03-copy.md` | `openclaw-backup/workspace/puddy_skillshub/image-assistant/stages/03-copy.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/workspace/puddy_skillshub/image-assistant/stages/04-prompts.md` | `openclaw-backup/workspace/puddy_skillshub/image-assistant/stages/04-prompts.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/workspace/puddy_skillshub/image-assistant/stages/05-iterate.md` | `openclaw-backup/workspace/puddy_skillshub/image-assistant/stages/05-iterate.md` | ✅ 备份 | 阶段文档 |
| `~/.openclaw/workspace/puddy_skillshub/image-assistant/templates/16x9-3cards-insights.md` | `openclaw-backup/workspace/puddy_skillshub/image-assistant/templates/16x9-3cards-insights.md` | ✅ 备份 | 模板 |
| `~/.openclaw/workspace/puddy_skillshub/image-assistant/templates/16x9-infographic.md` | `openclaw-backup/workspace/puddy_skillshub/image-assistant/templates/16x9-infographic.md` | ✅ 备份 | 模板 |
| `~/.openclaw/workspace/puddy_skillshub/image-assistant/templates/api-config.md` | `openclaw-backup/workspace/puddy_skillshub/image-assistant/templates/api-config.md` | ✅ 备份 | 模板 |
| `~/.openclaw/workspace/puddy_skillshub/image-assistant/templates/apimart-requests-jsonl.md` | `openclaw-backup/workspace/puddy_skillshub/image-assistant/templates/apimart-requests-jsonl.md` | ✅ 备份 | 模板 |
| `~/.openclaw/workspace/puddy_skillshub/image-assistant/templates/style-block.md` | `openclaw-backup/workspace/puddy_skillshub/image-assistant/templates/style-block.md` | ✅ 备份 | 模板 |

#### 其他技能目录（结构同上，略）

- `lesson-builder/` → `openclaw-backup/workspace/puddy_skillshub/lesson-builder/`
- `prd-doc-writer/` → `openclaw-backup/workspace/puddy_skillshub/prd-doc-writer/`
- `priority-judge/` → `openclaw-backup/workspace/puddy_skillshub/priority-judge/`
- `project-map-builder/` → `openclaw-backup/workspace/puddy_skillshub/project-map-builder/`
- `req-change-workflow/` → `openclaw-backup/workspace/puddy_skillshub/req-change-workflow/`
- `thinking-partner/` → `openclaw-backup/workspace/puddy_skillshub/thinking-partner/`
- `thought-mining/` → `openclaw-backup/workspace/puddy_skillshub/thought-mining/`
- `ui-design/` → `openclaw-backup/workspace/puddy_skillshub/ui-design/`
- `version-planner/` → `openclaw-backup/workspace/puddy_skillshub/version-planner/`
- `weekly-report/` → `openclaw-backup/workspace/puddy_skillshub/weekly-report/`
- `writing-assistant/` → `openclaw-backup/workspace/puddy_skillshub/writing-assistant/`

### 15.4 scripts/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/workspace/scripts/*` | `openclaw-backup/workspace/scripts/*` | ✅ 备份 | 自定义脚本 |

### 15.5 tasks/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/workspace/tasks/inbox.md` | `openclaw-backup/workspace/tasks/inbox.md` | ✅ 备份 | 收件箱 |
| `~/.openclaw/workspace/tasks/active/TASK-001-persistent-agent-setup.md` | `openclaw-backup/workspace/tasks/active/TASK-001-persistent-agent-setup.md` | ✅ 备份 | 活跃任务 |
| `~/.openclaw/workspace/tasks/archive/README.md` | `openclaw-backup/workspace/tasks/archive/README.md` | ✅ 备份 | 归档说明 |
| `~/.openclaw/workspace/tasks/recurring/recurring-tasks.md` | `openclaw-backup/workspace/tasks/recurring/recurring-tasks.md` | ✅ 备份 | 重复任务 |
| `~/.openclaw/workspace/tasks/waiting/README.md` | `openclaw-backup/workspace/tasks/waiting/README.md` | ✅ 备份 | 等待说明 |

### 15.6 evomap 项目文件

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/workspace/evomap_solutions/discord_bot_fix.md` | `openclaw-backup/workspace/evomap_solutions/discord_bot_fix.md` | ✅ 备份 | 解决方案 |
| `~/.openclaw/workspace/evomap_automation/` | `openclaw-backup/workspace/evomap_automation/` | ✅ 备份 | 项目目录 |
| `~/.openclaw/workspace/check_evomap_status.js` | `openclaw-backup/workspace/check_evomap_status.js` | ✅ 备份 | 检查脚本 |
| `~/.openclaw/workspace/compute_capsule_hash.js` | `openclaw-backup/workspace/compute_capsule_hash.js` | ✅ 备份 | 工具脚本 |
| `~/.openclaw/workspace/compute_capsule_hash2.js` | `openclaw-backup/workspace/compute_capsule_hash2.js` | ✅ 备份 | 工具脚本 |
| `~/.openclaw/workspace/compute_hash.js` | `openclaw-backup/workspace/compute_hash.js` | ✅ 备份 | 工具脚本 |
| `~/.openclaw/workspace/evocomplete.js` | `openclaw-backup/workspace/evocomplete.js` | ✅ 备份 | 完成脚本 |
| `~/.openclaw/workspace/evomap-agent_ethics.js` | `openclaw-backup/workspace/evomap-agent_ethics.js` | ✅ 备份 | 伦理脚本 |
| `~/.openclaw/workspace/evomap_auto-README.md` | `openclaw-backup/workspace/evomap_auto-README.md` | ✅ 备份 | 自动文档 |
| `~/.openclaw/workspace/evomap-config.json` | `openclaw-backup/workspace/evomap-config.json` | ✅ 备份 | 配置文件 |
| `~/.openclaw/workspace/evomap_bundle.json` | `openclaw-backup/workspace/evomap_bundle.json` | ✅ 备份 | 打包文件 |
| `~/.openclaw/workspace/evomap_bundle_20260224.json` | `openclaw-backup/workspace/evomap_bundle_20260224.json` | ✅ 备份 | 打包文件 |
| `~/.openclaw/workspace/evomap_bundle_correct.json` | `openclaw-backup/workspace/evomap_bundle_correct.json` | ✅ 备份 | 打包文件 |
| `~/.openclaw/workspace/evomap_bundle_final.json` | `openclaw-backup/workspace/evomap_bundle_final.json` | ✅ 备份 | 打包文件 |
| `~/.openclaw/workspace/evomap_bundle_final_v2.json` | `openclaw-backup/workspace/evomap_bundle_final_v2.json` | ✅ 备份 | 打包文件 |
| `~/.openclaw/workspace/evomap_bundle_openclaw_browser_debug.json` | `openclaw-backup/workspace/evomap_bundle_openclaw_browser_debug.json` | ✅ 备份 | 调试文件 |
| `~/.openclaw/workspace/evomap_bundle_openclaw_browser_debug_v2.json` | `openclaw-backup/workspace/evomap_bundle_openclaw_browser_debug_v2.json` | ✅ 备份 | 调试文件 |
| `~/.openclaw/workspace/evomap_capsule_portable_timeout.json` | `openclaw-backup/workspace/evomap_capsule_portable_timeout.json` | ✅ 备份 | 配置文件 |
| `~/.openclaw/workspace/evomap_check_node.js` | `openclaw-backup/workspace/evomap_check_node.js` | ✅ 备份 | 检查脚本 |
| `~/.openclaw/workspace/evomap_claim.js` | `openclaw-backup/workspace/evomap_claim.js` | ✅ 备份 | 认领脚本 |
| `~/.openclaw/workspace/evomap_claim_v2.js` | `openclaw-backup/workspace/evomap_claim_v2.js` | ✅ 备份 | 认领脚本 |
| `~/.openclaw/workspace/evomap_claim_v3.js` | `openclaw-backup/workspace/evomap_claim_v3.js` | ✅ 备份 | 认领脚本 |
| `~/.openclaw/workspace/evomap_completion_report.md` | `openclaw-backup/workspace/evomap_completion_report.md` | ✅ 备份 | 报告 |
| `~/.openclaw/workspace/evomap_compute_all_hashes.js` | `openclaw-backup/workspace/evomap_compute_all_hashes.js` | ✅ 备份 | 工具脚本 |
| `~/.openclaw/workspace/evomap_compute_hash.js` | `openclaw-backup/workspace/evomap_compute_hash.js` | ✅ 备份 | 工具脚本 |
| `~/.openclaw/workspace/evomap_cron_execution_result.json` | `openclaw-backup/workspace/evomap_cron_execution_result.json` | ✅ 备份 | 执行结果 |
| `~/.openclaw/workspace/evomap_cron_result.json` | `openclaw-backup/workspace/evomap_cron_result.json` | ✅ 备份 | 执行结果 |
| `~/.openclaw/workspace/evomap_debug.js` | `openclaw-backup/workspace/evomap_debug.js` | ✅ 备份 | 调试脚本 |
| `~/.openclaw/workspace/evomap_detailed_log.md` | `openclaw-backup/workspace/evomap_detailed_log.md` | ✅ 备份 | 日志 |
| `~/.openclaw/workspace/evomap_event_20260224.json` | `openclaw-backup/workspace/evomap_event_20260224.json` | ✅ 备份 | 事件数据 |
| `~/.openclaw/workspace/evomap_execute.sh` | `openclaw-backup/workspace/evomap_execute.sh` | ✅ 备份 | 执行脚本 |
| `~/.openclaw/workspace/evomap_execution_report.md` | `openclaw-backup/workspace/evomap_execution_report.md` | 备份 | 报告 |
| `~/.openclaw/workspace/evomap_execution_result.json` | `openclaw-backup/workspace/evomap_execution_result.json` | ✅ 备份 | 执行结果 |
| `~/.openclaw/workspace/evomap_execution_summary.json` | `openclaw-backup/workspace/evomap_execution_summary.json` | ✅ 备份 | 执行摘要 |
| `~/.openclaw/workspace/evomap_fetch.js` | `openclaw-backup/workspace/evomap_fetch.js` | ✅ 备份 | 获取脚本 |
| `~/.openclaw/workspace/evomap_full_flow.js` | `openclaw-backup/workspace/evomap_full_flow.js` | ✅ 备份 | 完整流程 |
| `~/.openclaw/workspace/evomap_pub.js` | `openclaw-backup/workspace/evomap_pub.js` | ✅ 备份 | 发布脚本 |
| `~/.openclaw/workspace/evomap_publish_20260224.js` | `openclaw-backup/workspace/evomap_publish_20260224.js` | ✅ 备份 | 发布脚本 |
| `~/.openclaw/workspace/evomap_publish_bundle.js` | `openclaw-backup/workspace/evomap_publish_bundle.js` | ✅ 备份 | 发布脚本 |
| `~/.openclaw/workspace/evomap_publish_final.js` | `openclaw-backup/workspace/evomap_publish_final.js` | ✅ 备份 | 发布脚本 |
| `~/.openclaw/workspace/evomap_publish_v2.js` | `openclaw-backup/workspace/evomap_publish_v2.js` | ✅ 备份 | 发布脚本 |
| `~/.openclaw/workspace/evomap_quick_run.js` | `openclaw-backup/workspace/evomap_quick_run.js` | ✅ 备份 | 快速运行 |
| `~/.openclaw/workspace/evomap_register_and_fetch.js` | `openclaw-backup/workspace/evomap_register_and_fetch.js` | ✅ 备份 | 注册获取 |
| `~/.openclaw/workspace/evomap_report_20260224_1800.md` | `openclaw-backup/workspace/evomap_report_20260224_1800.md` | ✅ 备份 | 报告 |
| `~/.openclaw/workspace/evomap_report_20260224_1825.md` | `openclaw-backup/workspace/evomap_report_20260224_1825.md` | ✅ 备份 | 报告 |
| `~/.openclaw/workspace/evomap_run_with_main_node.js` | `openclaw-backup/workspace/evomap_run_with_main_node.js` | ✅ 备份 | 运行脚本 |
| `~/.openclaw/workspace/evomap_run_with_correct_node.js` | `openclaw-backup/workspace/evomap_run_with_correct_node.js` | ✅ 备份 | 运行脚本 |
| `~/.openclaw/workspace/evomap_task_capsule.json` | `openclaw-backup/workspace/evomap_task_capsule.json` | ✅ 备份 | 任务胶囊 |
| `~/.openclaw/workspace/evomap_task_check.js` | `openclaw-backup/workspace/evomap_task_check.js` | ✅ 备份 | 检查脚本 |
| `~/.openclaw/workspace/evomap_task_execution_result.json` | `openclaw-backup/workspace/evomap_task_execution_result.json` | ✅ 备份 | 执行结果 |
| `~/.openclaw/workspace/evomap_task_flow.py` | `openclaw-backup/workspace/evomap_task_flow.py` | ✅ 备份 | Python 流程 |
| `~/.openclaw/workspace/evomap_task_gene.json` | `openclaw-backup/workspace/evomap_task_gene.json` | ✅ 备份 | 任务基因 |
| `~/.openclaw/workspace/evomap_task_gene_20260224.json` | `openclaw-backup/workspace/evomap_task_gene_20260224.json` | ✅ 备份 | 任务基因 |
| `~/.openclaw/workspace/evomap_task_log.md` | `openclaw-backup/workspace/evomap_task_log.md` | ✅ 备份 | 任务日志 |
| `~/.openclaw/workspace/evomap_task_runner.js` | `openclaw-backup/workspace/evomap_task_runner.js` | ✅ 备份 | 任务运行器 |
| `~/.openclaw/workspace/evomap_task_runner_v2.js` | `openclaw-backup/workspace/evomap_task_runner_v2.js` | ✅ 备份 | 任务运行器 |
| `~/.openclaw/workspace/evomap_task_with_node_f0b7959e.js` | `openclaw-backup/workspace/evomap_task_with_node_f0b7959e.js` | ✅ 备份 | 节点任务 |
| `~/.openclaw/workspace/evomap_test.js` | `openclaw-backup/workspace/evomap_test.js` | ✅ 备份 | 测试脚本 |
| `~/.openclaw/workspace/fetch_result.json` | `openclaw-backup/workspace/fetch_result.json` | ✅ 备份 | 获取结果 |
| `~/.openclaw/workspace/publish_bundle.js` | `openclaw-backup/workspace/publish_bundle.js` | ✅ 备份 | 发布脚本 |
| `~/.openclaw/workspace/publish_bundle2.js` | `openclaw-backup/workspace/publish_bundle2.js` | ✅ 备份 | 发布脚本 |
| `~/.openclaw/workspace/publish_payload.json` | `openclaw-backup/workspace/publish_payload.json` | ✅ 备份 | 发布负载 |

### 15.7 news/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/workspace/news/*` | `openclaw-backup/workspace/news/*` | ✅ 备份 | 新闻文件 |

---

## 十六、.clawhub/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/.clawhub/lock.json` | `openclaw-backup/.clawhub/lock.json` | ⚠️ 可选 | 锁定文件 |

---

## 统计汇总

| 操作类型 | 数量 | 说明 |
|----------|------|------|
| ✅ 直接备份 | ~280+ | 原样复制 |
| ⚠️ 脱敏后备份 | 2 | openclaw.json, .env |
| ⚠️ 可选备份 | 5 | 补全脚本、锁定文件 |
| ❌ 跳过不备份 | 11 | 临时/缓存/日志数据 |

---

## 恢复路径映射

恢复时，将备份目录中的文件复制回对应位置：

```bash
# 示例恢复命令
openclaw-backup/openclaw.json → ~/.openclaw/openclaw.json
openclaw-backup/workspace/ → ~/.openclaw/workspace/
openclaw-backup/skills/ → ~/.openclaw/skills/
# ...以此类推
```
