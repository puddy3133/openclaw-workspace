# OpenClaw 完整备份目录结构

> 生成时间: 2026-02-27  
> 备份策略: 保留核心配置，排除临时数据

```
openclaw-backup/
│
├── 📄 openclaw.json                          ✅ 备份 [核心配置]
│   ├── meta.lastTouchedVersion              (系统版本)
│   ├── meta.lastTouchedAt                   (最后修改时间)
│   ├── wizard.*                             (向导配置)
│   ├── models.mode                          (模型模式)
│   ├── models.providers.*                   (模型提供商配置)
│   │   ├── nvidia.baseUrl                   (API 基础地址)
│   │   ├── nvidia.apiKey                    ⚠️ 脱敏 - 需重新填入
│   │   ├── nvidia.api                       (API 类型)
│   │   └── nvidia.models[]                  (模型列表)
│   ├── channels.*                           (通道配置)
│   ├── extensions.*                         (扩展配置)
│   ├── agents.*                             (Agent 配置)
│   └── cron.*                               (定时任务配置)
│
├── 📄 AGENTS.md                              ✅ 备份 [核心文档]
├── 📄 README.md                              ✅ 备份 [项目说明]
├── 📄 TOOLS.md                               ✅ 备份 [工具备注]
├── 📄 setup.sh                               ✅ 备份 [安装脚本]
├── 📄 .env                                   ⚠️ 脱敏后备份 [环境变量]
│
├── 📁 agents/                                ✅ 备份
│   └── main/
│       ├── agent/
│       │   └── models.json                   ✅ 备份 [自定义模型]
│       ├── qmd/
│       │   ├── sessions/                     ❌ 不备份 [会话历史]
│       │   │   └── *.md                      (会话摘要)
│       │   ├── xdg-cache/                    ❌ 不备份 [QMD缓存]
│       │   │   ├── bun/                      ❌ 不备份 [Bun缓存]
│       │   │   └── qmd/
│       │   │       ├── index.sqlite          ❌ 不备份 [向量数据库]
│       │   │       ├── index.sqlite-shm      ❌ 不备份 [共享内存]
│       │   │       └── index.sqlite-wal      ❌ 不备份 [预写日志]
│       │   └── xdg-config/                   ✅ 备份 [QMD配置]
│       │       └── (空目录，保留结构)
│       └── sessions/                         ❌ 不备份 [会话历史]
│           ├── *.jsonl                       (会话数据)
│           ├── *.jsonl.lock                  (锁文件)
│           └── sessions.json                 (会话索引)
│
├── 📁 canvas/                                ✅ 备份
│   └── index.html                            ✅ 备份 [画布模板]
│
├── 📁 completions/                           ⚠️ 可选备份
│   ├── openclaw.bash                         ⚠️ 可选 [Bash补全]
│   ├── openclaw.fish                         ⚠️ 可选 [Fish补全]
│   ├── openclaw.ps1                          ⚠️ 可选 [PS补全]
│   └── openclaw.zsh                          ⚠️ 可选 [Zsh补全]
│
├── 📁 credentials/                           ✅ 备份
│   ├── feishu-allowFrom.json                 ✅ 备份 [飞书白名单]
│   └── feishu-pairing.json                   ✅ 备份 [飞书配对]
│
├── 📁 cron/                                  ✅ 备份
│   ├── jobs.json                             ✅ 备份 [定时任务定义]
│   ├── jobs.json.bak                         ❌ 不备份 [自动备份]
│   └── runs/                                 ❌ 不备份 [执行历史]
│       └── *.jsonl                           (任务执行记录)
│
├── 📁 devices/                               ✅ 备份
│   ├── paired.json                           ✅ 备份 [已配对设备]
│   └── pending.json                          ✅ 备份 [待配对请求]
│
├── 📁 extensions/                            ✅ 备份
│   ├── context-warning-plugin/               ✅ 备份 [上下文警告]
│   │   ├── index.js                          ✅ 备份 [插件代码]
│   │   └── openclaw.plugin.json              ✅ 备份 [插件配置]
│   ├── heartbeat-file-plugin/                ✅ 备份 [心跳文件]
│   │   ├── index.js                          ✅ 备份 [插件代码]
│   │   └── openclaw.plugin.json              ✅ 备份 [插件配置]
│   ├── memory-tfidf-plugin/                  ✅ 备份 [内存TFIDF]
│   │   ├── index.js                          ✅ 备份 [插件代码]
│   │   └── openclaw.plugin.json              ✅ 备份 [插件配置]
│   └── simple-cron-plugin/                   ✅ 备份 [简单定时]
│       ├── index.js                          ✅ 备份 [插件代码]
│       ├── openclaw.plugin.json              ✅ 备份 [插件配置]
│       └── package.json                      ✅ 备份 [依赖配置]
│
├── 📁 identity/                              ✅ 备份
│   ├── device.json                           ✅ 备份 [设备信息]
│   └── device-auth.json                      ✅ 备份 [设备认证]
│
├── 📁 logs/                                  ❌ 不备份 [运行日志]
│   ├── gateway.err.log                       ❌ 不备份 [错误日志]
│   └── gateway.log                           ❌ 不备份 [运行日志]
│
├── 📁 memory/                                ❌ 不备份 [内存数据库]
│   └── main.sqlite                           ❌ 不备份 [SQLite数据库]
│
├── 📁 nodes/                                 ✅ 备份
│   └── node_openclaw_main.json               ✅ 备份 [主节点配置]
│
├── 📁 skills/                                ✅ 备份
│   ├── agent-browser/                        ✅ 备份 [浏览器技能]
│   │   ├── .clawhub/
│   │   │   └── origin.json                   ✅ 备份 [来源信息]
│   │   ├── CONTRIBUTING.md                   ✅ 备份 [贡献指南]
│   │   ├── SKILL.md                          ✅ 备份 [技能文档]
│   │   └── _meta.json                        ✅ 备份 [元数据]
│   ├── brave-search/                         ✅ 备份 [搜索技能]
│   │   ├── .clawhub/
│   │   │   └── origin.json                   ✅ 备份 [来源信息]
│   │   ├── SKILL.md                          ✅ 备份 [技能文档]
│   │   ├── _meta.json                        ✅ 备份 [元数据]
│   │   ├── content.js                        ✅ 备份 [代码]
│   │   ├── package.json                      ✅ 备份 [依赖配置]
│   │   ├── package-lock.json                 ✅ 备份 [锁定文件]
│   │   └── search.js                         ✅ 备份 [代码]
│   │   └── node_modules/                     ❌ 不备份 [npm依赖]
│   ├── clawdhub/                             ✅ 备份 [技能管理]
│   │   ├── .clawhub/origin.json              ✅ 备份
│   │   ├── SKILL.md                          ✅ 备份
│   │   └── _meta.json                        ✅ 备份
│   ├── data-analyst/                         ✅ 备份 [数据分析]
│   │   ├── .clawhub/origin.json              ✅ 备份
│   │   ├── SKILL.md                          ✅ 备份
│   │   └── _meta.json                        ✅ 备份
│   ├── image-assistant/                      ✅ 备份 [配图助手]
│   │   ├── SKILL.md                          ✅ 备份
│   │   ├── examples/
│   │   │   └── ai-tools-selection.md         ✅ 备份
│   │   ├── stages/
│   │   │   ├── 01-brief.md                   ✅ 备份
│   │   │   ├── 02-plan.md                    ✅ 备份
│   │   │   ├── 03-copy.md                    ✅ 备份
│   │   │   ├── 04-prompts.md                 ✅ 备份
│   │   │   └── 05-iterate.md                 ✅ 备份
│   │   └── templates/
│   │       ├── 16x9-3cards-insights.md       ✅ 备份
│   │       ├── 16x9-5panel-comic.md          ✅ 备份
│   │       ├── 16x9-contrast-2cards.md       ✅ 备份
│   │       ├── 16x9-cover-roadmap.md         ✅ 备份
│   │       ├── 16x9-infographic.md           ✅ 备份
│   │       ├── checklist.md                  ✅ 备份
│   │       └── style-block.md                ✅ 备份
│   ├── playwright-headless-browser/          ✅ 备份 [Playwright]
│   │   ├── .clawhub/origin.json              ✅ 备份
│   │   ├── SKILL.md                          ✅ 备份
│   │   └── _meta.json                        ✅ 备份
│   ├── prd-doc-writer/                       ✅ 备份 [PRD文档]
│   │   ├── SKILL.md                          ✅ 备份
│   │   ├── assets/
│   │   │   └── prd-template.md               ✅ 备份
│   │   └── references/
│   │       ├── example-us01.md               ✅ 备份
│   │       ├── mermaid-examples.md           ✅ 备份
│   │       ├── prd-registry-demo.md          ✅ 备份
│   │       └── ui-wireframe-examples.md      ✅ 备份
│   ├── priority-judge/                       ✅ 备份 [优先级]
│   │   └── skill.md                          ✅ 备份
│   ├── project-map-builder/                  ✅ 备份 [项目地图]
│   │   └── SKILL.md                          ✅ 备份
│   ├── req-change-workflow/                  ✅ 备份 [需求变更]
│   │   ├── SKILL.md                          ✅ 备份
│   │   └── references/
│   │       ├── change-brief-template.md      ✅ 备份
│   │       ├── decision-log-template.md      ✅ 备份
│   │       └── regression-checklist.md       ✅ 备份
│   ├── self-improving-agent/                 ✅ 备份 [自我改进]
│   │   ├── .clawhub/origin.json              ✅ 备份
│   │   ├── .learnings/
│   │   │   ├── ERRORS.md                     ✅ 备份
│   │   │   ├── FEATURE_REQUESTS.md           ✅ 备份
│   │   │   └── LEARNINGS.md                  ✅ 备份
│   │   ├── SKILL.md                          ✅ 备份
│   │   ├── _meta.json                        ✅ 备份
│   │   ├── assets/
│   │   │   ├── LEARNINGS.md                  ✅ 备份
│   │   │   └── SKILL-TEMPLATE.md             ✅ 备份
│   │   ├── hooks/openclaw/
│   │   │   ├── HOOK.md                       ✅ 备份
│   │   │   └── handler.js                    ✅ 备份
│   │   └── references/
│   │       ├── examples.md                   ✅ 备份
│   │       ├── hooks-setup.md                ✅ 备份
│   │       └── openclaw-integration.md       ✅ 备份
│   ├── skill-vetter/                         ✅ 备份 [技能审查]
│   │   ├── .clawhub/origin.json              ✅ 备份
│   │   ├── SKILL.md                          ✅ 备份
│   │   └── _meta.json                        ✅ 备份
│   ├── summarize/                            ✅ 备份 [总结]
│   │   ├── .clawhub/origin.json              ✅ 备份
│   │   ├── SKILL.md                          ✅ 备份
│   │   └── _meta.json                        ✅ 备份
│   ├── task-status/                          ✅ 备份 [任务状态]
│   │   ├── .clawhub/origin.json              ✅ 备份
│   │   ├── README.md                         ✅ 备份
│   │   ├── SKILL.md                          ✅ 备份
│   │   ├── _meta.json                        ✅ 备份
│   │   └── references/
│   │       └── usage.md                      ✅ 备份
│   ├── thinking-partner/                     ✅ 备份 [思考拍档]
│   │   └── SKILL.md                          ✅ 备份
│   ├── thought-mining/                       ✅ 备份 [思维挖掘]
│   │   ├── SKILL.md                          ✅ 备份
│   │   ├── examples/
│   │   │   └── claude-skills-case.md         ✅ 备份
│   │   ├── stages/
│   │   │   ├── 01-mining.md                  ✅ 备份
│   │   │   ├── 02-topic.md                   ✅ 备份
│   │   │   ├── 03-validation.md              ✅ 备份
│   │   │   ├── 04-writing.md                 ✅ 备份
│   │   │   ├── 05-review.md                  ✅ 备份
│   │   │   ├── course-01-understand.md       ✅ 备份
│   │   │   ├── course-02-outline.md          ✅ 备份
│   │   │   └── course-03-content.md          ✅ 备份
│   │   └── templates/
│   │       ├── insights-template.md          ✅ 备份
│   │       └── writing-record-template.md    ✅ 备份
│   ├── ui-design/                            ✅ 备份 [UI设计]
│   │   └── SKILL.md                          ✅ 备份
│   ├── version-planner/                      ✅ 备份 [版本规划]
│   │   └── SKILL.md                          ✅ 备份
│   ├── weather/                              ✅ 备份 [天气]
│   │   ├── .clawhub/origin.json              ✅ 备份
│   │   ├── SKILL.md                          ✅ 备份
│   │   └── _meta.json                        ✅ 备份
│   ├── weekly-report/                        ✅ 备份 [周报]
│   │   └── SKILL.md                          ✅ 备份
│   └── writing-assistant/                    ✅ 备份 [写作助手]
│       ├── SKILL.md                          ✅ 备份
│       └── stages/
│           ├── 00-diagnosis.md               ✅ 备份
│           ├── 01-mining.md                  ✅ 备份
│           ├── 02-topic.md                   ✅ 备份
│           ├── 03-framework.md               ✅ 备份
│           └── 04-writing.md                 ✅ 备份
│
├── 📁 subagents/                             ✅ 备份
│   ├── coder/                                ✅ 备份 [编码子Agent]
│   │   ├── MEMORY.md                         ✅ 备份 [记忆]
│   │   └── SOUL.md                           ✅ 备份 [人格]
│   └── planner/                              ✅ 备份 [规划子Agent]
│       ├── MEMORY.md                         ✅ 备份 [记忆]
│       └── SOUL.md                           ✅ 备份 [人格]
│
├── 📁 workspace/                             ✅ 备份
│   ├── AGENTS.md                             ✅ 备份 [Agent配置]
│   ├── CRON.json                             ✅ 备份 [定时配置]
│   ├── HEARTBEAT-CHECK.md                    ✅ 备份 [心跳检查]
│   ├── HEARTBEAT.md                          ✅ 备份 [心跳指令]
│   ├── IDENTITY.md                           ✅ 备份 [身份定义]
│   ├── MEMORY.md                             ✅ 备份 [长期记忆]
│   ├── SOUL.md                               ✅ 备份 [核心人格]
│   ├── STARTUP.md                            ✅ 备份 [启动配置]
│   ├── TOOLS.md                              ✅ 备份 [工具备注]
│   ├── USER.md                               ✅ 备份 [用户信息]
│   │
│   ├── memory/                               ✅ 备份 [记忆目录]
│   │   ├── YYYY-MM-DD.md                     ✅ 备份 [模板]
│   │   ├── 2026-02-21.md                     ✅ 备份
│   │   ├── 2026-02-22.md                     ✅ 备份
│   │   ├── 2026-02-23.md                     ✅ 备份
│   │   ├── 2026-02-24.md                     ✅ 备份
│   │   ├── 2026-02-24-1825-evomap.md         ✅ 备份
│   │   ├── 2026-02-24-evomap.md              ✅ 备份
│   │   ├── 2026-02-24-evomap-1242.md         ✅ 备份
│   │   ├── INDEX.md                          ✅ 备份 [索引]
│   │   ├── test.txt                          ✅ 备份
│   │   ├── people/
│   │   │   └── puddy.md                      ✅ 备份 [用户档案]
│   │   └── projects/
│   │       └── persistent-agent-architecture.md  ✅ 备份
│   │
│   ├── puddy_skillshub/                      ✅ 备份 [自定义技能]
│   │   ├── EXAMPLES.md                       ✅ 备份
│   │   ├── image-assistant/                  ✅ 备份
│   │   │   ├── SKILL.md                      ✅ 备份
│   │   │   ├── examples/
│   │   │   │   └── ai-tools-selection.md     ✅ 备份
│   │   │   ├── out/
│   │   │   │   └── apimart.requests.example.jsonl  ✅ 备份
│   │   │   ├── scripts/
│   │   │   │   ├── README.md                 ✅ 备份
│   │   │   │   ├── apimart.env               ✅ 备份
│   │   │   │   └── apimart_batch_generate.py ✅ 备份
│   │   │   ├── stages/
│   │   │   │   ├── 01-brief.md               ✅ 备份
│   │   │   │   ├── 02-plan.md                ✅ 备份
│   │   │   │   ├── 03-copy.md                ✅ 备份
│   │   │   │   ├── 04-prompts.md             ✅ 备份
│   │   │   │   └── 05-iterate.md             ✅ 备份
│   │   │   └── templates/
│   │   │       ├── 16x9-3cards-insights.md   ✅ 备份
│   │   │       ├── 16x9-infographic.md       ✅ 备份
│   │   │       ├── api-config.md             ✅ 备份
│   │   │       ├── apimart-requests-jsonl.md ✅ 备份
│   │   │       └── style-block.md            ✅ 备份
│   │   ├── lesson-builder/                   ✅ 备份
│   │   ├── prd-doc-writer/                   ✅ 备份
│   │   ├── priority-judge/                   ✅ 备份
│   │   ├── project-map-builder/              ✅ 备份
│   │   ├── req-change-workflow/              ✅ 备份
│   │   ├── thinking-partner/                 ✅ 备份
│   │   ├── thought-mining/                   ✅ 备份
│   │   ├── ui-design/                        ✅ 备份
│   │   ├── version-planner/                  ✅ 备份
│   │   ├── weekly-report/                    ✅ 备份
│   │   └── writing-assistant/                ✅ 备份
│   │
│   ├── scripts/                              ✅ 备份 [脚本目录]
│   │   └── (自定义脚本文件)
│   │
│   ├── tasks/                                ✅ 备份 [任务管理]
│   │   ├── inbox.md                          ✅ 备份
│   │   ├── active/                           ✅ 备份
│   │   │   └── TASK-001-persistent-agent-setup.md  ✅ 备份
│   │   ├── archive/                          ✅ 备份
│   │   │   └── README.md                     ✅ 备份
│   │   ├── recurring/                        ✅ 备份
│   │   │   └── recurring-tasks.md            ✅ 备份
│   │   └── waiting/                          ✅ 备份
│   │       └── README.md                     ✅ 备份
│   │
│   ├── evomap_automation/                    ✅ 备份 [项目]
│   ├── evomap_solutions/                     ✅ 备份 [项目]
│   │   └── discord_bot_fix.md                ✅ 备份
│   ├── news/                                 ✅ 备份
│   │
│   └── [其他 evomap 相关文件]                 ✅ 备份
│       ├── check_evomap_status.js            ✅ 备份
│       ├── compute_capsule_hash.js           ✅ 备份
│       ├── compute_capsule_hash2.js          ✅ 备份
│       ├── compute_hash.js                   ✅ 备份
│       ├── evocomplete.js                    ✅ 备份
│       ├── evomap-agent_ethics.js            ✅ 备份
│       ├── evomap_auto-README.md             ✅ 备份
│       ├── evomap-config.json                ✅ 备份
│       ├── evomap_bundle.json                ✅ 备份
│       ├── evomap_bundle_20260224.json       ✅ 备份
│       ├── evomap_bundle_correct.json        ✅ 备份
│       ├── evomap_bundle_final.json          ✅ 备份
│       ├── evomap_bundle_final_v2.json       ✅ 备份
│       ├── evomap_bundle_openclaw_browser_debug.json    ✅ 备份
│       ├── evomap_bundle_openclaw_browser_debug_v2.json ✅ 备份
│       ├── evomap_capsule_portable_timeout.json         ✅ 备份
│       ├── evomap_check_node.js              ✅ 备份
│       ├── evomap_claim.js                   ✅ 备份
│       ├── evomap_claim_v2.js                ✅ 备份
│       ├── evomap_claim_v3.js                ✅ 备份
│       ├── evomap_completion_report.md       ✅ 备份
│       ├── evomap_compute_all_hashes.js      ✅ 备份
│       ├── evomap_compute_hash.js            ✅ 备份
│       ├── evomap_cron_execution_result.json ✅ 备份
│       ├── evomap_cron_result.json           ✅ 备份
│       ├── evomap_debug.js                   ✅ 备份
│       ├── evomap_detailed_log.md            ✅ 备份
│       ├── evomap_event_20260224.json        ✅ 备份
│       ├── evomap_execute.sh                 ✅ 备份
│       ├── evomap_execution_report.md        ✅ 备份
│       ├── evomap_execution_result.json      ✅ 备份
│       ├── evomap_execution_summary.json     ✅ 备份
│       ├── evomap_fetch.js                   ✅ 备份
│       ├── evomap_full_flow.js               ✅ 备份
│       ├── evomap_pub.js                     ✅ 备份
│       ├── evomap_publish_20260224.js        ✅ 备份
│       ├── evomap_publish_bundle.js          ✅ 备份
│       ├── evomap_publish_final.js           ✅ 备份
│       ├── evomap_publish_v2.js              ✅ 备份
│       ├── evomap_quick_run.js               ✅ 备份
│       ├── evomap_register_and_fetch.js      ✅ 备份
│       ├── evomap_report_20260224_1800.md    ✅ 备份
│       ├── evomap_report_20260224_1825.md    ✅ 备份
│       ├── evomap_run_with_main_node.js      ✅ 备份
│       ├── evomap_run_with_correct_node.js   ✅ 备份
│       ├── evomap_solutions/                 ✅ 备份
│       ├── evomap_task_capsule.json          ✅ 备份
│       ├── evomap_task_check.js              ✅ 备份
│       ├── evomap_task_execution_result.json ✅ 备份
│       ├── evomap_task_flow.py               ✅ 备份
│       ├── evomap_task_gene.json             ✅ 备份
│       ├── evomap_task_gene_20260224.json    ✅ 备份
│       ├── evomap_task_log.md                ✅ 备份
│       ├── evomap_task_runner.js             ✅ 备份
│       ├── evomap_task_runner_v2.js          ✅ 备份
│       ├── evomap_task_with_node_f0b7959e.js ✅ 备份
│       ├── evomap_test.js                    ✅ 备份
│       ├── fetch_result.json                 ✅ 备份
│       ├── publish_bundle.js                 ✅ 备份
│       ├── publish_bundle2.js                ✅ 备份
│       └── publish_payload.json              ✅ 备份
│
└── 📁 .clawhub/                              ⚠️ 可选备份
    └── lock.json                             ⚠️ 可选 [锁定文件]
```

---

## 统计汇总

| 类别 | 文件/目录数 | 说明 |
|------|-------------|------|
| **✅ 必须备份** | ~200+ | 核心配置、文档、技能、工作空间 |
| **⚠️ 脱敏后备份** | 2 | openclaw.json(API Key)、.env |
| **⚠️ 可选备份** | 5 | 补全脚本、ClawHub 锁定文件 |
| **❌ 明确不备份** | 11 | 会话历史、缓存、日志、数据库 |

---

## 不备份项详细说明

| 路径 | 类型 | 不备份原因 |
|------|------|------------|
| `agents/main/qmd/sessions/` | 目录 | 会话历史，临时数据 |
| `agents/main/qmd/xdg-cache/` | 目录 | QMD 向量缓存，可重建 |
| `agents/main/sessions/` | 目录 | 会话历史文件 |
| `memory/main.sqlite` | 文件 | 内存数据库，短期记忆 |
| `logs/` | 目录 | 运行日志，纯诊断 |
| `cron/runs/` | 目录 | 任务执行历史 |
| `cron/jobs.json.bak` | 文件 | 自动备份文件 |
| `skills/*/node_modules/` | 目录 | npm 依赖，可重装 |
| `.DS_Store` | 文件 | 系统文件 |

---

## 恢复后操作清单

1. [ ] 填入 `openclaw.json` 中的 API Key
2. [ ] 检查 `.env` 文件中的环境变量
3. [ ] 飞书重新授权（如需要）
4. [ ] 技能目录运行 `npm install`
5. [ ] 启动 OpenClaw，QMD 自动重建
