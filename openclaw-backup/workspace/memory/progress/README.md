# 主线程进度追踪规范

> 2026-03-04 确立

## 目的
防止长步骤任务会话断开后，无法找到进度继续执行。

## 进度文件存储

### 位置
`memory/progress/{task-id}-{timestamp}.md`

### 命名规则
- `task-id`: 任务标识（如：openclaw-check, skill-verify）
- `timestamp`: YYYYMMDD-HHMMSS（用户时区）

### 内容格式
```markdown
# 任务进度: {task-name}

## 元信息
- **任务ID**: {task-id}
- **开始时间**: YYYY-MM-DD HH:MM:SS (Asia/Shanghai)
- **会话类型**: web / feishu / tui
- **用户ID**: {user-id}
- **状态**: running / paused / completed / error

## 当前进度
- **已完成**: [x] 步骤1
- **已完成**: [x] 步骤2
- **进行中**: [ ] 步骤3
- **待执行**: [ ] 步骤4

## 关键数据
（存储中间结果、临时变量等）

## 最后更新
YYYY-MM-DD HH:MM:SS (Asia/Shanghai)
```

## 更新时机

| 场景 | 操作 |
|------|------|
| 任务启动 | 创建进度文件，状态设为 running |
| 每完成一个步骤 | 更新进度文件，标记已完成 |
| 会话即将断开 | 更新状态为 paused，保存当前进度 |
| 任务完成 | 状态设为 completed，归档到 memory/archive/ |
| 发生错误 | 状态设为 error，记录错误信息 |

## 恢复机制

### 会话启动时检查
```bash
1. 扫描 memory/progress/*.md
2. 找到状态为 running/paused 的文件
3. 按时间排序，取最新的
4. 询问用户是否恢复
```

### 恢复流程
```
检测到未完成任务: {task-name}
开始时间: YYYY-MM-DD HH:MM:SS
当前进度: 步骤 X / 总步骤 Y

是否继续执行？
[继续] [重新开始] [忽略]
```

## 清理策略

- **已完成任务**: 7天后自动归档到 `memory/archive/progress/`
- **错误任务**: 30天后清理
- **手动清理**: 用户可随时删除

## 示例

### 场景: OpenClaw 全面检查

**进度文件**: `memory/progress/openclaw-check-20260304-101500.md`

```markdown
# 任务进度: OpenClaw 全面检查

## 元信息
- **任务ID**: openclaw-check
- **开始时间**: 2026-03-04 10:15:00 (Asia/Shanghai)
- **会话类型**: tui
- **用户ID**: puddy
- **状态**: running

## 当前进度
- [x] 1. 核心文件检查（10个）
- [x] 2. 系统级 Skills（26个）
- [x] 3. 工作区 Skills（15个）
- [ ] 4. Agent 配置（进行中）
- [ ] 5. 子 Agent
- [ ] 6. 插件
- [ ] 7. 定时任务
- [ ] 8. 扩展
- [ ] 9. 环境变量

## 关键数据
- 已验证 skills: 41个
- 发现问题: 2个
- 待修复: 配置文件权限

## 最后更新
2026-03-04 10:31:00 (Asia/Shanghai)
```
