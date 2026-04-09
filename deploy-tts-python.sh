#!/bin/bash
# Mac mini 本地 TTS 部署脚本 - 使用 Python TTS (Coqui TTS)

set -e

echo "=== Mac mini 本地 TTS 部署 ==="
echo ""

# 创建目录
mkdir -p ~/tts/local
cd ~/tts/local

# 创建 Python 虚拟环境
echo "创建 Python 虚拟环境..."
python3 -m venv venv
source venv/bin/activate

# 升级 pip
echo "升级 pip..."
pip install --upgrade pip

# 安装 TTS
echo "安装 Coqui TTS..."
pip install TTS

echo ""
echo "=== 安装完成 ==="
echo ""
echo "使用方法:"
echo "  cd ~/tts/local"
echo "  source venv/bin/activate"
echo "  tts --text '你好世界' --model_name tts_models/zh-CN/baker/tacotron2-DDC-GST --out_path output.wav"
echo ""
echo "查看可用中文模型:"
echo "  tts --list_models | grep zh"
