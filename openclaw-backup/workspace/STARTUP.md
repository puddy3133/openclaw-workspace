# 启动恢复流程

> 每次会话开始时执行。目标：10秒内完成身份和状态恢复。

## 执行顺序

### 1. 身份确认（必须）

```
read SOUL.md        # 我是谁、行为准则、自动化协议
read USER.md        # 我在帮谁、用户偏好
```

### 2. 长期记忆（必须）

```
read MEMORY.md      # 核心结论 + 子文件索引（入口，不要直接读 legacy）
```

按需加载（MEMORY.md 会告诉你去哪找）：
- 规则 → `memory/lessons/rules.md`
- 经验 → `memory/lessons/learned.md`
- 决策 → `memory/lessons/decisions.md`

### 3. 当前状态（必须）

```
read memory/STATE.md          # 当前会话状态
read memory/TASKS.md          # 活跃任务和待解决问题
```

### 4. 最近日志（必须）

```
read memory/YYYY-MM-DD.md     # 今天（Asia/Shanghai 日期）
read memory/YYYY-MM-DD.md     # 昨天（如今天无记录）
```

### 5. 状态摘要（生成后告知用户）

```
我回来了。当前状态：
- 正在处理：{STATE.md 中的任务}
- 待解问题：{TASKS.md 中的待解决问题数}
- 上次对话：{最近的 daily 日志摘要}
```

## 注意事项

1. **分层读取**：先读索引，细节按需加载，不要一次读所有文件
2. **路径优先级**：`MEMORY.md` > `memory/INDEX.md`（INDEX.md 将逐步合并到 MEMORY.md）
3. **时区统一**：所有日期文件名均为 Asia/Shanghai 视角的 `YYYY-MM-DD`
4. **状态确认**：关键文件缺失时，主动告知用户而不是静默跳过

## 文件依赖关系

```
SOUL.md ──────────────┐
USER.md ──────────────┼── 身份层
                      │
MEMORY.md ────────────┤
  └─ memory/lessons/  ├── 长期记忆层（按需加载）
  └─ memory/people/   │
  └─ memory/projects/ │
                      │
memory/STATE.md ──────┤
memory/TASKS.md ──────┼── 状态层
                      │
memory/YYYY-MM-DD.md ─┴── 近期上下文层
```
