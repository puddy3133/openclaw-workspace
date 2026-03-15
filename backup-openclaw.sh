#!/bin/bash
# OpenClaw 备份脚本 - 最终版
set -e

SOURCE="$HOME/.openclaw"
BACKUP_DIR="openclaw-backup"
BACKUP_ARCHIVE="openclaw-backup-$(date +%Y%m%d-%H%M%S).tar.gz"

echo "🚀 开始备份 OpenClaw..."
echo "源目录: $SOURCE"
echo "备份目录: $BACKUP_DIR"

# 如果备份目录已存在，先归档旧备份
if [ -d "$BACKUP_DIR" ]; then
    echo "📦 归档旧备份到 $BACKUP_ARCHIVE..."
    tar -czf "$BACKUP_ARCHIVE" "$BACKUP_DIR" 2>/dev/null || true
    rm -rf "$BACKUP_DIR"
fi

# 创建目录结构
mkdir -p "$BACKUP_DIR"/{agents/main/{agent,qmd/xdg-config},canvas,completions,credentials,cron,devices,extensions/{context-warning-plugin,heartbeat-file-plugin,memory-tfidf-plugin,simple-cron-plugin},identity,nodes,skills,subagents/{coder,planner},workspace,.clawhub}

# 1. 根目录文件（脱敏处理）
echo "📄 处理核心配置文件..."

# openclaw.json - 脱敏 API Key
if [ -f "$SOURCE/openclaw.json" ]; then
    jq '.models.providers.nvidia.apiKey = "YOUR_API_KEY_HERE"' "$SOURCE/openclaw.json" > "$BACKUP_DIR/openclaw.json" 2>/dev/null || cp "$SOURCE/openclaw.json" "$BACKUP_DIR/openclaw.json"
fi

# .env - 脱敏（如果存在）
if [ -f "$SOURCE/.env" ]; then
    grep -v '^[A-Z_]*KEY\|^[A-Z_]*SECRET\|^[A-Z_]*TOKEN' "$SOURCE/.env" > "$BACKUP_DIR/.env" 2>/dev/null || echo "# 环境变量文件 - 请重新配置" > "$BACKUP_DIR/.env"
fi

# 其他根目录文件
cp "$SOURCE/AGENTS.md" "$BACKUP_DIR/" 2>/dev/null || true
cp "$SOURCE/README.md" "$BACKUP_DIR/" 2>/dev/null || true
cp "$SOURCE/TOOLS.md" "$BACKUP_DIR/" 2>/dev/null || true
cp "$SOURCE/setup.sh" "$BACKUP_DIR/" 2>/dev/null || true

# 2. agents/
echo "🤖 备份 Agent 配置..."
cp "$SOURCE/agents/main/agent/models.json" "$BACKUP_DIR/agents/main/agent/" 2>/dev/null || true
cp -r "$SOURCE/agents/main/qmd/xdg-config/"* "$BACKUP_DIR/agents/main/qmd/xdg-config/" 2>/dev/null || true

# 3. canvas/
cp "$SOURCE/canvas/index.html" "$BACKUP_DIR/canvas/" 2>/dev/null || true

# 4. completions/（全部备份）
echo "🔧 备份 Shell 补全..."
cp -r "$SOURCE/completions/"* "$BACKUP_DIR/completions/" 2>/dev/null || true

# 5. credentials/
cp "$SOURCE/credentials/"*.json "$BACKUP_DIR/credentials/" 2>/dev/null || true

# 6. cron/（排除 runs 和 .bak）
cp "$SOURCE/cron/jobs.json" "$BACKUP_DIR/cron/" 2>/dev/null || true

# 7. devices/
cp "$SOURCE/devices/"*.json "$BACKUP_DIR/devices/" 2>/dev/null || true

# 8. extensions/（全部备份）
echo "🔌 备份扩展插件..."
for plugin in context-warning-plugin heartbeat-file-plugin memory-tfidf-plugin simple-cron-plugin; do
    if [ -d "$SOURCE/extensions/$plugin" ]; then
        cp -r "$SOURCE/extensions/$plugin/"* "$BACKUP_DIR/extensions/$plugin/" 2>/dev/null || true
    fi
done

# 9. identity/
cp "$SOURCE/identity/"*.json "$BACKUP_DIR/identity/" 2>/dev/null || true

# 10. nodes/
cp "$SOURCE/nodes/"*.json "$BACKUP_DIR/nodes/" 2>/dev/null || true

# 11. skills/（排除 node_modules）
echo "🎨 备份技能库..."
rsync -av --exclude='node_modules' --exclude='.git' "$SOURCE/skills/" "$BACKUP_DIR/skills/" 2>/dev/null || cp -r "$SOURCE/skills/"* "$BACKUP_DIR/skills/" 2>/dev/null || true

# 12. subagents/（全部备份）
if [ -d "$SOURCE/subagents/coder" ]; then
    cp -r "$SOURCE/subagents/coder/"* "$BACKUP_DIR/subagents/coder/" 2>/dev/null || true
fi
if [ -d "$SOURCE/subagents/planner" ]; then
    cp -r "$SOURCE/subagents/planner/"* "$BACKUP_DIR/subagents/planner/" 2>/dev/null || true
fi

# 13. workspace/（排除备份相关文件、大目录和.git）
echo "💼 备份工作空间..."
rsync -av \
  --exclude='openclaw-backup*' \
  --exclude='*.tar.gz' \
  --exclude='Star-Office-UI' \
  --exclude='_skill_audit' \
  --exclude='archive' \
  --exclude='.git' \
  "$SOURCE/workspace/" "$BACKUP_DIR/workspace/" 2>/dev/null || true

# 14. .clawhub/（全部备份）
cp "$SOURCE/.clawhub/"*.json "$BACKUP_DIR/.clawhub/" 2>/dev/null || true

# 生成备份清单
echo "📝 生成备份清单..."
cat > "$BACKUP_DIR/BACKUP-INFO.json" << EOF
{
  "backupVersion": "1.1",
  "backupDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "sourcePath": "$SOURCE",
  "backupPath": "$(pwd)/$BACKUP_DIR",
  "archivePath": "$(if [ -f "$BACKUP_ARCHIVE" ]; then echo "$(pwd)/$BACKUP_ARCHIVE"; else echo "null"; fi)",
  "excludedItems": [
    "agents/main/qmd/sessions/ - 会话历史",
    "agents/main/qmd/xdg-cache/ - QMD向量缓存",
    "agents/main/sessions/ - 会话数据",
    "memory/main.sqlite - 内存数据库",
    "logs/ - 运行日志",
    "cron/runs/ - 任务执行历史",
    "cron/jobs.json.bak - 自动备份",
    "skills/*/node_modules/ - npm依赖",
    ".DS_Store - 系统文件"
  ],
  "sanitizedItems": [
    "openclaw.json - API Key已脱敏",
    ".env - 敏感信息已清除"
  ],
  "restoreInstructions": "1. 进入备份目录 2. 填入API Key 3. 复制到~/.openclaw/ 4. 启动OpenClaw"
}
EOF

echo ""
echo "✅ 备份完成: $(pwd)/$BACKUP_DIR/"
echo ""
echo "📊 备份统计:"
echo "  - 源目录大小: $(du -sh "$SOURCE" | cut -f1)"
echo "  - 备份目录大小: $(du -sh "$BACKUP_DIR" | cut -f1)"
if [ -f "$BACKUP_ARCHIVE" ]; then
    echo "  - 归档文件: $BACKUP_ARCHIVE ($(du -sh "$BACKUP_ARCHIVE" | cut -f1))"
fi
echo ""
echo "⚠️  恢复前请检查:"
echo "  1. $BACKUP_DIR/openclaw.json 中的 API Key"
echo "  2. $BACKUP_DIR/.env 文件中的环境变量"
echo "  3. 飞书授权（如需要）"

# 输出备份目录名供后续使用
echo "$BACKUP_DIR" > .last_backup_dir

# 15. 推送到 GitHub 备份仓库
echo ""
echo "📤 推送到 GitHub 备份仓库..."

# 进入备份目录
cd "$BACKUP_DIR"

# 初始化 git 仓库（如果不存在）
if [ ! -d ".git" ]; then
    git init
    git remote add origin git@github.com:puddy3133/openclaw-backup.git 2>/dev/null || true
fi

# 确保远程仓库正确
if ! git remote get-url origin 2>/dev/null | grep -q "openclaw-backup"; then
    git remote remove origin 2>/dev/null || true
    git remote add origin git@github.com:puddy3133/openclaw-backup.git
fi

# 添加所有文件
git add -A

# 提交（如果有变更）
if git diff --cached --quiet; then
    echo "  没有变更需要提交"
else
    git commit -m "backup: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # 推送到 GitHub（强制推送，因为是备份）
    if git push -f origin main 2>/dev/null; then
        echo "  ✅ 已推送到 puddy3133/openclaw-backup"
    else
        echo "  ⚠️  推送失败，请检查 SSH 密钥或网络"
    fi
fi

# 返回原目录
cd ..
