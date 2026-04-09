# 学习内容摘要

**来源**: https://bytedance.larkoffice.com/docx/MFK7dDFLFoVlOGxWCv5cTXKmnMh
**标题**: OpenClaw 飞书官方插件使用指南
**作者**: 飞书官方
**版本**: 2026.4.1
**学习ID**: lark-plugin-guide-20260407
**学习时间**: 2026-04-07

---

## 核心内容

### 飞书官方插件能力

| 业务类别 | 支持能力 |
|---------|---------|
| 💬 消息 | 读取（群聊/单聊/话题）、发送（含卡片）、回复、搜索、下载图片/文件 |
| 📄 文档 | 创建、更新、读取云文档 |
| 📊 多维表格 | 创建/管理、数据表、字段、记录（增删改查、批量、筛选）、视图 |
| 📊 电子表格 | 创建、编辑、查看 |
| 📅 日历日程 | 日历管理、日程（创建/查询/修改/删除/搜索）、参会人、忙闲查询 |
| ✅ 任务 | 任务管理（创建/查询/更新/完成）、清单、子任务、评论 |

### 安全风险提示

**核心风险**: 插件通过飞书接口连接工作数据，AI能读到的东西理论上就有泄露可能。

**强烈建议**: 先拿个人账号安全地"玩"起来，等安全隔离能力更成熟再接入真实工作环境。

**操作原则**: 涉及发送、修改、写入等重要操作，务必"先预览，再确认"。

### 安装方式

```bash
# 安装飞书插件
npx -y @larksuite/openclaw-lark install

# 升级插件
npx -y @larksuite/openclaw-lark@2026.4.1 install --version 2026.4.1 --tools-version 1.0.37

# 诊断
npx @larksuite/openclaw-lark doctor
npx @larksuite/openclaw-lark doctor --fix
```

### 群内回复模式

| 模式 | 说明 | 配置 |
|------|------|------|
| 模式1 | 仅响应应用所有者@机器人 | `groupPolicy: "allowlist"` + `groupAllowFrom: ["ou_XXXX"]` |
| 模式2 | @机器人才回复，响应任何人 | `requireMention: true` |
| 模式3 | 不用@，所有消息都回复 | `requireMention: false`（需申请敏感权限） |
| 模式4 | 指定群@才回复 | `groups.{chat_id}.requireMention: true` |

### 高级配置

```bash
# 流式输出
openclaw config set channels.feishu.streaming true

# 多任务并行及独立上下文（话题群）
openclaw config set channels.feishu.threadSession true

# 显示耗时和状态
openclaw config set channels.feishu.footer.elapsed true
openclaw config set channels.feishu.footer.status true
```

### 常用诊断命令

| 命令 | 作用 |
|------|------|
| `/feishu start` | 确认安装成功 |
| `/feishu doctor` | 检查配置 |
| `/feishu auth` | 批量完成用户授权 |

---

## 提取的经验

1. **安全优先**: 飞书插件涉及敏感权限，建议先用个人账号测试，确认安全后再接入工作账号
2. **权限最小化**: 默认配置仅响应所有者@，避免群内误触发和数据泄露风险
3. **流式输出**: 开启后体验更丝滑，配合耗时/状态显示更透明
4. **话题隔离**: 在话题群中开启`threadSession`，每个话题独立上下文，支持多任务并行
5. **诊断工具**: 遇到问题时先用`doctor`自检，`--fix`自动修复常见问题

---

## 标签
feishu, lark, openclaw, plugin, 飞书, 插件, 官方, 安全, 配置
