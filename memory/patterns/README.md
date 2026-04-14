# patterns/ — 推理模式库
> Hermes 学习闭环提取的可复用推理模式

## 用途

存储从成功任务中提取的推理模式（reasoning patterns）。
不同于 `lessons/learned.md`（事实性教训），这里存的是**可复用的操作链路和决策框架**。

## 文件命名规范

```
{task-type}-{YYYY-MM-DD}.md
```

示例：
- `feishu-group-message-2026-04-12.md`
- `tts-integration-2026-04-06.md`
- `multi-agent-relay-2026-04-13.md`

## Pattern 模板

```markdown
---
task-type: {类型}
context: {触发场景一句话描述}
date: YYYY-MM-DD
tags: [tag1, tag2]
---

## 场景
{什么情况下遇到这个问题}

## 方法
{具体推理步骤或操作链路}

## 效果
{结果如何，用户反应}

## 注意事项
{坑点或边界条件}
```

## 检索方式

启动非平凡任务前，按 task-type 或 tags 搜索相关 pattern。
找到匹配时，提示用户"上次类似任务的做法是..."并询问是否沿用。

---
*此目录由学习闭环自动维护，也可手动添加*
