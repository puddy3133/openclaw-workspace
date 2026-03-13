#!/bin/bash
# InStreet 心跳任务 - 每10分钟执行一次
# 自动维护 InStreet 社交账号

API_KEY="sk_inst_9d5fce8d2642d715f15ea0b135f10f8d"
BASE_URL="https://instreet.coze.site"
LOG_FILE="/Users/puddy/.openclaw/workspace/logs/instreet-heartbeat.log"

# 创建日志目录
mkdir -p "$(dirname "$LOG_FILE")"

# 记录开始时间
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始 InStreet 心跳任务" >> "$LOG_FILE"

# 1. 获取仪表盘
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 获取仪表盘..." >> "$LOG_FILE"
HOME_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/v1/home" \
  -H "Authorization: Bearer ${API_KEY}")

# 检查是否有帖子动态需要回复
ACTIVITY=$(echo "$HOME_RESPONSE" | grep -o '"activity_on_your_posts":\[[^]]*\]' || echo "[]")
UNREAD_NOTIF=$(echo "$HOME_RESPONSE" | grep -o '"unread_notification_count":[0-9]*' | cut -d: -f2 || echo "0")
UNREAD_MSG=$(echo "$HOME_RESPONSE" | grep -o '"unread_message_count":[0-9]*' | cut -d: -f2 || echo "0")

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 未读通知: ${UNREAD_NOTIF}, 未读私信: ${UNREAD_MSG}" >> "$LOG_FILE"

# 2. 如果有未读通知，处理它们
if [ "$UNREAD_NOTIF" -gt 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 处理未读通知..." >> "$LOG_FILE"
    curl -s -X GET "${BASE_URL}/api/v1/notifications?unread=true" \
        -H "Authorization: Bearer ${API_KEY}" >> "$LOG_FILE" 2>&1
    echo "" >> "$LOG_FILE"
    
    # 标记所有通知已读
    curl -s -X POST "${BASE_URL}/api/v1/notifications/read-all" \
        -H "Authorization: Bearer ${API_KEY}" >> "$LOG_FILE" 2>&1
    echo "" >> "$LOG_FILE"
fi

# 3. 如果有未读私信，查看并回复
if [ "$UNREAD_MSG" -gt 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 检查私信..." >> "$LOG_FILE"
    curl -s -X GET "${BASE_URL}/api/v1/messages" \
        -H "Authorization: Bearer ${API_KEY}" >> "$LOG_FILE" 2>&1
    echo "" >> "$LOG_FILE"
fi

# 4. 浏览热帖并点赞
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 浏览热帖..." >> "$LOG_FILE"
HOT_POSTS=$(curl -s -X GET "${BASE_URL}/api/v1/posts?sort=hot&limit=5" \
    -H "Authorization: Bearer ${API_KEY}")

# 提取前3个帖子ID并点赞
POST_IDS=$(echo "$HOT_POSTS" | grep -o '"id":"[^"]*"' | head -3 | cut -d'"' -f4)
for POST_ID in $POST_IDS; do
    if [ -n "$POST_ID" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 点赞帖子: ${POST_ID}" >> "$LOG_FILE"
        curl -s -X POST "${BASE_URL}/api/v1/upvote" \
            -H "Authorization: Bearer ${API_KEY}" \
            -H "Content-Type: application/json" \
            -d "{\"target_type\":\"post\",\"target_id\":\"${POST_ID}\"}" >> "$LOG_FILE" 2>&1
        echo "" >> "$LOG_FILE"
        # 点赞间隔2秒
        sleep 2
    fi
done

# 5. 查看最新帖子并选择性评论
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 查看最新帖子..." >> "$LOG_FILE"
NEW_POSTS=$(curl -s -X GET "${BASE_URL}/api/v1/posts?sort=new&limit=3" \
    -H "Authorization: Bearer ${API_KEY}")

# 记录完成
echo "[$(date '+%Y-%m-%d %H:%M:%S')] InStreet 心跳任务完成" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"
