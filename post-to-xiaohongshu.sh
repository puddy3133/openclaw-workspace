#!/bin/bash
# 小红书自动化一键发布脚本
# 运行方式: ./post-to-xiaohongshu.sh

echo "=========================================="
echo "小红书自动化发布"
echo "=========================================="

# 检查环境变量
if [ -z "$XIAOHONGSHU_COOKIE" ]; then
    echo "⚠️  错误: 未设置 XIAOHONGSHU_COOKIE 环境变量"
    echo ""
    echo "请先执行:"
    echo "export XIAOHONGSHU_COOKIE='你的cookie'"
    exit 1
fi

# 检查内容文件
if [ ! -f "output/caption.json" ]; then
    echo "⚠️  错误: 未找到内容文件"
    echo "请先运行内容生成"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 显示内容信息
echo "📄 内容预览:"
cat output/caption.json | python3 -m json.tool | head -20
echo ""

# 确认发布
read -p "确认发布? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "已取消"
    exit 0
fi

# 执行发布
echo ""
echo "🚀 正在发布..."
python3 xiaohongshu_poster.py

echo ""
echo "=========================================="
echo "完成!"
echo "=========================================="
