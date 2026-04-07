#!/usr/bin/env python3
"""
ElevenLabs Voice Clone Tool
用于从音频样本创建自定义音色
"""

import os
import sys
import requests
from pathlib import Path

def create_voice_from_samples(name, description, sample_files, api_key):
    """
    使用 ElevenLabs API 从音频样本创建自定义音色
    
    Args:
        name: 音色名称
        description: 音色描述
        sample_files: 音频文件路径列表
        api_key: ElevenLabs API Key
    """
    url = "https://api.elevenlabs.io/v1/voices/add"
    
    headers = {
        "Accept": "application/json",
        "xi-api-key": api_key
    }
    
    data = {
        "name": name,
        "description": description,
        "labels": '{"accent": "chinese", "gender": "female"}'
    }
    
    files = []
    for sample_file in sample_files:
        file_path = Path(sample_file)
        if file_path.exists():
            files.append(("files", (file_path.name, open(file_path, "rb"), "audio/mpeg")))
        else:
            print(f"Warning: File not found: {sample_file}")
    
    if not files:
        print("Error: No valid sample files found!")
        return None
    
    try:
        response = requests.post(url, headers=headers, data=data, files=files)
        
        # Close all file handles
        for _, file_tuple in files:
            file_tuple[1].close()
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Voice created successfully!")
            print(f"   Voice ID: {result.get('voice_id')}")
            print(f"   Name: {result.get('name')}")
            print(f"   Samples: {len(result.get('samples', []))}")
            return result
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return None

def list_voices(api_key):
    """列出所有已创建的音色"""
    url = "https://api.elevenlabs.io/v1/voices"
    
    headers = {
        "Accept": "application/json",
        "xi-api-key": api_key
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            voices = response.json().get('voices', [])
            print(f"\n📋 Your Voices ({len(voices)} total):")
            for voice in voices:
                print(f"   - {voice.get('name')} (ID: {voice.get('voice_id')})")
            return voices
        else:
            print(f"❌ Error: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Exception: {e}")
        return []

if __name__ == "__main__":
    # 检查 API Key
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        print("❌ Error: ELEVENLABS_API_KEY environment variable not set!")
        print("   Please set it with: export ELEVENLABS_API_KEY='your_api_key'")
        sys.exit(1)
    
    # 音色配置
    voice_name = "小乔"
    voice_description = "小乔的自定义音色，基于国栋提供的语音样本训练"
    
    # 样本文件路径
    sample_dir = Path("/Users/puddy/.openclaw/workspace/memory/voice")
    sample_files = [
        sample_dir / "sample1.mp3",
        sample_dir / "sample2.mp3"
    ]
    
    print("🎙️  ElevenLabs Voice Clone Tool")
    print("=" * 40)
    print(f"Voice Name: {voice_name}")
    print(f"Description: {voice_description}")
    print(f"Samples: {len(sample_files)} files")
    print()
    
    # 创建音色
    result = create_voice_from_samples(
        name=voice_name,
        description=voice_description,
        sample_files=sample_files,
        api_key=api_key
    )
    
    if result:
        print("\n✨ Voice creation completed!")
        # 列出所有音色
        list_voices(api_key)
    else:
        print("\n❌ Voice creation failed!")
        sys.exit(1)
