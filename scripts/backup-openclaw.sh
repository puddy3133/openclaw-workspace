#!/bin/bash

# OpenClaw 完整备份脚本 - 测试版
# 能备份尽量备份，便于完整恢复

set -e

BACKUP_DIR="${HOME}/openclaw-backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="openclaw-backup-${DATE}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

echo "=========================================="
echo "OpenClaw 完整备份开始: ${DATE}"
echo "=========================================="

# 创建备份目录
mkdir -p "${BACKUP_PATH}"

# 1. 核心配置文件
echo "[1/12] 备份核心配置文件..."
mkdir -p "${BACKUP_PATH}/config"
cp "${HOME}/.openclaw/openclaw.json" "${BACKUP_PATH}/config/" 2>/dev/null || true
cp "${HOME}/.openclaw/.env" "${BACKUP_PATH}/config/" 2>/dev/null || true
cp "${HOME}/.openclaw/AGENTS.md" "${BACKUP_PATH}/config/" 2>/dev/null || true
cp "${HOME}/.openclaw/README.md" "${BACKUP_PATH}/config/" 2>/dev/null || true
cp "${HOME}/.openclaw/TOOLS.md" "${BACKUP_PATH}/config/" 2>/dev/null || true
cp "${HOME}/.openclaw/setup.sh" "${BACKUP_PATH}/config/" 2>/dev/null || true

# 2. 完整 Workspace
echo "[2/12] 备份完整 Workspace..."
mkdir -p "${BACKUP_PATH}/workspace"
# 排除 evomap 旧项目文件，其他全部备份
if command -v rsync > /dev/null 2>&1; then
    rsync -a --exclude='evomap*' --exclude='puddy_skillshub' --exclude='tasks' \
        "${HOME}/.openclaw/workspace/" "${BACKUP_PATH}/workspace/" 2>/dev/null || true
else
    # 如果没有 rsync，使用 cp
    for item in "${HOME}/.openclaw/workspace/"*; do
        name=$(basename "$item")
        if [[ ! "$name" =~ ^evomap.* ]] && [ "$name" != "puddy_skillshub" ] && [ "$name" != "tasks" ]; then
            cp -r "$item" "${BACKUP_PATH}/workspace/" 2>/dev/null || true
        fi
    done
fi

# 3. Agents 数据（排除大模型文件）
echo "[3/12] 备份 Agents 数据（排除大模型文件）..."
mkdir -p "${BACKUP_PATH}/agents"
if command -v rsync > /dev/null 2>&1; then
    rsync -a --exclude='*.gguf' --exclude='xdg-cache/qmd/models/' \
        "${HOME}/.openclaw/agents/" "${BACKUP_PATH}/agents/" 2>/dev/null || true
else
    # 手动复制，排除大模型文件
    for item in "${HOME}/.openclaw/agents/"*; do
        if [ -d "$item" ]; then
            agent_name=$(basename "$item")
            mkdir -p "${BACKUP_PATH}/agents/${agent_name}"
            for subitem in "$item"/*; do
                subname=$(basename "$subitem")
                # 排除 qmd/xdg-cache/qmd/models/ 目录
                if [[ ! "$subitem" =~ /qmd/xdg-cache/qmd/models/ ]]; then
                    cp -r "$subitem" "${BACKUP_PATH}/agents/${agent_name}/" 2>/dev/null || true
                fi
            done
        fi
    done
fi

# 4. Memory 数据
echo "[4/12] 备份 Memory..."
mkdir -p "${BACKUP_PATH}/memory_main"
cp -r "${HOME}/.openclaw/memory/"* "${BACKUP_PATH}/memory_main/" 2>/dev/null || true

# 5. 所有 Skills
echo "[5/12] 备份所有 Skills..."
mkdir -p "${BACKUP_PATH}/skills"
cp -r "${HOME}/.openclaw/skills/"* "${BACKUP_PATH}/skills/" 2>/dev/null || true

# 6. Extensions
echo "[6/12] 备份 Extensions..."
mkdir -p "${BACKUP_PATH}/extensions"
cp -r "${HOME}/.openclaw/extensions/"* "${BACKUP_PATH}/extensions/" 2>/dev/null || true

# 7. Credentials
echo "[7/12] 备份 Credentials..."
mkdir -p "${BACKUP_PATH}/credentials"
cp -r "${HOME}/.openclaw/credentials/"* "${BACKUP_PATH}/credentials/" 2>/dev/null || true

# 8. Cron 记录
echo "[8/12] 备份 Cron 记录..."
mkdir -p "${BACKUP_PATH}/cron"
cp -r "${HOME}/.openclaw/cron/"* "${BACKUP_PATH}/cron/" 2>/dev/null || true

# 9. Subagents
echo "[9/12] 备份 Subagents..."
mkdir -p "${BACKUP_PATH}/subagents"
cp -r "${HOME}/.openclaw/subagents/"* "${BACKUP_PATH}/subagents/" 2>/dev/null || true

# 10. Identity
echo "[10/12] 备份 Identity..."
mkdir -p "${BACKUP_PATH}/identity"
cp -r "${HOME}/.openclaw/identity/"* "${BACKUP_PATH}/identity/" 2>/dev/null || true

# 11. Devices
echo "[11/12] 备份 Devices..."
mkdir -p "${BACKUP_PATH}/devices"
cp -r "${HOME}/.openclaw/devices/"* "${BACKUP_PATH}/devices/" 2>/dev/null || true

# 12. Completions
echo "[12/12] 备份 Completions..."
mkdir -p "${BACKUP_PATH}/completions"
cp -r "${HOME}/.openclaw/completions/"* "${BACKUP_PATH}/completions/" 2>/dev/null || true

# 生成完整目录清单
echo "=========================================="
echo "生成完整目录清单..."
find "${BACKUP_PATH}" -type f | sort > "${BACKUP_PATH}/FILE_LIST.txt"
FILE_COUNT=$(wc -l < "${BACKUP_PATH}/FILE_LIST.txt")
echo "文件清单已生成: FILE_LIST.txt"
echo "总文件数: ${FILE_COUNT}"

# 创建备份清单
echo "=========================================="
echo "创建备份清单..."
cat > "${BACKUP_PATH}/BACKUP_MANIFEST.md" << EOF
# OpenClaw 完整备份清单

## 备份时间
生成时间: ${DATE}
文件数量: ${FILE_COUNT}

## 恢复路径对照表

**重要：恢复时，将备份目录中的文件复制到对应位置**

| 备份目录 | 恢复目标路径 | 说明 |
|---------|-------------|------|
| \`config/openclaw.json\` | \`~/.openclaw/openclaw.json\` | 主配置文件 |
| \`config/.env\` | \`~/.openclaw/.env\` | 环境变量 |
| \`config/AGENTS.md\` | \`~/.openclaw/AGENTS.md\` | Agent 配置 |
| \`workspace/\` | \`~/.openclaw/workspace/\` | 工作空间全部内容 |
| \`agents/\` | \`~/.openclaw/agents/\` | Agents 数据 |
| \`memory_main/\` | \`~/.openclaw/memory/\` | 主记忆数据库 |
| \`skills/\` | \`~/.openclaw/skills/\` | 所有 Skills |
| \`extensions/\` | \`~/.openclaw/extensions/\` | 自研插件 |
| \`credentials/\` | \`~/.openclaw/credentials/\` | 凭证信息 |
| \`cron/\` | \`~/.openclaw/cron/\` | 定时任务记录 |
| \`subagents/\` | \`~/.openclaw/subagents/\` | 子 Agent 配置 |
| \`identity/\` | \`~/.openclaw/identity/\` | 身份信息 |
| \`devices/\` | \`~/.openclaw/devices/\` | 设备配对 |
| \`completions/\` | \`~/.openclaw/completions/\` | 补全缓存 |

### 快速恢复命令

\`\`\`bash
# 1. 解压备份
tar -xzf openclaw-backup-YYYYMMDD_HHMMSS.tar.gz
cd openclaw-backup-YYYYMMDD_HHMMSS

# 2. 复制所有目录到 ~/.openclaw/
cp -r config/* ~/.openclaw/
cp -r workspace/* ~/.openclaw/workspace/
cp -r agents/* ~/.openclaw/agents/
cp -r memory_main/* ~/.openclaw/memory/
cp -r skills/* ~/.openclaw/skills/
cp -r extensions/* ~/.openclaw/extensions/
cp -r credentials/* ~/.openclaw/credentials/
cp -r cron/* ~/.openclaw/cron/
cp -r subagents/* ~/.openclaw/subagents/
cp -r identity/* ~/.openclaw/identity/
cp -r devices/* ~/.openclaw/devices/
cp -r completions/* ~/.openclaw/completions/

# 3. 检查配置
openclaw doctor
\`\`\`

## 文件清单

备份包含的所有文件列表见: \`FILE_LIST.txt\`

## 未备份内容

| 目录 | 原因 |
|------|------|
| logs/ | 体积大，可重新生成 |
| canvas/ | 临时数据 |
| nodes/ | 可重新配对 |

## 安全说明

- 备份存储在 GitHub **私有仓库**
- 包含敏感信息（credentials/, identity/）
- 确保 GitHub 仓库为私有
EOF

# 创建压缩包
echo "=========================================="
echo "创建压缩包..."
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"

# 计算大小
BACKUP_SIZE=$(du -sh "${BACKUP_NAME}.tar.gz" | cut -f1)
ITEMS_COUNT=$(tar -tzf "${BACKUP_NAME}.tar.gz" | wc -l)

echo "=========================================="
echo "备份完成!"
echo "备份文件: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo "备份大小: ${BACKUP_SIZE}"
echo "文件数量: ${ITEMS_COUNT}"
echo "=========================================="

# 清理旧备份（保留最近10个）
echo "清理旧备份（保留最近10个）..."
cd "${BACKUP_DIR}"
ls -t *.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm -f

# 输出备份路径（用于 GitHub 同步）
echo "BACKUP_PATH=${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
