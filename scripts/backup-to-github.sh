#!/bin/bash

# OpenClaw 源文件备份脚本（不压缩，直接推送）
# 每天中午 12:30 自动执行

set -e

BACKUP_DIR="${HOME}/.openclaw/workspace/openclaw-backup"
GITHUB_REPO="${GITHUB_BACKUP_REPO:-https://github.com/puddy3133/openclaw-backup.git}"
DATE=$(date +%Y%m%d_%H%M%S)

echo "=========================================="
echo "OpenClaw 源文件备份: ${DATE}"
echo "=========================================="

# 进入备份目录
cd "${BACKUP_DIR}"

# 清理旧文件（保留 .git）
echo "[1/4] 清理旧备份文件..."
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} +

# 创建 .gitignore 排除 node_modules
cat > .gitignore << 'GITIGNORE'
# 排除依赖目录
node_modules/
**/node_modules/

# 排除日志和缓存
*.log
.DS_Store
.cache/

# 排除大文件
*.gguf
*.bin
*.pt
*.pth
*.ckpt
*.safetensors
GITIGNORE

# 创建备份目录结构
echo "[2/4] 备份源文件..."

# 1. 核心配置
echo "  - 备份 config/"
mkdir -p config
cp "${HOME}/.openclaw/openclaw.json" config/ 2>/dev/null || true
cp "${HOME}/.openclaw/.env" config/ 2>/dev/null || true
cp "${HOME}/.openclaw/AGENTS.md" config/ 2>/dev/null || true
cp "${HOME}/.openclaw/README.md" config/ 2>/dev/null || true
cp "${HOME}/.openclaw/TOOLS.md" config/ 2>/dev/null || true

# 2. Workspace
echo "  - 备份 workspace/"
mkdir -p workspace
for item in "${HOME}/.openclaw/workspace/"*; do
    name=$(basename "$item")
    if [[ ! "$name" =~ ^evomap.* ]] && [ "$name" != "puddy_skillshub" ] && [ "$name" != "tasks" ]; then
        cp -r "$item" "workspace/" 2>/dev/null || true
    fi
done

# 3. Agents（排除大模型文件）
echo "  - 备份 agents/（排除模型文件）"
mkdir -p agents
for item in "${HOME}/.openclaw/agents/"*; do
    if [ -d "$item" ]; then
        agent_name=$(basename "$item")
        mkdir -p "agents/${agent_name}"
        for subitem in "$item"/*; do
            if [[ ! "$subitem" =~ /qmd/xdg-cache/qmd/models/ ]] && [[ ! "$subitem" =~ \.gguf$ ]]; then
                cp -r "$subitem" "agents/${agent_name}/" 2>/dev/null || true
            fi
        done
    fi
done

# 4. Memory
echo "  - 备份 memory_main/"
mkdir -p memory_main
cp -r "${HOME}/.openclaw/memory/"* "memory_main/" 2>/dev/null || true

# 5. Skills（排除 node_modules）
echo "  - 备份 skills/（排除 node_modules）"
mkdir -p skills
for item in "${HOME}/.openclaw/skills/"*; do
    if [ -d "$item" ]; then
        skill_name=$(basename "$item")
        mkdir -p "skills/${skill_name}"
        # 使用 rsync 或 find 排除 node_modules
        find "$item" -type d -name node_modules -prune -o -type f -print | while read -r file; do
            target="skills/${skill_name}$(echo "$file" | sed "s|${HOME}/.openclaw/skills/${skill_name}||")"
            mkdir -p "$(dirname "$target")"
            cp "$file" "$target" 2>/dev/null || true
        done
    fi
done

# 6. Extensions
echo "  - 备份 extensions/"
cp -r "${HOME}/.openclaw/extensions" . 2>/dev/null || true

# 7. Credentials
echo "  - 备份 credentials/"
cp -r "${HOME}/.openclaw/credentials" . 2>/dev/null || true

# 8. 其他配置
echo "  - 备份其他配置..."
cp -r "${HOME}/.openclaw/cron" . 2>/dev/null || true
cp -r "${HOME}/.openclaw/subagents" . 2>/dev/null || true
cp -r "${HOME}/.openclaw/identity" . 2>/dev/null || true
cp -r "${HOME}/.openclaw/devices" . 2>/dev/null || true
cp -r "${HOME}/.openclaw/completions" . 2>/dev/null || true

# 生成文件清单（排除 .git 和 node_modules）
echo "[3/4] 生成文件清单..."
find . -type f ! -path './.git/*' ! -path '*/node_modules/*' | sort > FILE_LIST.txt
FILE_COUNT=$(wc -l < FILE_LIST.txt)
echo "总文件数: ${FILE_COUNT}"

# 创建 README
cat > README.md << EOF
# OpenClaw 备份仓库

自动备份 OpenClaw 完整配置和数据（源文件，无压缩）

**⚠️ 注意: 这是私有仓库，包含敏感信息**

## 最新备份

- 时间: ${DATE}
- 文件数: ${FILE_COUNT}

## 目录结构

| 目录 | 内容 |
|------|------|
| config/ | 核心配置文件 |
| workspace/ | 工作空间 |
| agents/ | Agents 数据（无模型文件） |
| memory_main/ | 主记忆数据库 |
| skills/ | 所有 Skills |
| extensions/ | 自研插件 |
| credentials/ | 凭证信息 |
| cron/ | 定时任务记录 |
| subagents/ | 子 Agent 配置 |
| identity/ | 身份信息 |
| devices/ | 设备配对 |
| completions/ | 补全缓存 |

## 恢复方法

1. 克隆仓库: \`git clone https://github.com/puddy3133/openclaw-backup.git\`
2. 复制所有目录到 ~/.openclaw/
3. 重新配置环境变量（API Keys）
4. 运行 \`openclaw doctor\` 检查

## 自动备份

每天 12:30 (北京时间) 自动执行

## 安全提醒

- 本仓库为 **私有仓库**
- 包含敏感信息
- 不要分享给他人
EOF

# 提交到 GitHub
echo "[4/4] 推送到 GitHub..."
git add -A
git commit -m "Backup: ${DATE} - ${FILE_COUNT} files" || echo "无变更"
git push origin main

echo "=========================================="
echo "备份完成!"
echo "文件数: ${FILE_COUNT}"
echo "GitHub: ${GITHUB_REPO}"
echo "=========================================="
