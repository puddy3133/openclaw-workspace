- [2026-04-07] **Prompt心法-双层解释**: 初学者版本用"洗脚城大爷"画像（生活化不幼稚），专业版本保证准确性，对照学习。

- [2026-04-07] **飞书官方插件安全实践**: 涉及敏感权限（消息、文档、日历），建议先用个人账号测试，确认安全后再接入工作账号。默认配置仅响应所有者@，避免群内误触发。
- [2026-04-07] **飞书插件流式输出**: 开启 `streaming: true` 和 `footer.elapsed/status`，体验更丝滑透明。
- [2026-04-07] **飞书话题群隔离**: 开启 `threadSession: true`，每个话题独立上下文，支持多任务并行。
- [2026-04-07] **飞书插件诊断**: 遇到问题时用 `/feishu doctor` 自检，`--fix` 自动修复常见问题。
- [2026-04-07] **飞书权限最小化**: 群内回复建议用模式1（仅所有者@）或模式4（指定群@），避免数据泄露风险。

<!-- 2026-04-05 reflection -->
- [2026-04-05] PPTX文件可直接解压获取渲染后的页面图片，比解析XML更可靠验证最终显示效果
- [2026-04-05] 大乔服务器状态需持续监控，已纳入常规待办
- [2026-04-05] image读取工具可有效替代OCR进行视觉层面的文字清晰度验证

<!-- 2026-04-06 reflection -->
- [2026-04-06] Fish.audio API 需要单独注册获取 Key，非开箱即用
- [2026-04-06] Mac pmset 参数：-c 表示充电器模式，sleep/standby/hibernatemode/disksleep 需全部关闭才能实现真正永不休眠
- [2026-04-06] frpc 双进程现象：可能是旧进程未清理，实际不影响功能但需注意 PID 变化
- [2026-04-06] PPT 解压后文本在 ppt/slides/slide*.xml 的 <a:t> 标签中，需按 slide 顺序提取
- [2026-04-06] Frontend Slides Skill 支持多种主题：stark(黑白)、solarized、nord、dracula 等

<!-- 2026-04-07 reflection -->
- [2026-04-07] OpenClaw 备份策略：每天 12:30 自动执行 backup-to-github.sh → 推送源文件到 GitHub 私有仓库
- [2026-04-07] 备份排除项：node_modules/、*.gguf 模型文件、evomap*/puddy_skillshub/tasks 目录
- [2026-04-07] 备份范围：config/、workspace/、agents/、memory_main/、skills/、extensions/、credentials/、cron/、subagents/、identity/、devices/、completions/
- [2026-04-07] 恢复流程：克隆仓库 → 复制到 ~/.openclaw/ → 重新配置 API Keys → openclaw doctor 检查
- [2026-04-07] **Frontend Slides Skill 缺省风格**：Electric Studio 主题（深色封面 #0a0a0a + 白色内容页 #ffffff，蓝色强调色 #0066ff，字体 Noto Sans SC + Manrope）

<!-- 2026-04-08 reflection -->
- [2026-04-08] 隐喻替换比知识堆砌更能改变模型行为模式
- [2026-04-08] Skill设计需覆盖'理解→传播'完整链路，而非仅优化单点交互
- [2026-04-08] 30分钟深度学习单篇长文+即时归档是可持续的学习节奏

<!-- 2026-04-11 reflection -->
- [2026-04-11] 日志系统现状：昨日日志不存在或为空时，系统能自动检测并创建新日志
- [2026-04-11] 复盘机制：每日23:30自动触发复盘流程，需更新MEMORY.md核心结论

- [2026-W15] PPTX质量验证优先采用解压取图法，比XML解析更能反映真实渲染效果
- [2026-W15] Fish.audio等第三方API需预留独立Key注册流程，非开箱即用
- [2026-W15] Prompt设计采用'洗脚城大爷'式生活化比喻与专业版本对照的双层解释法
- [2026-W15] 飞书插件开启streaming与threadSession可显著提升多任务并行体验
