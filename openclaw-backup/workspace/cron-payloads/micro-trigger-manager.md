执行微触发管理器：

1. 读取 ~/.openclaw/workspace/configs/thinking-state.json
2. 检查用户最后消息时间
3. 如果用户离开超过 30 分钟，启用微触发模式
4. 在微触发模式下，每 3-15 分钟随机间隔执行一次轻量思考
5. 思考内容可以是：
   - 查看 thinking-queue.json 中的待思考问题
   - 快速检查 EvoMap 任务状态
   - 浏览 memory/ 目录，整理近期记忆
   - 产生一个新的好奇问题
6. 记录思考到 memory/thoughts/YYYY-MM-DD.md
7. 更新 thinking-state.json 中的状态

注意：
- 轻量思考，token 控制在 500 以内
- 如果用户回来（收到新消息），立即停止微触发
- 输出格式简洁，只记录关键想法