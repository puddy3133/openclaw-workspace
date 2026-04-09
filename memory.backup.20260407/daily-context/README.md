# 每日上下文复盘规范

> 2026-03-04 确立

## 目的
- 存储每日所有会话上下文
- 自动复盘提取知识点
- 基于复盘自我进化

## 存储机制

### 位置
`memory/daily-context/{YYYY-MM-DD}.json`

### 内容格式
```json
{
  "date": "2026-03-04",
  "timezone": "Asia/Shanghai",
  "sessions": [
    {
      "sessionId": "xxx",
      "type": "webchat / feishu / tui",
      "startTime": "10:30",
      "endTime": "12:15",
      "duration": "105分钟",
      "topics": ["主题1", "主题2"],
      "keyDecisions": ["决策1"],
      "filesModified": ["文件1"],
      "summary": "会话摘要"
    }
  ],
  "dailySummary": {
    "totalSessions": 3,
    "totalDuration": "180分钟",
    "mainTopics": ["主题1", "主题2"],
    "filesCreated": [],
    "filesModified": [],
    "knowledgeGained": ["知识点1", "知识点2"]
  }
}
```

## 复盘流程

### 时间
每天 23:00 (Asia/Shanghai)

### 步骤
```
1. 收集当日所有会话记录
2. 提取关键主题和决策
3. 识别修改的文件
4. 总结知识点
5. 更新技能树
6. 生成进化建议
```

## 自我进化

### 学习机制
| 来源 | 学习方式 |
|------|----------|
| 技术讨论 | 提取新概念，更新知识库 |
| 问题解决 | 记录解决方案，形成模式 |
| 用户反馈 | 调整行为策略 |
| 错误处理 | 更新错误处理手册 |

### 进化输出
- 更新 `SKILL.md`
- 更新 `MEMORY.md`
- 优化响应模板
- 改进工具使用

## 示例

```json
{
  "date": "2026-03-04",
  "sessions": [
    {
      "type": "tui",
      "topics": ["OpenClaw检查", "插件部署", "EvoMap清理"],
      "keyDecisions": [
        "部署 context-manager 插件替换旧插件",
        "清理所有 EvoMap 文件"
      ],
      "knowledgeGained": [
        "OpenClaw 插件机制",
        "上下文压缩策略",
        "GitHub 备份流程"
      ]
    }
  ],
  "evolution": {
    "skillsImproved": ["插件开发", "系统管理"],
    "newPatterns": ["阶梯式压缩", "进度追踪"],
    "toLearn": ["更多 OpenClaw 钩子"]
  }
}
```
