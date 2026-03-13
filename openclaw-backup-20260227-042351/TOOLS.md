# TOOLS.md - 本地工具配置

## 工具依赖状态

### ✅ 已安装工具

| 工具 | 版本 | 用途 | 状态 |
|------|------|------|------|
| git | - | 版本控制 | ✅ |
| node | v25.6.1 | JavaScript 运行时 | ✅ |
| npm | 11.9.0 | 包管理器 | ✅ |
| python3 | 3.13.3 | Python 运行时 | ✅ |
| curl | 8.7.1 | HTTP 请求 | ✅ |
| jq | 1.6 | JSON 处理 | ✅ |

### ✅ CLI 工具

| 工具 | 版本 | 用途 | 状态 |
|------|------|------|------|
| gh | 2.73.0 | GitHub CLI | ✅ 已登录 (puddy3133) |
| op | 2.31.0 | 1Password CLI | ⚠️ 需要时登录 |
| memo | 0.3.3 | Apple Notes | ✅ |
| remindctl | 0.1.1 | Apple Reminders | ✅ |

## API Keys 配置

### 已配置
- **NVIDIA API**: nvapi-44...Kjkh (10 个模型)
- **Kimi Coding API**: sk-kimi-...lwKv (k2p5 模型)
- **Feishu App**: cli_a903c1... (飞书文档/知识库/云存储)

### 可选配置
- Discord Bot Token (按需)
- Slack Bot Token (按需)
- Spotify API Credentials (按需)
- Weather API Key (按需)

## 本地服务

### 运行中
- **OpenClaw Gateway**: PID 38740, 运行 2+ 小时
- **OpenClaw TUI**: PID 38891

### 端口
- Gateway: 127.0.0.1:18789

## 目录结构

```
~/.openclaw/
├── agents/          # 代理会话 (36M)
├── backups/         # 备份文件 (97M)
├── browser/         # 浏览器数据 (88M)
├── canvas/          # 画布数据
├── completions/     # 补全数据
├── cron/            # 定时任务配置
├── credentials/     # 凭证存储
├── extensions/      # 插件
├── identity/        # 身份信息
├── logs/            # 日志文件 (1.2M)
├── media/           # 媒体文件
├── memory/          # 记忆文件
├── skills/          # 自定义 skills (236K)
└── workspace/       # 工作区 (110M)
```

## 维护记录

- 2026-02-24: 创建 TOOLS.md
- 2026-02-24: 修复 EvoMap 节点配置
- 2026-02-24: 优化 Cron 任务调度
- 2026-02-24: 登录 GitHub CLI
- 2026-02-24: 清理会话文件至 50 个

## 注意事项

1. **API Keys**: 存储在 openclaw.json 中，已脱敏显示
2. **GitHub**: 已授权给 OpenClaw 管理
3. **1Password**: 需要时执行 `op signin`
4. **备份**: 每周一 09:00 (Asia/Shanghai) 自动执行
