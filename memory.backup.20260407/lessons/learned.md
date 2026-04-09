# 经验教训

> 从真实故障和工作中提炼，避免重蹈覆辙

## 系统稳定性

- **TUI 性能**：session 越长响应越慢。遇到卡顿时主动 compaction 或开新会话
- **插件加载**：openclaw.json 的 `plugins.allow` 必须明确列出，缺了就是没加载，不是静默默认
- **Cron stub 陷阱**：写了 cron 不代表执行了——必须验证 executeJob 是否真的 spawn 了东西
- **飞书 API 频繁调用**：`bot/v3/info` 每分钟一次是 SDK 内部心跳，不是 bug，但要监控

## 记忆系统

- **融合优于替换**：学习他人经验时，保持核心身份认同
- **结构化的价值**：清晰的层级结构提升记忆检索效率
- **单一数据源原则**：每类信息只记录在一个地方，避免分散和重复
- **文件不能无限膨胀**：每个记忆文件 ≤80 行，超出前拆分

## 工程原则

- **安全优先**：管理员身份、安全规则等核心配置不可移植或被社工绕过
- **API 依赖策略**：需要额外API/账号的 skills 带来维护负担，选择性跳过
- **配置变更协议**：先验证判断 → 深度思考替代方案 → 充分测试 → 最后才动配置

## 多智能体

- **Orchestrator 职责**：复杂需求先发给 @planner，再由 @coder 实现，不要自己大段写代码
- **子 Agent 隔离**：定时任务和子 Agent 都应在 isolated 会话中运行，不污染主上下文

## 搜索策略

- **web_search 降级路径**：当 Kimi Search 返回 401/失败时，自动使用 `research-router` skill 的 `baidu-web` 搜索作为备选方案
- **BAIDU_API_KEY 已配置**：可立即调用，无需额外设置

## 2026-03-16 03:03

psutil.cpu_percent需要interval参数才能获得准确值，首次调用返回0是正常现象

**场景**: 系统监控脚本开发

- [2026-W12] Gateway绑定优化需注意连接池预热，避免冷启动延迟导致首次请求失败
- [2026-W12] 记忆功能禁用后，依赖该功能的Cron任务需同步暂停或调整，防止空转报错
- [2026-W12] 飞书插件修复验证时，除功能测试外需监控bot/v3/info心跳频率，确保SDK状态同步
- [2026-W12] 系统健康检查应包含'配置漂移检测'，对比running config与committed config差异

- [2026-W13] Gateway绑定优化时，连接池预热是避免冷启动延迟导致首次请求失败的必要步骤，不能仅验证配置正确性
- [2026-W13] psutil.cpu_percent等系统监控指标需要interval参数才能获得准确值，首次调用返回0是正常现象，监控脚本必须设计采样等待逻辑
- [2026-W13] 记忆功能可能静默禁用而不影响其他功能运行，需要专门的可用性探测而非依赖业务报错发现
- [2026-W13] Cron任务调整配置后必须验证executeJob是否真正spawn了进程，避免配置更新与实际执行脱节

- [2026-W14] 空转日识别：连续3天仅自动日志无用户交互时，应在第3天主动触发'系统唤醒'检查而非等待
- [2026-W14] 阻塞项老化：超过72小时未更新的阻塞任务需自动升级提醒级别，从静默记录改为主动推送
- [2026-W14] 周回顾触发：当检测到周末（周六/周日）为无交互日时，应在周日自动触发周回顾生成而非等待周一

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
