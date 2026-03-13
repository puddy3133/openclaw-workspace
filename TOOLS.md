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

### SSH / 远程服务器
- **tencent-openclaw** → 1.12.62.15, user: root, key: ~/.ssh/id_ed25519
  - 配置：2核2G，40G硬盘，CentOS
  - 用途：OpenClaw 小弟机（辅助计算/任务执行）

### API Keys / 搜索服务
- **BAIDU_API_KEY** → 已配置（百度搜索/学术/百科）
- **TAVILY_API_KEY** → 已配置（深度网页检索/新闻）
- **BRAVE_API_KEY** → 未配置（可选）

---

Add whatever helps you do your job. This is your cheat sheet.
