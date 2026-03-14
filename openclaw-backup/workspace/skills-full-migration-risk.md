# 全部移植第三批 Skills 的风险分析

## 📊 当前状态

| 类别 | 数量 |
|------|------|
| 系统级 Skills | 20 个 |
| 工作区 Skills（已移植） | 11 个 |
| 第三批候选 | 16 个 |
| **移植后总计** | **47 个** |

---

## ⚠️ 潜在问题

### 1. 选择困难 / 决策负担

**问题**: Skills 太多时，我不知道该用哪个

**例子**:
- 要生成前端 UI → ui-design？frontend-aesthetics？senior-frontend-aesthetics？
- 要提取网页内容 → summarize？web-content-master？browser-tool？
- 要发送飞书消息 → feishu-messaging？feishu-card-message？

**影响**: 反而降低效率，需要花时间选择

### 2. 功能重叠冲突

**已知重叠**:
| 功能 | Skills |
|------|--------|
| 前端设计 | ui-design + frontend-aesthetics + senior-frontend-aesthetics |
| 浏览器自动化 | agent-browser + playwright-headless-browser + browser-tool |
| 内容总结 | summarize + web-content-master |
| 信息图生成 | image-assistant + infographic-prompt-generator + nanobanana-infographic |

**风险**: 多个 skill 同时触发，或互相干扰

### 3. 维护成本增加

**问题**:
- 更多 skills 需要更多 API Key
- 更多 skills 需要定期更新
- 更多 skills 可能引入更多 bug

**例子**:
- xiaohongshu-automation 需要小红书账号
- nanobanana-infographic 需要 nanobanana API Key
- youmind 需要 Youmind 账号
- moltbook-reporter 需要 Moltbook 账号

### 4. 上下文膨胀

**问题**: 每次启动时需要读取的 skills 太多

**影响**:
- 启动时间变长
- Token 消耗增加
- 可能触发上下文限制

### 5. 安全风险

**问题**: 某些 skills 需要敏感权限

**例子**:
- xiaohongshu-automation 需要发布内容权限
- video-analyzer-douyin 需要访问外部服务
- pages-mcp-deploy 需要部署权限

---

## ✅ 全部移植的好处

### 1. 能力完整
- 拥有 Kimi Claw 的全部能力
- 不需要时再移植，随时可用

### 2. 一致性
- 与 Kimi Claw 的技能库保持一致
- 方便参考和使用习惯

### 3. 探索空间
- 可以尝试各种功能
- 发现新的使用场景

---

## 🎯 折中方案

### 方案 A：核心 + 探索（推荐）
移植第三批中的高价值 5 个，其他按需：
- ✅ knowledge-site-creator
- ✅ aetherviz-master
- ✅ infographic-prompt-generator
- ✅ pages-mcp-deploy
- ✅ moltbook-reporter

跳过（功能重叠或太 specialized）：
- ❌ frontend-aesthetics（与 ui-design 重叠）
- ❌ senior-frontend-aesthetics（与 ui-design 重叠）
- ❌ browser-tool（与 agent-browser 重叠）
- ❌ xiaohongshu-automation（太 specialized）
- ❌ video-analyzer-douyin（太 specialized）
- ❌ nanobanana-infographic（需要额外 API）
- ❌ bot-social（太 specialized）
- ❌ youmind（需要 Youmind 账号）

### 方案 B：全部移植 + 禁用
全部移植，但禁用不常用的：
- 在配置中禁用部分 skills
- 需要时再启用

### 方案 C：保持现状
- 已移植 11 个核心 skills
- 第三批按需逐个安装

---

## 💡 我的建议

**不建议全部移植**，原因：
1. 功能重叠会造成选择困难
2. 维护成本不成比例
3. 很多 specialized skills 你可能用不上

**推荐方案 A**：
- 移植第三批中的 5 个高价值 skills
- 总计 16 个 skills（系统 20 + 工作区 16）
- 保持精简但功能完整

**你想怎么选？**
