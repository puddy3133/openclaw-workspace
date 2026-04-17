# 记忆索引 - 小乔
> 渐进式披露 | 快速定位关键信息

## 📊 健康度概览
- 🟢 知识文件：**13 lessons + 5 patterns + 22 projects + 3 people** ✅
- 🟢 day/ 活跃：**34 个** | 已归档：**16 个**
- 🟢 标签覆盖率：**100%**（auto-tagger 已启用）
- 🟢 .learning/：5 个分析脚本已就绪，cron 已注册
- 🟢 插件：learning-loop-plugin + pattern-loader-plugin 已注册
- 🆕 学习库：5 个已完成学习，completion-log 已建立

## 📚 知识分类

### lessons/ — 经验教训 (13 个)
| 文件 | 内容 | 更新 |
|------|------|------|
| [rules.md](lessons/rules.md) | 时区/线程/推送/安全强制规则 | 活跃 |
| [decisions.md](lessons/decisions.md) | 关键架构和设计决策 | 14天前 |
| [learned.md](lessons/learned.md) | 历史教训、避坑指南 | 活跃 |
| [principles.md](lessons/principles.md) | 工作原则、技术偏好 | 活跃 |
| [cron-ops.md](lessons/cron-ops.md) | 定时任务格式和清单 | 14天前 |
| [memory-file-usage.md](lessons/memory-file-usage.md) | 记忆文件使用规范 | 19天前 |
| [humanizer-zh-skill.md](lessons/humanizer-zh-skill.md) | AI写作去痕工具使用指南 | 活跃 |
| [cli-tools-ecosystem.md](lessons/cli-tools-ecosystem.md) | CLI 工具生态 | 活跃 |
| [hermes-agent-research-report.md](lessons/hermes-agent-research-report.md) | Hermes Agent 调研报告 | 活跃 |
| [learning-loop.md](lessons/learning-loop.md) | 学习闭环规则（Hermes） | 活跃 |
| [ljg-redline-thinking.md](lessons/ljg-redline-thinking.md) | 李继刚红线思维方法论 | 活跃 |
| [pageindex-rag.md](lessons/pageindex-rag.md) | PageIndex RAG 调研 | - |
| [user-modeling-rules.md](lessons/user-modeling-rules.md) | 用户建模规则 | 活跃 |

### projects/ — 项目状态 (22 个)
| 文件 | 内容 | 更新 |
|------|------|------|
| [persistent-agent-architecture.md](projects/persistent-agent-architecture.md) | 持久化 Agent 架构 | 13天前 |
| [coder-agent-completion.md](projects/coder-agent-completion.md) | Coder Agent 完成记录 | 6天前 |
| [frontend-slides.md](projects/frontend-slides.md) | 前端幻灯片生成 | 活跃 |
| [fish-audio-tts.md](projects/fish-audio-tts.md) | Fish.audio TTS | 活跃 |
| [大乔服务器.md](projects/大乔服务器.md) | 大乔服务器维护 | 活跃 |
| [macmini-zhc.md](projects/macmini-zhc.md) | zhc Mac mini 配置 | 活跃 |
| [ai训练营作业.md](projects/ai训练营作业.md) | AI训练营 | - |
| [openclaw-tui.md](projects/openclaw-tui.md) | TUI项目 | - |

### people/ — 人物档案 (3 个)
| 文件 | 内容 | 更新 |
|------|------|------|
| [国栋.md](people/国栋.md) | 用户/管理员（含 Puddy 信息） | 活跃 |
| [daqiao.md](people/daqiao.md) | 大乔（AI姐姐） | 10天前 |
| [zhc.md](people/zhc.md) | 同事/合作伙伴 | - |

### patterns/ — 推理模式库 (5 个)
| 文件 | 内容 | 更新 |
|------|------|------|
| [bidding-analysis.md](patterns/bidding-analysis.md) | 投标文件分析策略 | 今日 |
| [technical-proposal.md](patterns/technical-proposal.md) | 技术方案生成框架 | 今日 |
| [nightly-learning.md](patterns/nightly-learning.md) | 夜间批量学习流程 | 今日 |
| [knowledge-digestion.md](patterns/knowledge-digestion.md) | 知识消化三轮过滤 | 今日 |
| [multi-agent-orchestration.md](patterns/multi-agent-orchestration.md) | 多 Agent 接力协议 | 今日 |

### 🆕 learning-queue/ — 学习库
| 目录 | 用途 |
|------|------|
| `pending/` | 待决定学习内容 |
| `scheduled/` | 已排期夜间学习 |
| `in-progress/` | 断点续学状态 |
| `completed/` | 已完成学习内容 |
| `archive/` | 归档内容 |

### daily-context/ — 每日上下文快照
| 目录 | 用途 |
|------|------|
| `daily-context/` | 每日会话开始时生成的 JSON 上下文快照，保留最近 7 天，由 expiration-policy 自动清理 |

### decisions/ — 架构决策记录 (4 个)
| 文件 | 内容 |
|------|------|
| [daily-log-creation-optimization.md](decisions/daily-log-creation-optimization.md) | 日志创建流程优化决策 |
| [memory-system-upgrade.md](decisions/memory-system-upgrade.md) | 记忆系统架构升级决策 |
| 选择psutil而非os.popen.md | 系统监控工具选型 |
| 采用四层记忆体系.md | 四层记忆防御体系决策 |

### weekly/ — 周回顾 (7 个)
| 文件 | 内容 |
|------|------|
| 最近: [2026-W15.md](weekly/2026-W15.md) | W09–W15 自动生成的周回顾 |

## 🎯 当前活跃
→ 查看 [NOW.md](NOW.md) 获取近 3 天优先级

## 📅 近期重要事件
| 日期 | 事件 | 影响 |
|------|------|------|
| 2026-04-16 | 记忆系统 8 项优化落地 | .learning/ 初始化、5 个 cron job 注册、day/ 归档、pattern 命名修复、反馈捕获机制 |
| 2026-04-07 | 知识系统 v2.0 升级 | 新增学习库、索引系统 |
| 2026-03-21 | 记忆系统优化执行 | P0-P3 按计划推进 |
| 2026-03-14 | 记忆系统架构升级 | 根据彬子文章优化结构 |

## 🔗 快速导航
| 文件 | 用途 |
|------|------|
| [MEMORY.md](../MEMORY.md) | 核心结论（≤20条）+ 知识库索引 |
| [NOW.md](NOW.md) | 当前优先级（近3天） |
| [TASKS.md](TASKS.md) | 完整任务清单 |
| [STATE.md](STATE.md) | 当日状态 |

---
*此文件是记忆的渐进式披露入口，启动时先读此文件*
*更新时间：2026-04-16 14:00 CST*
