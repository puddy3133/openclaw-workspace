# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:
- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras
- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH
- home-server → 192.168.1.100, user: admin

### TTS
- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## My Tools

### Feishu / 飞书
- Bot Name: 小乔
- App ID: cli_a903c10df462dbc8
- Domain: feishu.cn (中国版)
- DM Policy: pairing (需要配对码验证)
- Group Policy: open (群组允许所有人使用)

### 飞书统一工具策略 (2026-03-30)
**统一走 lark-cli**，不再分散使用 feishu_* 原生工具。

| 场景 | 工具 | 说明 |
|------|------|------|
| 日历/日程 | `lark-cli calendar` | +agenda, events list/create |
| 文档 | `lark-cli docs` | create, fetch, update |
| 电子表格 | `lark-cli sheets` | read, write, create |
| 任务 | `lark-cli task` | create, list, update |
| Wiki | `lark-cli wiki` | spaces, nodes |
| 邮箱 | `lark-cli mail` | 原生工具无此功能 |
| 妙记 | `lark-cli minutes` | 原生工具无此功能 |
| 视频会议 | `lark-cli vc` | 原生工具无此功能 |
| 多维表格 | `lark-cli base` | tables, records, fields |
| 文件管理 | `lark-cli drive` | list, copy, move, upload |
| IM 消息 | `lark-cli im` | send, list, search |
| 通用兜底 | `lark-cli api` | 任意飞书 OpenAPI |

**认证**：lark-cli 独立管理，`lark-cli doctor` 检查状态
**Skills**：lark-* skills (在 ~/.agents/skills/) 基于 lark-cli 设计
**备用**：feishu_* 原生工具留着当 fallback，日常不用

### SSH / 远程服务器

#### 大乔 (腾讯云 Ubuntu)
- **IP**: 1.12.62.15
- **用户**: root
- **系统**: Ubuntu 22.04 (VM-0-5-ubuntu)
- **配置**: 2核2G，40G硬盘
- **用途**: OpenClaw 小弟机（辅助计算/任务执行）
- **OpenClaw 状态**: ✅ 运行中 (Gateway PID 2092099)
- **frps**: 服务端口 7000，token: zhc2024macmini
- **SSH**: `ssh root@1.12.62.15`
- **操控小乔Mac**: `ssh -p 6000 puddy@localhost` (通过frp隧道)

#### ZHC (Mac mini M4)
- **IP**: 1.12.62.15:6000 (frp穿透)
- **用户**: zhc
- **系统**: macOS 26.2 (Darwin ARM64)
- **用途**: TTS 服务
- **SSH**: `ssh -p 6000 zhc@1.12.62.15`

### TTS 服务 (ZHC Mac Mini)
- **设备**: Mac mini M4 (16GB)
- **位置**: 公司局域网 (192.168.1.213)
- **远程访问**: `ssh -p 6000 zhc@1.12.62.15` (密码: zhc135!)
- **服务地址**: `http://1.12.62.15:6000` (frp 穿透)
- **本地地址**: `http://192.168.1.213:8080`
- **模型**: Qwen3-TTS-0.6B-Base
- **启动脚本**: `~/start_tts.sh`
- **状态**: ✅ 运行中 (测试模式)
- **特点**: 
  - 纯内存处理，零磁盘写入
  - 零日志记录
  - 支持中文 TTS
  - 音色克隆 (待完善)

### API Keys / 搜索服务
- **BAIDU_API_KEY** → 已配置（百度搜索/学术/百科）
- **TAVILY_API_KEY** → 已配置（深度网页检索/新闻）
- **BRAVE_API_KEY** → 未配置（可选）

### 搜索工具策略 (2026-03-31)
**禁用 `web_search` 工具**（内部走Kimi API，已失效），**改用 `research-router` skill 脚本**。

| 场景 | 工具 | 调用方式 |
|------|------|----------|
| 通用搜索（自动路由） | research-router | `python3 ~/.openclaw/skills/research-router/scripts/search_router.py --provider auto --query "关键词"` |
| 强制国外 | research-router | `--provider tavily --search-depth basic/advanced` |
| 强制国内 | research-router | `--provider baidu-web` |

**注意**：`web_search` 工具已废弃，调用会报 401。所有搜索必须通过 `research-router` 脚本执行。

---

Add whatever helps you do your job. This is your cheat sheet.
