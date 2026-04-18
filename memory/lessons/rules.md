
<!-- 2026-04-06 reflection -->
- [2026-04-06] Mac mini 远程管理必须配置：关闭休眠(pmset sleep 0/hibernatemode 0/disksleep 0)、启用网络唤醒(womp 1)、frpc LaunchAgent 自启动
- [2026-04-06] Fish.audio 是目前唯一支持大乔/小乔音色的 TTS 平台，其他平台(NVIDIA/硅基流动)不可用
- [2026-04-06] TTS 播客生成需要预定义 voice mapping 和对话 JSON 格式，使用 ffmpeg 合并音频片段
- [2026-04-06] Skill 开发标准结构：README, SKILL.md, skill.json, install.sh, scripts/, assets/
- [2026-04-06] PPT 内容提取流程：解压→提取 slide XML→整理 Markdown→飞书文档创建

<!-- 2026-04-07 reflection -->
- [2026-04-07] OpenClaw 备份策略：每天 12:30 自动执行 → GitHub 私有仓库；源文件形式（非压缩）；排除 node_modules/、*.gguf 模型文件、evomap*/puddy_skillshub/tasks 目录
- [2026-04-07] 备份范围：config/、workspace/、agents/、memory_main/、skills/、extensions/、credentials/、cron/、subagents/、identity/、devices/、completions/
- [2026-04-07] 备份脚本位置：~/.openclaw/workspace/scripts/backup-to-github.sh（生产）和 backup-openclaw.sh（完整压缩版）
- [2026-04-07] 恢复方法：克隆仓库 → 复制目录到 ~/.openclaw/ → 重新配置 API Keys → openclaw doctor 检查

<!-- 2026-04-08 reflection -->
- [2026-04-08] 学习归档流程：完成学习后需同步更新三处——完整笔记目录、经验提取目录、索引文件
- [2026-04-08] 红线思维应用：设计prompt时优先定义'不要什么'而非仅定义'要什么'
- [2026-04-08] Skill设计应以'声音'为核心维度，而非功能清单

<!-- 2026-04-11 reflection -->
- [2026-04-11] 每日自动检查流程：启动时检查昨日记忆日志 → 创建今日日志 → 检查TASKS.md → 23:30自动复盘
- [2026-04-11] 日志创建时间规则：北京时间凌晨02:11:28自动触发
- [2026-04-11] 自我进化准备固定项：执行效率检查、流程优化识别、MEMORY.md更新
- [2026-04-11] 待办状态标记规范：[ ] 未完成，[x] 完成，需显式标注'完成'状态

<!-- 2026-04-12 reflection -->
- [2026-04-12] 飞书群聊消息发送前必须确认正确的 open_chat_id，避免发错群
- [2026-04-12] 飞书 @机器人需要该机器人已在群内，否则无法获取 open_id
- [2026-04-12] 心跳补录的会话需在每日手记中标注 #心跳补录 标签
- [2026-04-12] 火山引擎豆包语音自定义音色需先通过「声音复刻」功能生成音色ID（前缀 S_/saturn_/DiT_）
- [2026-04-12] 飞书插件多人会话控制命令：STOP/RESUME/LOCK TOPIC，需在 session-lock.js 中管理状态

<!-- 2026-04-13 reflection -->
- [2026-04-13] Multi-Agent 对话中继中，history_fetch_window_seconds 应设置为 3600 秒以确保足够的历史消息捕获
- [2026-04-13] 话题锁定/解锁检测必须仅在人类用户消息时触发，避免在 Agent 消息时误触发
- [2026-04-13] 飞书机器人 token 变更后需同步检查对应 gateway 是否已启动

<!-- 2026-04-16 reflection -->
- [2026-04-16] 投标项目必须遵循'不扩大范围 + 全覆盖响应 + 稳妥'三原则
- [2026-04-16] 完整备份需同步 ~/.openclaw/ 所有目录 + workspace/ 到 openclaw-backup 私有仓库
- [2026-04-16] 夜间深度学习触发后，需清理无效断点、处理积压队列、归档学习成果

<!-- 2026-04-17 reflection -->
- [2026-04-17] 处理飞书文档任务前，必须先验证授权token有效性，避免任务中断
- [2026-04-17] 发现授权过期时，立即撤销旧授权并发送新授权请求，同时暂停当前任务等待用户确认
