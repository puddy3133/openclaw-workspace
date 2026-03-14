#!/bin/bash
# Gemini Imagen 3 图像生成脚本
# 用法: ./gemini-image.sh "图像描述" [输出文件名]

API_KEY="AIzaSyCrMOPUk_iuWV3IOF2-ZqGvwGSakUIxyGM"
MODEL="imagen-3.0-generate-002"

if [ -z "$1" ]; then
    echo "用法: ./gemini-image.sh \"图像描述\" [输出文件名]"
    echo "示例: ./gemini-image.sh \"一只猫在月球上\" moon-cat.png"
    exit 1
fi

PROMPT="$1"
OUTPUT="${2:-gemini-image.png}"

echo "正在生成图像: ${PROMPT}..."

curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{
        \"instances\": [{\"prompt\": \"${PROMPT}\"}],
        \"parameters\": {\"sampleCount\": 1}
    }" | jq -r '.predictions[0].bytesBase64Encoded' | base64 -d > "${OUTPUT}"

if [ -f "${OUTPUT}" ] && [ -s "${OUTPUT}" ]; then
    echo "✅ 图像已保存: ${OUTPUT}"
    ls -lh "${OUTPUT}"
else
    echo "❌ 图像生成失败"
    rm -f "${OUTPUT}"
fi