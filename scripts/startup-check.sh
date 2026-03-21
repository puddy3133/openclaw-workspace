#!/bin/bash
# 启动时检查遗漏的 Cron 任务 + 模型缓存一致性检查
# 在 OpenClaw 启动时自动执行

echo "🔍 检查遗漏的定时任务..."

# 运行 Python 检查脚本
python3 ~/.openclaw/workspace/scripts/check-cron-missed.py

# 模型缓存自动清理：如果 openclaw.json 比 models.json 新，删除缓存强制重新加载
CONFIG_FILE="$HOME/.openclaw/openclaw.json"
CACHE_FILE="$HOME/.openclaw/agents/main/agent/models.json"

if [ -f "$CONFIG_FILE" ] && [ -f "$CACHE_FILE" ]; then
    CONFIG_MTIME=$(stat -f "%m" "$CONFIG_FILE")
    CACHE_MTIME=$(stat -f "%m" "$CACHE_FILE")
    if [ "$CONFIG_MTIME" -gt "$CACHE_MTIME" ]; then
        echo "🔄 检测到 openclaw.json 已更新，正在清理模型缓存..."
        rm "$CACHE_FILE"
        echo "✅ 模型缓存已清理，下次启动将从 openclaw.json 重新加载"
    fi
fi

# 如果有遗漏，发送通知（可选）
# 可以在这里添加发送消息到飞书/微信的逻辑
