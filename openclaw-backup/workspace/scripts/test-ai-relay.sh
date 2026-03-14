#!/bin/bash
# AI Assistant Relay 测试脚本

# 复制配置文件模板
cp ~/.openclaw/workspace/config/ai-assistant-relay.json.template ~/.openclaw/config/ai-assistant-relay.json

echo "✅ 配置文件已创建到 ~/.openclaw/config/ai-assistant-relay.json"
echo "⚠️  请编辑该文件，填入正确的 app_secret"
echo ""
echo "测试发送消息给大乔："
echo "  node ~/.openclaw/skills/ai-assistant-relay/index.js send --to daqiao --msg '你好，大乔'"
echo ""
echo "列出已配置的助手："
echo "  node ~/.openclaw/skills/ai-assistant-relay/index.js list"
