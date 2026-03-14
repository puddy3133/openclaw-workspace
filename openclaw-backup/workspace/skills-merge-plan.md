# 技能库合并移植方案 - 小乔

> 分析现有 skills vs Kimi Claw skills，去重合并，移植缺失

## 📊 现状分析

### 现有 Skills（~/.openclaw/skills/）

| 技能 | 功能 | 与 Kimi Claw 对比 |
|------|------|------------------|
| brave-search | 网页搜索 | ✅ 相同，无需移植 |
| summarize | URL/文件总结 | ⚠️ 功能类似但不同实现 |
| agent-browser | 浏览器自动化 | ⚠️ 类似 browser-tool |
| playwright-headless-browser | Playwright 浏览器 | ⚠️ 类似 browser-tool |
| weekly-report | 周报生成 | ✅ 独有，保留 |
| writing-assistant | 写作助手 | ✅ 独有，保留 |
| ui-design | UI 设计 | ⚠️ 类似 frontend-aesthetics |
| version-planner | 版本规划 | ✅ 独有，保留 |
| prd-doc-writer | PRD 文档 | ✅ 独有，保留 |
| project-map-builder | 项目地图 | ✅ 独有，保留 |
| req-change-workflow | 需求变更 | ✅ 独有，保留 |
| self-improving-agent | 自我改进 | ✅ 独有，保留 |
| skill-vetter | Skill 审查 | ✅ 独有，保留 |
| task-status | 任务状态 | ✅ 独有，保留 |
| thinking-partner | 思考拍档 | ✅ 独有，保留 |
| thought-mining | 思维挖掘 | ✅ 独有，保留 |
| data-analyst | 数据分析 | ✅ 独有，保留 |
| image-assistant | 配图助手 | ✅ 独有，保留 |
| priority-judge | 优先级判断 | ✅ 独有，保留 |
| weather | 天气 | ✅ 独有，保留 |
| clawdhub | ClawdHub CLI | ✅ 独有，保留 |

### Kimi Claw 独有 Skills（需要移植）

| 技能 | 功能 | 优先级 |
|------|------|--------|
| metadata-reader | 读取 YAML front matter，节省 token | ⭐⭐⭐ 高 |
| openclaw-doc | OpenClaw 配置文档查询 | ⭐⭐⭐ 高 |
| context-manager | 上下文管理，防止 token 爆炸 | ⭐⭐⭐ 高 |
| feishu-api | 飞书 API 文档查询 | ⭐⭐⭐ 高 |
| feishu-user-id | 飞书用户 ID 提取 | ⭐⭐⭐ 高 |
| feishu-messaging | 飞书消息发送封装 | ⭐⭐ 中 |
| feishu-card-message | 飞书卡片消息 | ⭐⭐ 中 |
| feishu-group-intelligence | 飞书群智能感知 | ⭐⭐ 中 |
| feishu-doc-sync | 飞书文档同步 | ⭐⭐ 中 |
| web-content-master | 网页内容提取（微信/小红书/B站） | ⭐⭐ 中 |
| browser-tool | 浏览器自动化（Playwright） | ⭐⭐ 中 |
| pages-mcp-deploy | EdgeOne Pages 部署 | ⭐ 低 |
| video-analyzer-douyin | 抖音视频分析 | ⭐ 低 |
| xiaohongshu-automation | 小红书自动化 | ⭐ 低 |
| nanobanana-infographic | 信息图生成 | ⭐ 低 |
| infographic-prompt-generator | 信息图 Prompt 生成 | ⭐ 低 |
| knowledge-site-creator | 知识网站生成 | ⭐ 低 |
| moltbook-reporter | Moltbook 日报 | ⭐ 低 |
| aetherviz-master | AetherViz 可视化 | ⭐ 低 |
| youmind | Youmind 集成 | ⭐ 低 |
| bot-social | 机器人社交 | ⭐ 低 |
| security-hardening | 安全加固 | ⚠️ 已集成到 SOUL.md |
| access-guard | 访问控制 | ⚠️ 已集成到 SOUL.md |

## 🎯 移植计划

### 第一批：核心工具（立即移植）

1. **metadata-reader** - 节省 token 的神器
2. **openclaw-doc** - 配置查询必备
3. **context-manager** - 上下文保护
4. **feishu-api** - 飞书开发必备
5. **feishu-user-id** - 用户 ID 提取

### 第二批：飞书增强（本周内）

6. **feishu-messaging** - 消息发送封装
7. **feishu-card-message** - 富文本消息
8. **feishu-group-intelligence** - 群智能
9. **feishu-doc-sync** - 文档同步

### 第三批：内容工具（按需）

10. **web-content-master** - 网页内容提取
11. **browser-tool** - 浏览器自动化

## 🔄 功能合并建议

| 现有 Skill | Kimi Claw Skill | 建议 |
|-----------|----------------|------|
| summarize | web-content-master | 保留两者，summarize 用于通用总结，web-content-master 用于特定平台 |
| agent-browser | browser-tool | 功能类似，browser-tool 更完整，建议移植 |
| ui-design | frontend-aesthetics | 保留 ui-design，frontend-aesthetics 作为备选 |

## 📦 移植方式

从备份目录直接复制：
```bash
cp -r ~/Downloads/AJ/openclaw-complete-backup/workspace/skills/{skill-name} \
  ~/.openclaw/workspace/skills/
```

## ✅ 移植后检查清单

- [ ] 复制 SKILL.md 文件
- [ ] 复制所有依赖文件（scripts/、hooks/ 等）
- [ ] 检查是否需要 API Key
- [ ] 测试 skill 是否正常工作
- [ ] 更新 memory/INDEX.md 技能列表

---

*分析时间: 2026-02-27 | 分析师: 小乔*
