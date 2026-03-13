#!/bin/bash
# OpenClaw 恢复脚本

set -e

echo "🚀 OpenClaw 恢复脚本"
echo "===================="

# 检查是否已安装 OpenClaw
if ! command -v openclaw &> /dev/null; then
    echo "📦 OpenClaw 未安装，正在安装..."
    npm install -g openclaw
else
    echo "✅ OpenClaw 已安装"
fi

# 创建必要的目录
echo "📁 创建目录结构..."
mkdir -p ~/.openclaw/{agents,backups,browser,canvas,completions,credentials,cron/runs,devices,extensions,identity,logs,media,memory,subagents}

# 复制配置文件
echo "⚙️  复制配置文件..."
if [ ! -f ~/.openclaw/openclaw.json ]; then
    cp config/openclaw.json ~/.openclaw/
    echo "  ✅ openclaw.json"
else
    echo "  ⚠️  openclaw.json 已存在，跳过"
fi

if [ ! -f ~/.openclaw/.env ]; then
    cp config/.env.example ~/.openclaw/.env
    echo "  ✅ .env（请编辑填入 API 密钥）"
else
    echo "  ⚠️  .env 已存在，跳过"
fi

if [ ! -f ~/.openclaw/cron/jobs.json ]; then
    cp config/cron/jobs.json ~/.openclaw/cron/
    echo "  ✅ cron/jobs.json"
else
    echo "  ⚠️  cron/jobs.json 已存在，跳过"
fi

# 复制根目录文件
echo "📝 复制配置文档..."
cp AGENTS.md ~/.openclaw/ 2>/dev/null || true
cp TOOLS.md ~/.openclaw/ 2>/dev/null || true

# 复制 completions
echo "🔧 复制 Shell 补全脚本..."
cp completions/* ~/.openclaw/completions/ 2>/dev/null || true

# 复制 canvas
echo "🎨 复制画布文件..."
cp canvas/index.html ~/.openclaw/canvas/ 2>/dev/null || true

# 复制 skills
echo "🛠️  复制 Skills..."
if [ -d skills ]; then
    cp -r skills/* ~/.openclaw/skills/ 2>/dev/null || true
fi

# 复制 extensions
echo "🔌 复制 Extensions..."
if [ -d extensions ]; then
    cp -r extensions/* ~/.openclaw/extensions/ 2>/dev/null || true
fi

echo ""
echo "✅ 恢复完成！"
echo ""
echo "⚠️  下一步："
echo "1. 编辑 ~/.openclaw/.env 填入 API 密钥"
echo "2. 运行 'openclaw' 启动"
echo ""
echo "如需配置飞书、GitHub 等集成，请参考 README.md"
