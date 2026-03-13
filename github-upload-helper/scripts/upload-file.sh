#!/bin/bash
# upload-file.sh - 上传文件到 GitHub

TOKEN="$1"
REPO="$2"
FILE="$3"
TARGET="${4:-incoming/$(basename $FILE)}"

if [ -z "$TOKEN" ] || [ -z "$REPO" ] || [ -z "$FILE" ]; then
    echo "用法: ./upload-file.sh <TOKEN> <REPO> <FILE> [TARGET_PATH]"
    echo ""
    echo "示例:"
    echo "  ./upload-file.sh ghp_xxx user/repo ./document.pdf"
    echo "  ./upload-file.sh ghp_xxx user/repo ./data.json incoming/data.json"
    exit 1
fi

if [ ! -f "$FILE" ]; then
    echo "错误: 文件不存在: $FILE"
    exit 1
fi

CONTENT=$(base64 -i "$FILE")
FILENAME=$(basename "$FILE")

echo "上传 $FILENAME 到 $REPO/$TARGET ..."

RESPONSE=$(curl -s -X PUT \
    -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    -d "{\"message\":\"Upload $FILENAME\",\"content\":\"$CONTENT\",\"branch\":\"main\"}" \
    "https://api.github.com/repos/$REPO/contents/$TARGET")

if echo "$RESPONSE" | grep -q '"sha"'; then
    echo "✅ 上传成功!"
    echo "URL: $(echo $RESPONSE | grep -o '"html_url":"[^"]*"' | cut -d'"' -f4)"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 上传: $FILENAME → $TARGET (成功)" >> ../logs/upload.log
else
    echo "❌ 上传失败"
    echo "$RESPONSE" | grep -o '"message":"[^"]*"' | head -1
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 上传: $FILENAME → $TARGET (失败)" >> ../logs/upload.log
fi
