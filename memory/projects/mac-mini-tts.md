# Mac mini (zhc) 本地 TTS 项目

**更新时间**: 2026-04-08 21:36 CST
**状态**: ⏹️ 已终止

---

## 项目目标
在 zhc 的 Mac mini 上部署本地 TTS 服务，支持中文语音合成。

## 设备信息
- **主机**: Mac mini (Apple Silicon ARM64)
- **系统**: macOS 26.2
- **IP**: 192.168.1.213 (内网) / 1.12.62.15:6000 (frp)
- **Python**: 3.9.6

## 部署方案

### 方案一: Piper (轻量级) ❌ 受阻
- GitHub 下载速度过慢，连接不稳定
- 文件大小: 18.2MB
- 状态: 下载超时，暂时放弃

### 方案二: Coqui TTS (Python) ⏹️ 已终止
- 使用 pip 安装 TTS 库
- 支持多种中文模型
- 状态: 用户终止

## 当前进度

1. ✅ SSH 连接测试成功
2. ✅ 系统状态检查完成
3. ✅ 部署脚本上传成功
4. ⏹️ Python TTS 安装已终止

## 终止原因
用户主动终止任务。

## 后续建议
如需继续部署，可重新执行：
```bash
ssh -p 6000 zhc@1.12.62.15
# 密码: zhc135!
cd ~/tts/local
source venv/bin/activate
```

---
