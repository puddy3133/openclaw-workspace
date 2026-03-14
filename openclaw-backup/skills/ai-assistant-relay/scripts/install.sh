#!/bin/bash
# AI Assistant Relay 安装脚本

SKILL_DIR="~/.openclaw/skills/ai-assistant-relay"
CONFIG_DIR="~/.openclaw/config"

echo "=== AI Assistant Relay 安装 ==="
echo ""

# 1. 复制配置文件模板
echo "1. 创建配置文件..."
if [ -f "$CONFIG_DIR/ai-assistant-relay.json" ]; then
    echo "   配置文件已存在，跳过（如需重置请手动删除）"
else
    cp "$SKILL_DIR/config/ai-assistant-relay.json.template" "$CONFIG_DIR/ai-assistant-relay.json"
    echo "   ✓ 配置文件已创建"
fi

# 2. 设置权限
chmod 600 "$CONFIG_DIR/ai-assistant-relay.json" 2>/dev/null || true

echo ""
echo "✅ 安装完成！"
echo ""
echo "下一步："
echo "1. 编辑配置文件，填入正确的 app_secret："
echo "   nano ~/.openclaw/config/ai-assistant-relay.json"
echo ""
echo "2. 测试发送消息："
echo "   python3 $SKILL_DIR/scripts/ai_assistant_relay.py send --to daqiao --msg \"你好，大乔\""
echo ""
echo "3. 查看帮助："
echo "   python3 $SKILL_DIR/scripts/ai_assistant_relay.py --help"
echo ""
echo "可用助手："
echo "   - xiaoqiao (小乔)"
echo "   - daqiao (大乔)"
