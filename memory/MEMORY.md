# MEMORY.md — 核心结论
> ≤20 条核心结论 + 知识库导航 | 每次复盘时更新

## 核心结论

### 系统运行
1. OpenClaw 备份：每天 12:30 自动推送源文件到 GitHub 私有仓库，排除 node_modules/、*.gguf
2. 日志创建：北京时间 02:11:28 自动触发，存入 `memory/day/`
3. 每日复盘：23:30 自动触发，需更新本文件核心结论
4. 小乔/大乔 daemon 需持续监控 PID 和轮次，Gateway 进程随热更新变化

### 技术规则
5. Fish.audio 是唯一支持大乔/小乔音色的 TTS 平台，需单独注册 API Key
6. Mac mini 远程管理：pmset 关闭 sleep/standby/hibernatemode/disksleep，启用 womp，frpc LaunchAgent 自启
7. 飞书群聊发送前必须确认 open_chat_id；@机器人需机器人已在群内
8. 火山引擎自定义音色需先完成「声音复刻」生成音色 ID（前缀 S_/saturn_/DiT_）

### 设计原则
9. 优先做减法（红线/边界）而非加法（功能/知识）
10. Skill 设计需覆盖「理解→传播」完整链路，而非仅优化单点交互
11. 群聊场景优先保证可控性：提供明确的 STOP/RESUME/LOCK 机制
12. 技术调研输出需结构化归档到 `lessons/`，便于后续复用

### Hermes 学习机制（新增）
13. 非平凡任务成功后触发学习闭环：提取推理模式 → 存入 `patterns/`
14. 任务开始前检索 `patterns/` 中相关历史模式，优先复用
15. 用户修正输出后：记录修正内容 + 原因 → 更新 `people/国栋.md` 反馈信号

## 知识库导航

| 目录/文件 | 内容 |
|-----------|------|
| [INDEX.md](INDEX.md) | 完整知识分类导航 |
| [RULES.md](RULES.md) | 系统级约束（安全/执行/性能/Cron） |
| [lessons/rules.md](lessons/rules.md) | 操作知识（平台规则、工具用法） |
| [lessons/principles.md](lessons/principles.md) | 工作原则 |
| [lessons/learned.md](lessons/learned.md) | 历史教训、避坑指南 |
| [patterns/](patterns/) | Hermes 学习闭环提取的推理模式库 |
| [people/国栋.md](people/国栋.md) | 用户四维模型（偏好/决策/模式/反馈） |
| [day/](day/) | 所有日常日志 |

---
*更新时间：2026-04-13*
