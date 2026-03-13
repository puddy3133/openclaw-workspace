# OpenClaw 备份目录结构说明

> 备份版本: 2026-02-27  
> 备份目标: 电脑故障时可快速恢复 OpenClaw 核心功能  
> 排除原则: 不备份向量模型、会话历史、临时文件、敏感密钥

---

## 目录结构总览

```
~/.openclaw/
├── 📄 根配置文件
├── 📁 agents/              # Agent 配置与数据
├── 📁 canvas/              # Canvas 画布
├── 📁 completions/         # Shell 补全脚本
├── 📁 credentials/         # 凭证与配对信息
├── 📁 cron/                # 定时任务
├── 📁 devices/             # 设备配对
├── 📁 extensions/          # 扩展插件
├── 📁 identity/            # 身份配置
├── 📁 logs/                # 运行日志
├── 📁 memory/              # 内存数据库
├── 📁 nodes/               # 节点配置
├── 📁 skills/              # 技能库
├── 📁 subagents/           # 子 Agent
└── 📁 workspace/           # 工作空间
```

---

## 详细文件说明

### 📄 根配置文件

| 文件 | 备份 | 说明 |
|------|------|------|
| `openclaw.json` | ✅ **备份** | 核心配置文件，包含模型、通道、扩展配置 |
| `AGENTS.md` | ✅ **备份** | Agent 行为规范文档 |
| `README.md` | ✅ **备份** | 项目说明 |
| `TOOLS.md` | ✅ **备份** | 本地工具配置备注 |
| `setup.sh` | ✅ **备份** | 安装脚本 |
| `.env` | ⚠️ **脱敏后备份** | 环境变量，可能含敏感信息，需检查 |
| `.DS_Store` | ❌ **不备份** | macOS 系统文件，无意义 |

**不备份原因:**
- `.DS_Store`: 系统自动生成，无业务价值

---

### 📁 agents/ - Agent 配置

```
agents/
└── main/
    ├── agent/
    │   └── models.json          ✅ 备份 - 自定义模型配置
    ├── qmd/
    │   ├── sessions/            ❌ 不备份 - 会话历史，可丢弃
    │   ├── xdg-cache/           ❌ 不备份 - QMD 向量缓存，可重建
    │   │   ├── bun/             ❌ 不备份 - Bun 运行时缓存
    │   │   └── qmd/
    │   │       └── index.sqlite ❌ 不备份 - QMD 向量数据库
    │   └── xdg-config/          ✅ 备份 - QMD 配置
    └── sessions/                ❌ 不备份 - 会话历史文件(.jsonl)
```

**不备份原因:**
- `sessions/`: 会话历史记录，恢复后可自动生成
- `xdg-cache/`: QMD 向量模型缓存，约 10MB，启动后会自动重建
- `index.sqlite`: 向量数据库，可重新索引生成

---

### 📁 canvas/ - 画布

```
canvas/
└── index.html                 ✅ 备份 - Canvas 页面模板
```

---

### 📁 completions/ - Shell 补全

```
completions/
├── openclaw.bash              ⚠️ 可选 - Bash 补全脚本
├── openclaw.fish              ⚠️ 可选 - Fish 补全脚本
├── openclaw.ps1               ⚠️ 可选 - PowerShell 补全脚本
└── openclaw.zsh               ⚠️ 可选 - Zsh 补全脚本
```

**说明:** 补全脚本可通过 `openclaw completions` 重新生成，可选备份

---

### 📁 credentials/ - 凭证

```
credentials/
├── feishu-allowFrom.json      ✅ 备份 - 飞书白名单配置
└── feishu-pairing.json        ✅ 备份 - 飞书配对信息
```

**说明:** 恢复后可能需要重新授权，但配置结构值得保留

---

### 📁 cron/ - 定时任务

```
cron/
├── jobs.json                  ✅ 备份 - 定时任务定义
├── jobs.json.bak              ❌ 不备份 - 自动备份文件
└── runs/                      ❌ 不备份 - 任务执行历史
    └── *.jsonl
```

**不备份原因:**
- `jobs.json.bak`: 自动生成的备份
- `runs/`: 任务执行历史日志，可丢弃

---

### 📁 devices/ - 设备配对

```
devices/
├── paired.json                ✅ 备份 - 已配对设备
└── pending.json               ⚠️ 可选 - 待配对请求
```

---

### 📁 extensions/ - 扩展插件

```
extensions/
├── context-warning-plugin/    ✅ 备份 - 上下文警告插件
│   ├── index.js
│   └── openclaw.plugin.json
├── heartbeat-file-plugin/     ✅ 备份 - 心跳文件插件
│   ├── index.js
│   └── openclaw.plugin.json
├── memory-tfidf-plugin/       ✅ 备份 - 内存 TFIDF 插件
│   ├── index.js
│   └── openclaw.plugin.json
└── simple-cron-plugin/        ✅ 备份 - 简单定时插件
    ├── index.js
    ├── openclaw.plugin.json
    └── package.json
```

---

### 📁 identity/ - 身份配置

```
identity/
├── device-auth.json           ✅ 备份 - 设备认证
└── device.json                ✅ 备份 - 设备信息
```

---

### 📁 logs/ - 运行日志

```
logs/
├── gateway.err.log            ❌ 不备份 - 错误日志
└── gateway.log                ❌ 不备份 - 运行日志
```

**不备份原因:** 纯日志文件，无恢复价值

---

### 📁 memory/ - 内存数据库

```
memory/
└── main.sqlite                ❌ 不备份 - 内存数据库
```

**不备份原因:** 会话历史与短期记忆，恢复后可重新生成

---

### 📁 nodes/ - 节点配置

```
nodes/
└── node_openclaw_main.json    ✅ 备份 - 主节点配置
```

---

### 📁 skills/ - 技能库

```
skills/
├── agent-browser/             ✅ 备份 - 浏览器自动化技能
├── brave-search/              ✅ 备份 - Brave 搜索技能
├── clawdhub/                  ✅ 备份 - ClawdHub 技能管理
├── data-analyst/              ✅ 备份 - 数据分析技能
├── image-assistant/           ✅ 备份 - 配图助手技能
├── playwright-headless-browser/ ✅ 备份 - Playwright 浏览器技能
├── prd-doc-writer/            ✅ 备份 - PRD 文档技能
├── priority-judge/            ✅ 备份 - 优先级判断技能
├── project-map-builder/       ✅ 备份 - 项目地图技能
├── req-change-workflow/       ✅ 备份 - 需求变更工作流技能
├── self-improving-agent/      ✅ 备份 - 自我改进技能
├── skill-vetter/              ✅ 备份 - 技能审查技能
├── summarize/                 ✅ 备份 - 总结技能
├── task-status/               ✅ 备份 - 任务状态技能
├── thinking-partner/          ✅ 备份 - 思考拍档技能
├── thought-mining/            ✅ 备份 - 思维挖掘技能
├── ui-design/                 ✅ 备份 - UI 设计技能
├── version-planner/           ✅ 备份 - 版本规划技能
├── weather/                   ✅ 备份 - 天气技能
├── weekly-report/             ✅ 备份 - 周报技能
└── writing-assistant/         ✅ 备份 - 写作助手技能
```

**注意:** 技能目录中的 `node_modules/` 不备份，可通过 `npm install` 恢复

---

### 📁 subagents/ - 子 Agent

```
subagents/
├── coder/                     ✅ 备份 - 编码子 Agent
│   ├── SOUL.md
│   └── TOOLS.md
└── planner/                   ✅ 备份 - 规划子 Agent
    ├── SOUL.md
    └── TOOLS.md
```

---

### 📁 workspace/ - 工作空间

```
workspace/
├── AGENTS.md                  ✅ 备份 - Agent 配置
├── CRON.json                  ✅ 备份 - 定时任务配置
├── HEARTBEAT-CHECK.md         ✅ 备份 - 心跳检查项
├── HEARTBEAT.md               ✅ 备份 - 心跳指令
├── IDENTITY.md                ✅ 备份 - 身份定义
├── MEMORY.md                  ✅ 备份 - 长期记忆
├── SOUL.md                    ✅ 备份 - 核心人格
├── STARTUP.md                 ✅ 备份 - 启动配置
├── TOOLS.md                   ✅ 备份 - 工具备注
├── USER.md                    ✅ 备份 - 用户信息
│
├── memory/                    ✅ 备份 - 记忆文件
│   └── projects/
│
├── puddy_skillshub/           ✅ 备份 - 自定义技能
│   ├── image-assistant/
│   ├── lesson-builder/
│   ├── prd-doc-writer/
│   ├── priority-judge/
│   ├── project-map-builder/
│   ├── req-change-workflow/
│   ├── thinking-partner/
│   ├── thought-mining/
│   ├── ui-design/
│   ├── version-planner/
│   ├── weekly-report/
│   └── writing-assistant/
│
├── scripts/                   ✅ 备份 - 自定义脚本
├── tasks/                     ✅ 备份 - 任务管理
│   ├── active/
│   ├── archive/
│   ├── recurring/
│   └── waiting/
│
├── evomap_automation/         ✅ 备份 - Evomap 自动化项目
├── evomap_solutions/          ✅ 备份 - Evomap 解决方案
├── news/                      ✅ 备份 - 新闻目录
│
└── [其他 evomap 相关文件]      ✅ 备份 - 项目相关文件
```

---

### 📁 .clawhub/ - ClawHub 配置

```
.clawhub/
└── lock.json                  ⚠️ 可选 - 锁定文件
```

**说明:** 可选备份，恢复后可重新同步

---

## 备份汇总表

| 类别 | 备份 | 不备份 | 可选 |
|------|------|--------|------|
| 核心配置 | 6 | 1 | 0 |
| Agent 数据 | 2 | 4 | 0 |
| 凭证 | 2 | 0 | 0 |
| 定时任务 | 1 | 2 | 0 |
| 扩展插件 | 4 | 0 | 0 |
| 身份配置 | 2 | 0 | 0 |
| 技能库 | 21 | 0 | 0 |
| 子 Agent | 4 | 0 | 0 |
| 工作空间 | 全部 | 0 | 0 |
| 日志/缓存 | 0 | 4 | 0 |
| **总计** | **约 50** | **约 11** | **约 5** |

---

## 恢复后需手动处理

1. **API Key 配置**: `openclaw.json` 中的 API Key 需重新填入
2. **飞书重新授权**: 配对信息可能需要重新验证
3. **QMD 重建**: 首次启动会自动重建向量索引
4. **npm 依赖**: 技能目录中的 `node_modules` 需运行 `npm install`

---

## 备份命令参考

```bash
# 创建备份目录
mkdir -p openclaw-backup/{agents,canvas,credentials,cron,devices,extensions,identity,nodes,skills,subagents,workspace}

# 复制核心文件
cp ~/.openclaw/openclaw.json openclaw-backup/
cp ~/.openclaw/*.md openclaw-backup/

# 复制各目录（排除不备份项）
rsync -av --exclude='xdg-cache' --exclude='sessions' ~/.openclaw/agents/ openclaw-backup/agents/
rsync -av ~/.openclaw/credentials/ openclaw-backup/credentials/
rsync -av --exclude='runs' --exclude='*.bak' ~/.openclaw/cron/ openclaw-backup/cron/
rsync -av --exclude='node_modules' ~/.openclaw/skills/ openclaw-backup/skills/
rsync -av ~/.openclaw/workspace/ openclaw-backup/workspace/

# 压缩
tar czf openclaw-backup-$(date +%Y%m%d).tar.gz openclaw-backup/
```
