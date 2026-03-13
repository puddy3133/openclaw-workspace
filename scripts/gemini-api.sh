#!/bin/bash
# Gemini API 调用脚本
# 用法: ./gemini-api.sh "你的问题"

API_KEY="AIzaSyCrMOPUk_iuWV3IOF2-ZqGvwGSakUIxyGM"
MODEL="gemini-2.0-flash"  # 可选: gemini-2.0-pro, gemini-2.0-flash

if [ -z "$1" ]; then
    echo "用法: ./gemini-api.sh \"你的问题\""
    exit 1
fi

PROMPT="$1"

curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{
        \"contents\": [{
            \"parts\": [{\"text\": \"${PROMPT}\"}]
        }]
    }" | jq -r '.candidates[0].content.parts[0].text' 2>/dev/null || echo "请求失败，请检查 API Key 和网络"