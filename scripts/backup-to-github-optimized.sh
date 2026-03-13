#!/bin/bash

# OpenClaw 优化备份脚本
# 使用 rsync 增量同步，排除大文件和临时文件

set -e

BACKUP_DIR="${HOME}/openclaw-backup"
DATE=$(date +%Y%m%d_%H%M%S)

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}OpenClaw 优化备份: ${DATE}${NC}"
echo -e "${GREEN}==========================================${NC}"

# 检查 rsync 是否可用
if ! command -v rsync > /dev/null 2>&1; then
    echo -e "${RED}错误: 需要安装 rsync${NC}"
    exit 1
fi

# 进入备份目录
cd "${BACKUP_DIR}"

# 创建 .openclaw 目录结构
mkdir -p .openclaw

echo -e "${YELLOW}[1/6] 备份核心配置文件...${NC}"
rsync -a --delete \
    --exclude='openclaw.json.bak' \
    "${HOME}/.openclaw/openclaw.json" \
    "${HOME}/.openclaw/.env" \
    "${HOME}/.openclaw/AGENTS.md" \
    "${HOME}/.openclaw/README.md" \
    "${HOME}/.openclaw/TOOLS.md" \
    "${HOME}/.openclaw/setup.sh" \
    "${HOME}/.openclaw/update-check.json" \
    .openclaw/ 2>/dev/null || true

echo -e "${YELLOW}[2/6] 备份 workspace（排除大文件）...${NC}"
mkdir -p workspace
rsync -a --delete \
    --exclude='.DS_Store' \
    --exclude='node_modules' \
    --exclude='*/node_modules' \
    --exclude='.git' \
    --exclude='*/.git' \
    --exclude='venv' \
    --exclude='*/venv' \
    --exclude='__pycache__' \
    --exclude='*/__pycache__' \
    --exclude='*.pyc' \
    --exclude='.pytest_cache' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='.next' \
    --exclude='coverage' \
    "${HOME}/.openclaw/workspace/" workspace/ 2>/dev/null || true

echo -e "${YELLOW}[3/6] 备份 Agents（排除大模型文件和缓存）...${NC}"
mkdir -p agents
rsync -a --delete \
    --exclude='*.gguf' \
    --exclude='*.bin' \
    --exclude='*.onnx' \
    --exclude='qmd/xdg-cache/' \
    --exclude='qmd/xdg-cache/*' \
    --exclude='*/xdg-cache/' \
    --exclude='*/models/' \
    --exclude='*/.cache/' \
    "${HOME}/.openclaw/agents/" agents/ 2>/dev/null || true

echo -e "${YELLOW}[4/6] 备份其他配置...${NC}"

# Skills（排除 node_modules）
mkdir -p skills
rsync -a --delete \
    --exclude='node_modules' \
    --exclude='*/node_modules' \
    --exclude='.DS_Store' \
    "${HOME}/.openclaw/skills/" skills/ 2>/dev/null || true

# Extensions
mkdir -p extensions
rsync -a --delete \
    --exclude='node_modules' \
    --exclude='*/node_modules' \
    "${HOME}/.openclaw/extensions/" extensions/ 2>/dev/null || true

# Cron
mkdir -p cron
rsync -a --delete "${HOME}/.openclaw/cron/" cron/ 2>/dev/null || true

# Subagents
mkdir -p subagents
rsync -a --delete \
    --exclude='*.gguf' \
    --exclude='*.bin' \
    "${HOME}/.openclaw/subagents/" subagents/ 2>/dev/null || true

# Identity
mkdir -p identity
rsync -a --delete "${HOME}/.openclaw/identity/" identity/ 2>/dev/null || true

# Devices
mkdir -p devices
rsync -a --delete "${HOME}/.openclaw/devices/" devices/ 2>/dev/null || true

# Completions
mkdir -p completions
rsync -a --delete "${HOME}/.openclaw/completions/" completions/ 2>/dev/null || true

echo -e "${YELLOW}[5/6] 生成文件清单...${NC}"
find . -type f ! -path './.git/*' | sort > FILE_LIST.txt
FILE_COUNT=$(wc -l < FILE_LIST.txt)
echo -e "总文件数: ${FILE_COUNT}"

# 计算备份大小
BACKUP_SIZE=$(du -sh . | cut -f1)

echo -e "${YELLOW}[6/6] 推送到 GitHub...${NC}"
git add -A
git commit -m "Backup: ${DATE} - ${FILE_COUNT} files, ${BACKUP_SIZE}" || echo -e "${YELLOW}无变更或提交失败${NC}"
git push origin main || echo -e "${RED}推送失败${NC}"

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}备份完成!${NC}"
echo -e "文件数: ${FILE_COUNT}"
echo -e "备份大小: ${BACKUP_SIZE}"
echo -e "${GREEN}==========================================${NC}"
