#!/usr/bin/env python3
"""
ElevenLabs Voice Clone Tool
使用 ElevenLabs API 从音频样本创建自定义音色
"""

import os
import sys
import requests

# ElevenLabs API 配置
API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")
API_BASE = "https://api.elevenlabs.io/v1"

def create_voice(name, description, files):
    """
    使用音频文件创建新的 ElevenLabs 音色
    
    Args:
        name: 音色名称
        description: 音色描述
        files: 音频文件路径列表
    """
    if not API_KEY:
        print("错误: 未设置 ELEVENLABS_API_KEY 环境变量")
        return None
    
    url = f"{API_BASE}/voices/add"
    
    headers = {
        "Accept": "application/json",
        "xi-api-key": API_KEY
    }
    
    data = {
        "name": name,
        "description": description,
        "labels": '{"accent": "chinese"}'
    }
    
    # 准备文件上传
    file_objects = []
    for file_path in files:
        if os.path.exists(file_path):
            file_objects.append(
                ("files", (os.path.basename(file_path), open(file_path, "rb"), "audio/mpeg"))
            )
        else:
            print(f"警告: 文件不存在 - {file_path}")
    
    if not file_objects:
        print("错误: 没有有效的音频文件")
        return None
    
    try:
        response = requests.post(url, headers=headers, data=data, files=file_objects)
        
        # 关闭文件句柄
        for _, file_tuple in file_objects:
            file_tuple[1].close()
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 音色创建成功!")
            print(f"   Voice ID: {result.get('voice_id')}")
            print(f"   Name: {result.get('name')}")
            return result
        else:
            print(f"❌ 创建失败: {response.status_code}")
            print(f"   响应: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ 错误: {e}")
        return None

def list_voices():
    """列出所有已创建的音色"""
    if not API_KEY:
        print("错误: 未设置 ELEVENLABS_API_KEY 环境变量")
        return
    
    url = f"{API_BASE}/voices"
    headers = {"Accept": "application/json", "xi-api-key": API_KEY}
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            voices = response.json().get("voices", [])
            print(f"\n🎙️ 已创建的音色 ({len(voices)} 个):")
            for voice in voices:
                print(f"   - {voice.get('name')} (ID: {voice.get('voice_id')[:8]}...)")
        else:
            print(f"❌ 获取失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 错误: {e}")

if __name__ == "__main__":
    # 检查 API Key
    if not API_KEY:
        print("请设置环境变量: export ELEVENLABS_API_KEY='your_api_key'")
        sys.exit(1)
    
    # 音频文件路径
    voice_dir = "/Users/puddy/.openclaw/workspace/memory/voice"
    sample_files = [
        os.path.join(voice_dir, "xiaoqiao_voice_sample_1.mp4"),
        os.path.join(voice_dir, "xiaoqiao_voice_sample_2.mp4")
    ]
    
    print("🎯 创建 ElevenLabs 音色: 小乔")
    print("=" * 50)
    
    # 创建音色
    result = create_voice(
        name="小乔",
        description="小乔的自定义音色，基于国栋提供的语音样本创建。温柔、自然、有亲和力。",
        files=sample_files
    )
    
    if result:
        print("\n" + "=" * 50)
        print("💡 使用提示:")
        print(f"   Voice ID: {result.get('voice_id')}")
        print("   可以在 TTS 调用时使用此 ID")
