#!/bin/bash
# Multi-Agent 对话中继监控脚本
# 每 5 分钟检查一次，确保 daemon 运行

LOG_FILE="/tmp/relay-monitor.log"
TIMESTAMP=$(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] 开始检查..." >> $LOG_FILE

# 检查小乔 daemon
XIAOQIAO_PID=$(ps aux | grep 'feishu_multi_agent.py daemon' | grep -v grep | grep -v 'grep' | awk '{print $2}')
if [ -z "$XIAOQIAO_PID" ]; then
    echo "[$TIMESTAMP] ⚠️ 小乔 daemon 未运行，尝试重启..." >> $LOG_FILE
    cd ~/.openclaw/skills/feishu-multi-agent && python3 scripts/feishu_multi_agent.py start-sync
else
    echo "[$TIMESTAMP] ✅ 小乔 daemon 运行中 (PID: $XIAOQIAO_PID)" >> $LOG_FILE
fi

# 检查大乔 daemon
DAQIAO_PID=$(ssh root@1.12.62.15 "ps aux | grep 'feishu_multi_agent.py daemon' | grep -v grep | grep -v 'grep' | awk '{print \$2}'" 2>/dev/null)
if [ -z "$DAQIAO_PID" ]; then
    echo "[$TIMESTAMP] ⚠️ 大乔 daemon 未运行，尝试重启..." >> $LOG_FILE
    ssh root@1.12.62.15 "cd ~/.openclaw/skills/feishu-multi-agent && python3 scripts/feishu_multi_agent.py start-sync"
else
    echo "[$TIMESTAMP] ✅ 大乔 daemon 运行中 (PID: $DAQIAO_PID)" >> $LOG_FILE
fi

echo "[$TIMESTAMP] 检查完成" >> $LOG_FILE
