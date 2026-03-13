#!/usr/bin/env python3
"""
小红书自动化发布脚本
运行方式: python xiaohongshu_poster.py
"""

import os
import json
import time
import requests
from datetime import datetime

# 配置
CONFIG = {
    "cookie": os.getenv("XIAOHONGSHU_COOKIE", ""),
    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "delay_between_posts": 60,  # 发布间隔（秒）
}

def load_content():
    """加载生成的内容"""
    with open("output/caption.json", "r", encoding="utf-8") as f:
        return json.load(f)

def upload_image(image_path):
    """上传图片到小红书"""
    # 这里需要实现小红书图片上传接口
    # 由于接口可能变化，建议参考小红书网页版的实际请求
    print(f"上传图片: {image_path}")
    return "image_url_placeholder"

def create_post(title, content, images, topics):
    """创建小红书笔记"""
    if not CONFIG["cookie"]:
        print("错误: 未设置 XIAOHONGSHU_COOKIE 环境变量")
        return False
    
    headers = {
        "Cookie": CONFIG["cookie"],
        "User-Agent": CONFIG["user_agent"],
        "Content-Type": "application/json",
    }
    
    # 小红书发布接口（需要根据实际接口调整）
    post_data = {
        "title": title,
        "content": content,
        "images": images,
        "topics": topics,
    }
    
    print(f"准备发布: {title}")
    print(f"内容长度: {len(content)} 字")
    print(f"图片数量: {len(images)} 张")
    print(f"话题: {', '.join(topics)}")
    
    # 实际发布请求（需要逆向工程获取真实接口）
    # response = requests.post("https://www.xiaohongshu.com/api/...", 
    #                         headers=headers, json=post_data)
    
    print("✅ 内容已准备好，请手动确认后发布")
    return True

def main():
    """主函数"""
    print("=" * 50)
    print("小红书自动化发布脚本")
    print("=" * 50)
    
    # 检查配置
    if not CONFIG["cookie"]:
        print("\n⚠️  请先设置环境变量:")
        print("export XIAOHONGSHU_COOKIE='你的cookie'")
        return
    
    # 加载内容
    try:
        content = load_content()
    except FileNotFoundError:
        print("\n⚠️  未找到内容文件，请先运行内容生成")
        return
    
    # 发布
    print(f"\n发布时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 50)
    
    create_post(
        title=content["title"],
        content=content["content"],
        images=content["images"],
        topics=content["topics"]
    )
    
    print("\n" + "=" * 50)
    print("完成!")
    print("=" * 50)

if __name__ == "__main__":
    main()
