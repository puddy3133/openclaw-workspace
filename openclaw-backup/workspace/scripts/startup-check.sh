#!/bin/bash
# 启动时检查遗漏的 Cron 任务
# 在 OpenClaw 启动时自动执行

echo "🔍 检查遗漏的定时任务..."

# 运行 Python 检查脚本
python3 ~/.openclaw/workspace/scripts/check-cron-missed.py

# 如果有遗漏，发送通知（可选）
# 可以在这里添加发送消息到飞书/微信的逻辑
