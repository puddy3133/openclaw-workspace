#!/bin/bash
# Piper TTS 部署脚本 for macOS ARM64

set -e

echo "=== Piper TTS 部署脚本 ==="
echo ""

# 创建目录
mkdir -p ~/tts/piper
cd ~/tts/piper

# 检查是否已下载
if [ -f "piper" ]; then
    echo "Piper 已存在，跳过下载"
else
    echo "正在下载 Piper (macOS ARM64)..."
    curl -L --retry 3 --max-time 120 -o piper.tar.gz "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_macos_aarch64.tar.gz"
    
    echo "解压中..."
    tar -xzf piper.tar.gz
    
    # 清理
    rm piper.tar.gz
fi

# 下载中文语音模型
echo ""
echo "下载中文语音模型..."
mkdir -p voices

# 中文模型 (zh_CN)
if [ ! -f "voices/zh_CN-huayan-medium.onnx" ]; then
    echo "下载 huayan 中文女声模型..."
    curl -L --retry 3 -o voices/zh_CN-huayan-medium.onnx "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/zh/zh_CN/huayan/medium/zh_CN-huayan-medium.onnx"
    curl -L --retry 3 -o voices/zh_CN-huayan-medium.onnx.json "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/zh/zh_CN/huayan/medium/zh_CN-huayan-medium.onnx.json"
fi

# 英文模型
if [ ! -f "voices/en_US-libritts-high.onnx" ]; then
    echo "下载 libritts 英文模型..."
    curl -L --retry 3 -o voices/en_US-libritts-high.onnx "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/libritts/high/en_US-libritts-high.onnx"
    curl -L --retry 3 -o voices/en_US-libritts-high.onnx.json "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/libritts/high/en_US-libritts-high.onnx.json"
fi

echo ""
echo "=== 安装完成 ==="
echo ""
echo "使用方法:"
echo "  echo '你好世界' | ~/tts/piper/piper --model ~/tts/piper/voices/zh_CN-huayan-medium.onnx --output_file ~/tts/output.wav"
echo ""
echo "可用模型:"
ls -la voices/
