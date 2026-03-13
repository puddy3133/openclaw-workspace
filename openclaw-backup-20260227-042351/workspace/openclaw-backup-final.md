# OpenClaw 备份方案（最终版）

> 版本: 2026-02-27  
> 状态: 最终确认  
> 源目录: ~/.openclaw/  
> 目标目录: openclaw-backup/

---

## 一、备份策略确认

### 1.1 备份范围

| 类别 | 策略 | 说明 |
|------|------|------|
| **核心配置** | 必须备份 | openclaw.json、所有 .md 文档 |
| **Agent 数据** | 部分备份 | 仅备份配置，不备份会话和缓存 |
| **凭证信息** | 必须备份 | 飞书配对信息 |
| **定时任务** | 必须备份 | 任务定义，不备份执行历史 |
| **扩展插件** | 必须备份 | 全部插件代码和配置 |
| **技能库** | 必须备份 | 全部技能（排除 node_modules）|
| **子 Agent** | 必须备份 | coder、planner 配置 |
| **工作空间** | 必须备份 | 完整 workspace 目录 |
| **Shell 补全** | 必须备份 | bash、fish、zsh、ps1 补全脚本 |
| **ClawHub 锁定** | 必须备份 | lock.json |

### 1.2 明确不备份项

| 路径 | 类型 | 不备份原因 |
|------|------|------------|
| `agents/main/qmd/sessions/` | 目录 | 会话历史摘要 |
| `agents/main/qmd/xdg-cache/` | 目录 | QMD 向量缓存 |
| `agents/main/sessions/` | 目录 | 会话数据文件 |
| `memory/main.sqlite` | 文件 | **内存数据库（详见第二节）** |
| `logs/` | 目录 | 运行日志 |
| `cron/runs/` | 目录 | 任务执行历史 |
| `cron/jobs.json.bak` | 文件 | 自动备份文件 |
| `skills/*/node_modules/` | 目录 | npm 依赖 |
| `.DS_Store` | 文件 | 系统文件 |

---

## 二、为什么不备份内存数据库（main.sqlite）

### 2.1 内存数据库是什么

`~/.openclaw/memory/main.sqlite` 是 OpenClaw 的**短期记忆数据库**，存储：

- 当前会话的上下文信息
- 最近的对话历史（未归档到 MEMORY.md 的部分）
- 临时状态数据
- 运行时缓存

### 2.2 不备份的六大理由

#### 理由一：临时性数据

内存数据库存储的是**瞬时状态**，就像电脑的 RAM：

```
会话A进行中 → 数据在内存数据库
会话A结束 → 数据应归档到 MEMORY.md
关机/重启 → 内存数据库失去时效性
```

**类比**：就像你不会备份手机的"最近使用"列表，而是备份通讯录。

#### 理由二：可自动重建

恢复流程中，内存数据库会**自动生成**：

```
1. 启动 OpenClaw
2. 读取 workspace/MEMORY.md（长期记忆）
3. 读取 workspace/memory/*.md（每日记忆）
4. 新的对话开始 → 自动写入内存数据库
```

**结论**：恢复后首次对话即自动重建，无需备份。

#### 理由三：体积大且增长快

| 时间 | 预估大小 | 说明 |
|------|----------|------|
| 初始 | 5MB | 基础结构 |
| 1周后 | 20MB+ | 积累会话数据 |
| 1月后 | 100MB+ | 大量历史记录 |

**问题**：备份包会因此膨胀，但内容无长期价值。

#### 理由四：恢复后 irrelevant

假设你备份了内存数据库，恢复后会遇到：

```
内存数据库记录：
- "昨天讨论了 Evomap 项目进度"
- "用户要求修改 API 配置"
- "会话ID: abc-123-xyz"

恢复后的现实：
- 没有 "昨天" 的上下文
- API 配置可能已变更
- 会话ID 全部失效
```

**结论**：旧内存数据对新环境是"垃圾信息"。

#### 理由五：与长期记忆重复

OpenClaw 有**双重记忆机制**：

| 层级 | 存储位置 | 备份策略 |
|------|----------|----------|
| 短期记忆 | `memory/main.sqlite` | ❌ 不备份 |
| 长期记忆 | `workspace/MEMORY.md` | ✅ 备份 |
| 每日记忆 | `workspace/memory/*.md` | ✅ 备份 |

**机制**：重要信息会通过 Memory Extractor 自动从短期记忆提取到长期记忆。

#### 理由六：安全和隐私

内存数据库可能包含：
- 最近的敏感对话片段
- 临时的 API 响应数据
- 未清理的调试信息

**不备份 = 减少敏感数据泄露风险**

### 2.3 恢复后的实际影响

| 场景 | 有内存数据库 | 无内存数据库 |
|------|--------------|--------------|
| 启动 OpenClaw | 正常启动 | 正常启动 |
| AI 人格 | 完整保留 | 完整保留（来自 SOUL.md）|
| 长期记忆 | 完整保留 | 完整保留（来自 MEMORY.md）|
| 技能功能 | 完整保留 | 完整保留 |
| 定时任务 | 完整保留 | 完整保留 |
| 最近对话 | 可查看 | **从新开始**（通常无影响）|

**结论**：不备份内存数据库，对恢复后的功能**零影响**。

---

## 三、完整路径映射表

### 3.1 根目录文件

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/openclaw.json` | `openclaw-backup/openclaw.json` | ⚠️ 脱敏 | API Key 替换为占位符 |
| `~/.openclaw/AGENTS.md` | `openclaw-backup/AGENTS.md` | ✅ 备份 | |
| `~/.openclaw/README.md` | `openclaw-backup/README.md` | ✅ 备份 | |
| `~/.openclaw/TOOLS.md` | `openclaw-backup/TOOLS.md` | ✅ 备份 | |
| `~/.openclaw/setup.sh` | `openclaw-backup/setup.sh` | ✅ 备份 | |
| `~/.openclaw/.env` | `openclaw-backup/.env` | ⚠️ 脱敏 | 敏感信息清除 |
| `~/.openclaw/.DS_Store` | - | ❌ 跳过 | 系统文件 |

### 3.2 agents/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/agents/main/agent/models.json` | `openclaw-backup/agents/main/agent/models.json` | ✅ 备份 | |
| `~/.openclaw/agents/main/qmd/sessions/*` | - | ❌ 跳过 | 会话历史 |
| `~/.openclaw/agents/main/qmd/xdg-cache/*` | - | ❌ 跳过 | 向量缓存 |
| `~/.openclaw/agents/main/qmd/xdg-config/` | `openclaw-backup/agents/main/qmd/xdg-config/` | ✅ 备份 | |
| `~/.openclaw/agents/main/sessions/*` | - | ❌ 跳过 | 会话数据 |

### 3.3 canvas/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/canvas/index.html` | `openclaw-backup/canvas/index.html` | ✅ 备份 | |

### 3.4 completions/ 目录（全部备份）

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/completions/openclaw.bash` | `openclaw-backup/completions/openclaw.bash` | ✅ 备份 | Bash 补全 |
| `~/.openclaw/completions/openclaw.fish` | `openclaw-backup/completions/openclaw.fish` | ✅ 备份 | Fish 补全 |
| `~/.openclaw/completions/openclaw.ps1` | `openclaw-backup/completions/openclaw.ps1` | ✅ 备份 | PowerShell 补全 |
| `~/.openclaw/completions/openclaw.zsh` | `openclaw-backup/completions/openclaw.zsh` | ✅ 备份 | Zsh 补全 |

### 3.5 credentials/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/credentials/feishu-allowFrom.json` | `openclaw-backup/credentials/feishu-allowFrom.json` | ✅ 备份 | |
| `~/.openclaw/credentials/feishu-pairing.json` | `openclaw-backup/credentials/feishu-pairing.json` | ✅ 备份 | |

### 3.6 cron/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/cron/jobs.json` | `openclaw-backup/cron/jobs.json` | ✅ 备份 | |
| `~/.openclaw/cron/jobs.json.bak` | - | ❌ 跳过 | 自动备份 |
| `~/.openclaw/cron/runs/*` | - | ❌ 跳过 | 执行历史 |

### 3.7 devices/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/devices/paired.json` | `openclaw-backup/devices/paired.json` | ✅ 备份 | |
| `~/.openclaw/devices/pending.json` | `openclaw-backup/devices/pending.json` | ✅ 备份 | |

### 3.8 extensions/ 目录（全部备份）

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/extensions/context-warning-plugin/*` | `openclaw-backup/extensions/context-warning-plugin/*` | ✅ 备份 | 上下文警告插件 |
| `~/.openclaw/extensions/heartbeat-file-plugin/*` | `openclaw-backup/extensions/heartbeat-file-plugin/*` | ✅ 备份 | 心跳文件插件 |
| `~/.openclaw/extensions/memory-tfidf-plugin/*` | `openclaw-backup/extensions/memory-tfidf-plugin/*` | ✅ 备份 | 内存 TFIDF 插件 |
| `~/.openclaw/extensions/simple-cron-plugin/*` | `openclaw-backup/extensions/simple-cron-plugin/*` | ✅ 备份 | 简单定时插件 |

### 3.9 identity/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/identity/device.json` | `openclaw-backup/identity/device.json` | ✅ 备份 | |
| `~/.openclaw/identity/device-auth.json` | `openclaw-backup/identity/device-auth.json` | ✅ 备份 | |

### 3.10 logs/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/logs/gateway.err.log` | - | ❌ 跳过 | 错误日志 |
| `~/.openclaw/logs/gateway.log` | - | ❌ 跳过 | 运行日志 |

### 3.11 memory/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/memory/main.sqlite` | - | ❌ 跳过 | **内存数据库 - 不备份** |

### 3.12 nodes/ 目录

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/nodes/node_openclaw_main.json` | `openclaw-backup/nodes/node_openclaw_main.json` | ✅ 备份 | |

### 3.13 skills/ 目录（全部备份，排除 node_modules）

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/skills/agent-browser/*` | `openclaw-backup/skills/agent-browser/*` | ✅ 备份 | |
| `~/.openclaw/skills/brave-search/*` | `openclaw-backup/skills/brave-search/*` | ✅ 备份 | 排除 node_modules |
| `~/.openclaw/skills/clawdhub/*` | `openclaw-backup/skills/clawdhub/*` | ✅ 备份 | |
| `~/.openclaw/skills/data-analyst/*` | `openclaw-backup/skills/data-analyst/*` | ✅ 备份 | |
| `~/.openclaw/skills/image-assistant/*` | `openclaw-backup/skills/image-assistant/*` | ✅ 备份 | |
| `~/.openclaw/skills/playwright-headless-browser/*` | `openclaw-backup/skills/playwright-headless-browser/*` | ✅ 备份 | |
| `~/.openclaw/skills/prd-doc-writer/*` | `openclaw-backup/skills/prd-doc-writer/*` | ✅ 备份 | |
| `~/.openclaw/skills/priority-judge/*` | `openclaw-backup/skills/priority-judge/*` | ✅ 备份 | |
| `~/.openclaw/skills/project-map-builder/*` | `openclaw-backup/skills/project-map-builder/*` | ✅ 备份 | |
| `~/.openclaw/skills/req-change-workflow/*` | `openclaw-backup/skills/req-change-workflow/*` | ✅ 备份 | |
| `~/.openclaw/skills/self-improving-agent/*` | `openclaw-backup/skills/self-improving-agent/*` | ✅ 备份 | |
| `~/.openclaw/skills/skill-vetter/*` | `openclaw-backup/skills/skill-vetter/*` | ✅ 备份 | |
| `~/.openclaw/skills/summarize/*` | `openclaw-backup/skills/summarize/*` | ✅ 备份 | |
| `~/.openclaw/skills/task-status/*` | `openclaw-backup/skills/task-status/*` | ✅ 备份 | |
| `~/.openclaw/skills/thinking-partner/*` | `openclaw-backup/skills/thinking-partner/*` | ✅ 备份 | |
| `~/.openclaw/skills/thought-mining/*` | `openclaw-backup/skills/thought-mining/*` | ✅ 备份 | |
| `~/.openclaw/skills/ui-design/*` | `openclaw-backup/skills/ui-design/*` | ✅ 备份 | |
| `~/.openclaw/skills/version-planner/*` | `openclaw-backup/skills/version-planner/*` | ✅ 备份 | |
| `~/.openclaw/skills/weather/*` | `openclaw-backup/skills/weather/*` | ✅ 备份 | |
| `~/.openclaw/skills/weekly-report/*` | `openclaw-backup/skills/weekly-report/*` | ✅ 备份 | |
| `~/.openclaw/skills/writing-assistant/*` | `openclaw-backup/skills/writing-assistant/*` | ✅ 备份 | |

### 3.14 subagents/ 目录（全部备份）

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/subagents/coder/*` | `openclaw-backup/subagents/coder/*` | ✅ 备份 | |
| `~/.openclaw/subagents/planner/*` | `openclaw-backup/subagents/planner/*` | ✅ 备份 | |

### 3.15 workspace/ 目录（全部备份）

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/workspace/*.md` | `openclaw-backup/workspace/*.md` | ✅ 备份 | 根目录所有 .md |
| `~/.openclaw/workspace/*.json` | `openclaw-backup/workspace/*.json` | ✅ 备份 | 根目录所有 .json |
| `~/.openclaw/workspace/*.js` | `openclaw-backup/workspace/*.js` | ✅ 备份 | 根目录所有 .js |
| `~/.openclaw/workspace/*.sh` | `openclaw-backup/workspace/*.sh` | ✅ 备份 | 根目录所有 .sh |
| `~/.openclaw/workspace/*.py` | `openclaw-backup/workspace/*.py` | ✅ 备份 | 根目录所有 .py |
| `~/.openclaw/workspace/memory/*` | `openclaw-backup/workspace/memory/*` | ✅ 备份 | 记忆目录 |
| `~/.openclaw/workspace/puddy_skillshub/*` | `openclaw-backup/workspace/puddy_skillshub/*` | ✅ 备份 | 自定义技能 |
| `~/.openclaw/workspace/scripts/*` | `openclaw-backup/workspace/scripts/*` | ✅ 备份 | 脚本目录 |
| `~/.openclaw/workspace/tasks/*` | `openclaw-backup/workspace/tasks/*` | ✅ 备份 | 任务目录 |
| `~/.openclaw/workspace/evomap_automation/*` | `openclaw-backup/workspace/evomap_automation/*` | ✅ 备份 | 项目目录 |
| `~/.openclaw/workspace/evomap_solutions/*` | `openclaw-backup/workspace/evomap_solutions/*` | ✅ 备份 | 项目目录 |
| `~/.openclaw/workspace/news/*` | `openclaw-backup/workspace/news/*` | ✅ 备份 | 新闻目录 |

### 3.16 .clawhub/ 目录（全部备份）

| 源路径 | 目标路径 | 操作 | 说明 |
|--------|----------|------|------|
| `~/.openclaw/.clawhub/lock.json` | `openclaw-backup/.clawhub/lock.json` | ✅ 备份 | 锁定文件 |

---

## 四、备份脚本

```bash
#!/bin/bash
# OpenClaw 备份脚本 - 最终版
# 用法: ./backup-openclaw.sh

set -e

SOURCE="$HOME/.openclaw"
BACKUP_DIR="openclaw-backup-$(date +%Y%m%d-%H%M%S)"

echo "🚀 开始备份 OpenClaw..."
echo "源目录: $SOURCE"
echo "备份目录: $BACKUP_DIR"

# 创建目录结构
mkdir -p "$BACKUP_DIR"/{agents/{main/{agent,qmd/xdg-config}},canvas,credentials,cron,devices,extensions/{context-warning-plugin,heartbeat-file-plugin,memory-tfidf-plugin,simple-cron-plugin},identity,nodes,subagents/{coder,planner},workspace,.clawhub}

# 1. 根目录文件（脱敏处理）
echo "📄 处理核心配置文件..."

# openclaw.json - 脱敏 API Key
jq '.models.providers.nvidia.apiKey = "YOUR_API_KEY_HERE"' "$SOURCE/openclaw.json" > "$BACKUP_DIR/openclaw.json"

# .env - 脱敏（如果存在）
if [ -f "$SOURCE/.env" ]; then
    grep -v '^[A-Z_]*KEY' "$SOURCE/.env" > "$BACKUP_DIR/.env" 2>/dev/null || echo "# 环境变量文件" > "$BACKUP_DIR/.env"
fi

# 其他根目录文件
cp "$SOURCE/AGENTS.md" "$SOURCE/README.md" "$SOURCE/TOOLS.md" "$SOURCE/setup.sh" "$BACKUP_DIR/" 2>/dev/null || true

# 2. agents/
echo "🤖 备份 Agent 配置..."
cp "$SOURCE/agents/main/agent/models.json" "$BACKUP_DIR/agents/main/agent/"
cp -r "$SOURCE/agents/main/qmd/xdg-config/"* "$BACKUP_DIR/agents/main/qmd/xdg-config/" 2>/dev/null || true

# 3. canvas/
cp "$SOURCE/canvas/index.html" "$BACKUP_DIR/canvas/"

# 4. completions/（全部备份）
echo "🔧 备份 Shell 补全..."
cp -r "$SOURCE/completions/"* "$BACKUP_DIR/completions/" 2>/dev/null || true

# 5. credentials/
cp "$SOURCE/credentials/"*.json "$BACKUP_DIR/credentials/"

# 6. cron/（排除 runs 和 .bak）
cp "$SOURCE/cron/jobs.json" "$BACKUP_DIR/cron/"

# 7. devices/
cp "$SOURCE/devices/"*.json "$BACKUP_DIR/devices/"

# 8. extensions/（全部备份）
echo "🔌 备份扩展插件..."
for plugin in context-warning-plugin heartbeat-file-plugin memory-tfidf-plugin simple-cron-plugin; do
    cp -r "$SOURCE/extensions/$plugin/"* "$BACKUP_DIR/extensions/$plugin/" 2>/dev/null || true
done

# 9. identity/
cp "$SOURCE/identity/"*.json "$BACKUP_DIR/identity/"

# 10. nodes/
cp "$SOURCE/nodes/"*.json "$BACKUP_DIR/nodes/"

# 11. skills/（排除 node_modules）
echo "🎨 备份技能库..."
rsync -av --exclude='node_modules' "$SOURCE/skills/" "$BACKUP_DIR/skills/"

# 12. subagents/（全部备份）
cp -r "$SOURCE/subagents/coder/"* "$BACKUP_DIR/subagents/coder/" 2>/dev/null || true
cp -r "$SOURCE/subagents/planner/"* "$BACKUP_DIR/subagents/planner/" 2>/dev/null || true

# 13. workspace/（全部备份）
echo "💼 备份工作空间..."
rsync -av "$SOURCE/workspace/" "$BACKUP_DIR/workspace/"

# 14. .clawhub/（全部备份）
cp "$SOURCE/.clawhub/"*.json "$BACKUP_DIR/.clawhub/" 2>/dev/null || true

# 生成备份清单
echo "📝 生成备份清单..."
cat > "$BACKUP_DIR/BACKUP-INFO.json" << EOF
{
  "backupVersion": "1.0",
  "backupDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "sourcePath": "$SOURCE",
  "excludedItems": [
    "agents/main/qmd/sessions/ - 会话历史",
    "agents/main/qmd/xdg-cache/ - QMD向量缓存",
    "agents/main/sessions/ - 会话数据",
    "memory/main.sqlite - 内存数据库",
    "logs/ - 运行日志",
    "cron/runs/ - 任务执行历史",
    "cron/jobs.json.bak - 自动备份",
    "skills/*/node_modules/ - npm依赖"
  ],
  "sanitizedItems": [
    "openclaw.json - API Key已脱敏",
    ".env - 敏感信息已清除"
  ],
  "restoreInstructions": "1. 进入备份目录 2. 填入API Key 3. 复制到~/.openclaw/ 4. 启动OpenClaw"
}
EOF

echo "✅ 备份完成: $BACKUP_DIR/"
echo ""
echo "📊 备份统计:"
echo "  - 原始大小: $(du -sh ~/.openclaw | cut -f1)"
echo "  - 备份大小: $(du -sh "$BACKUP_DIR" | cut -f1)"
echo ""
echo "⚠️  恢复前请检查:"
echo "  1. openclaw.json 中的 API Key"
echo "  2. .env 文件中的环境变量"
echo "  3. 飞书授权（如需要）"
```

---

## 五、恢复流程

```bash
# 1. 进入备份目录
cd openclaw-backup-YYYYMMDD-HHMMSS

# 2. 填入 API Key（编辑 openclaw.json）
nano openclaw.json

# 3. 检查 .env
nano .env

# 4. 复制到目标位置
cp -r * ~/.openclaw/

# 5. 安装技能依赖
for skill in ~/.openclaw/skills/*/; do
    if [ -f "$skill/package.json" ]; then
        (cd "$skill" && npm install)
    fi
done

# 6. 启动 OpenClaw
openclaw gateway start
```

---

## 六、版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-02-27 | 最终确认版，补全所有可选备份项，增加内存数据库不备份说明 |
