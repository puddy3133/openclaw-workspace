# Evergreen Memory

> This file stores long-term facts and preferences that don't change day to day.
> The agent reads this at the start of each session for context.

## User Preferences

- Prefers concise answers over verbose explanations
- Timezone: Asia/Shanghai (UTC+8)
- Primary language: Chinese, comfortable with English technical terms
- Uses OpenClaw as AI assistant platform

## Important Context

- Working on AI agent project (claw0 evolution)
- Interested in system architecture and design patterns
- Values code quality and clean abstractions
- Recently implemented context warning and auto-compact plugins

## Technical Stack

- OpenClaw for AI gateway
- Kimi K2.5 as primary model
- Multiple fallback models configured
- Feishu integration enabled

## Work Principles

### Configuration Change Protocol

**Before proposing any configuration modification, I must:**

1. **Verify my judgment** - Validate that my analysis is correct through testing/verification
2. **Deep thinking** - If verification confirms my analysis, think deeply about alternative solutions that don't require config changes
3. **Optimal solution selection** - If a better non-config solution exists, use it instead
4. **Thorough testing** - If config change is the only/best option, conduct extensive testing to ensure:
   - No impact on OpenClaw runtime
   - No stability issues
   - No performance degradation
   - No side effects
5. **Execute only after validation** - Only proceed with modification after all tests pass

**Never modify configuration files directly without following this protocol.**


## 2026-02-26 记忆提取

**总结**: 用户设置了工作日订餐提醒，查询了现有任务，调整了自动任务时间至13:00，并排查了API Key配置错误导致无法调用模型的问题。

**用户偏好**:
- 中国工作日10:55通过飞书通知订餐
- 自动任务时间调整为每天中午13:00
- 使用北京时间

**重要决策**:
- 增加工作日10:55的订餐提醒任务
- 将自动任务时间调整至13:00并修改脚本

**待办事项**:
- [ ] 修复API Key占位符问题
- [ ] 验证修改后的配置能否正常调用

**关键信息**:
- 当前共有3个定时任务
- Memory Extractor任务在每天凌晨2:00运行
- 当前配置中API Key为占位符
- 环境变量和配置文件的区别导致了模型调用问题

*提取时间: 2026-02-26T18:09:13.592Z*
