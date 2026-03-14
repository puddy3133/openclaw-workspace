# OpenClaw 配置备份

本仓库包含 OpenClaw 的完整配置备份，可在新设备上快速恢复。

## 📁 目录结构

```
.
├── AGENTS.md              # 代理配置规则（系统管理员、安全规则、用户偏好）
├── TOOLS.md               # 本地工具配置
├── config/                # 核心配置文件
│   ├── openclaw.json     # 主配置（API密钥已脱敏）
│   ├── .env.example      # 环境变量模板
│   └── cron/
│       └── jobs.json     # 定时任务配置
├── completions/           # Shell 补全脚本
├── canvas/                # 画布基础文件
├── skills/                # 自定义 Skills
├── extensions/            # 自定义插件
├── workspace/             # 工作空间
└── setup.sh               # 一键恢复脚本
```

## 🚀 快速恢复

### 方式一：使用脚本（推荐）

```bash
# 1. 克隆仓库
git clone https://github.com/puddy3133/openclaw-backup.git ~/.openclaw

# 2. 运行恢复脚本
cd ~/.openclaw && chmod +x setup.sh && ./setup.sh

# 3. 配置 API 密钥
vim ~/.openclaw/.env  # 填入你的 API 密钥

# 4. 启动 OpenClaw
openclaw
```

### 方式二：手动恢复

```bash
# 1. 克隆仓库
git clone https://github.com/puddy3133/openclaw-backup.git ~/.openclaw

# 2. 安装 OpenClaw（如果未安装）
npm install -g openclaw

# 3. 配置环境变量
cp ~/.openclaw/config/.env.example ~/.openclaw/.env
# 编辑 .env 填入 API 密钥

# 4. 初始化目录
mkdir -p ~/.openclaw/{agents,backups,browser,canvas,completions,credentials,cron/runs,devices,extensions,identity,logs,media,memory,subagents}

# 5. 启动
openclaw
```

## ⚙️ 需要手动配置的内容

以下配置因设备绑定或安全原因未备份，需要在新设备上重新配置：

| 配置项 | 说明 | 操作 |
|--------|------|------|
| API 密钥 | NVIDIA、Kimi 等 | 编辑 `~/.openclaw/.env` |
| Feishu 凭证 | 飞书 App 凭证 | 运行 `openclaw feishu auth` |
| 设备配对 | 已配对设备 | 运行 `openclaw devices pair` |
| GitHub CLI | 登录状态 | 运行 `gh auth login` |
| 1Password | CLI 登录 | 运行 `op signin` |

## 🔒 安全说明

- **API 密钥**已脱敏，恢复时需手动填入
- **设备身份**和**配对信息**未备份，新设备会生成新的身份
- **凭证文件**未备份，需重新授权

## 📝 备份范围

### ✅ 已备份
- 代理配置规则（AGENTS.md）
- 工具配置（TOOLS.md）
- 主配置文件（openclaw.json）
- 定时任务配置（cron/jobs.json）
- 自定义 Skills
- 自定义 Extensions
- 工作空间（workspace/）
- Shell 补全脚本
- 画布基础文件

### ❌ 未备份
- 敏感凭证（credentials/）
- 设备绑定信息（devices/）
- 设备身份（identity/）
- 日志文件（logs/）
- 媒体缓存（media/）
- 会话文件（agents/）
- 历史运行记录（cron/runs/）

## 🔄 更新备份

如需更新此备份仓库：

```bash
cd ~/.openclaw
./update-backup.sh  # 如果有此脚本
# 或手动复制修改的文件并提交
```

---

**最后更新**: 2026-02-25
