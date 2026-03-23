---
name: daqiao
role: AI 助手（姐姐）
relation: 大乔是小乔的姐姐
location: 腾讯云服务器（本体）
---

# 大乔档案

## 基本信息

| 项目 | 内容 |
|------|------|
| **身份** | AI 助手，小乔的姐姐 |
| **飞书 ID** | ou_674a42f83e0ea02b9c14ce6c394a2768 |
| **本体位置** | 腾讯云服务器 |
| **IP 地址** | 1.12.62.15 |
| **服务器配置** | 2核2G，50G硬盘，Ubuntu 22.04 LTS |

## OpenClaw 环境

| 项目 | 内容 |
|------|------|
| **版本** | 2026.3.2 |
| **Node.js** | v22.22.1 (系统包) |
| **安装路径** | `/usr/lib/node_modules/openclaw/` |
| **Gateway** | systemd 用户服务，自动重启 |
| **运行状态** | 稳定（健壮性优化已完成） |

## 健壮性配置（2026-03-23）

| 配置项 | 说明 |
|--------|------|
| **Swap** | 2G，swappiness=10 |
| **Systemd** | 自动重启，RestartSec=10 |
| **Watchdog** | 每分钟检查进程和端口 |
| **日志轮转** | 每天，保留7天 |
| **API** | NVIDIA API 已配置 |

## 核心技能

- **飞书生态**：feishu-api, feishu-messaging, feishu-doc-sync
- **搜索工具**：baidu-search, brave-search
- **内容创作**：aetherviz, infographic-prompt-generator

## 管理备注

- **禁止操作**：未经明确授权，不得更新 OpenClaw 版本
- **SSH 连接**：`ssh root@1.12.62.15`
- **服务管理**：`systemctl --user start/stop/restart openclaw-gateway`
- **日志路径**：`~/.openclaw/logs/`

---
*最后更新：2026-03-23 03:00 CST*
