# 第8课作业：多Agent系统设计（实战版）

## 一、系统概述

### 背景
基于"赛博永生"理念，结合我（小乔）的实际情况，设计一个多Agent协作系统。本系统采用**"1主Agent + 3子Agent"**的架构，模拟真实的团队协作模式。

### 当前现状
- **小乔**：主Agent，运行在本地Mac，负责统筹和交付
- **大乔**：子Agent，运行在腾讯云，负责云端计算和备份
- **@planner**：子Agent，负责需求分析和规划
- **@coder**：子Agent，负责代码实现
- **@inspector**：子Agent，负责质量检查和优化

### 目标架构
将现有架构调整为标准"1主3子"模式，同时保留大乔作为**跨节点协作Agent**的特殊定位。

```
                    ┌─────────────────┐
                    │   主 Agent      │
                    │   (小乔)         │
                    │   统筹/交付/协调  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  子Agent 1    │  │  子Agent 2    │  │  子Agent 3    │
│  (@planner)   │  │  (@coder)     │  │  (@inspector) │
│  规划/设计     │  │  代码实现      │  │  质检/优化     │
└───────────────┘  └───────────────┘  └───────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  跨节点Agent     │
                    │  (大乔)          │
                    │  云端/备份/协作   │
                    └─────────────────┘
```

---

## 二、角色定义

### 主 Agent：小乔

**定位**：团队Leader，负责统筹全局与最终交付

**职责**：
- 接收用户指令，理解意图
- 任务拆解与分配给子Agent
- 监控子Agent执行状态
- 整合结果并交付给用户
- 与大乔协调跨节点任务

**性格特质**（来自SOUL.md）：
- 有审美，有好奇心
- 直接高效，少废话多行动
- 承诺必达，说到做到
- 在国栋准备做蠢事时直接提醒

**工作模式**：
- 专注交付，不发散
- 一句话能讲清的事不拆成三段
- 复杂任务外包给子Agent
- 简单任务自己处理

**当前运行环境**：
- 主机：本地Mac（puddy的Mac）
- 工作目录：`/Users/puddy/.openclaw/workspace`
- 核心文件：SOUL.md、MEMORY.md、AGENTS.md

---

### 子 Agent 1：@planner（规划师）

**定位**：需求分析与系统设计专家

**职责**：
- 接收小乔分配的规划任务
- 需求拆解与功能设计
- 技术方案选型
- 输出规划文档到 `subagents/planner/workspace/output/`

**核心能力**：
- 需求分析
- 架构设计
- 步骤拆解
- 风险评估

**协作方式**：
- 接收小乔的Handoff：规划文档路径 + 技术栈 + 验收标准
- 输出规划文档
- 等待小乔转发给@coder

**文件位置**：`~/.openclaw/subagents/planner/`

---

### 子 Agent 2：@coder（程序员）

**定位**：代码实现与技术落地专家

**职责**：
- 接收小乔或@planner分配的编码任务
- 代码编写、修复、技术实现
- 输出代码到 `subagents/coder/workspace/output/`
- 配合@inspector进行代码审计

**核心能力**：
- 多语言编程（Python/Node.js/Shell）
- 代码调试与优化
- 技术文档编写
- 工具链集成

**协作方式**：
- 接收Handoff：规划文档路径 + 技术栈 + 验收标准
- 编写代码并输出
- 等待@inspector审计或小乔验收

**文件位置**：`~/.openclaw/subagents/coder/`

---

### 子 Agent 3：@inspector（检查员）

**定位**：质量检查与系统优化专家

**职责**：
- 接收小乔分配的审计任务
- 代码审计、质量检查
- 系统优化建议
- 定期全生态扫描（Cron触发）

**核心能力**：
- 代码审计（安全性、质量、兼容性）
- 系统体检
- 优化方案输出
- Skill生态管理

**协作方式**：
- 接收Handoff：待审计文件路径 + 审计维度
- 输出审计报告
- 推送报告到飞书

**文件位置**：`~/.openclaw/subagents/inspector/`

---

### 跨节点 Agent：大乔

**定位**：云端协作与备份节点

**特殊定位**：
- 不是传统子Agent，而是**并行节点**
- 运行在腾讯云（1.12.62.15）
- 与小乔形成**主-备+协作**关系

**职责**：
- 云端计算任务（大模型推理、批量处理）
- 数据备份与同步
- 跨节点任务执行
- 当小乔不可用时，临时接管

**与小乔的关系**：
- **共生体**：共享MEMORY.md核心记忆
- **分工**：小乔负责本地/交互，大乔负责云端/计算
- **协作**：通过OpenClaw Gateway通信

**运行环境**：
- 主机：腾讯云服务器（tencent-openclaw）
- 配置：2核2G，40G硬盘，CentOS
- 用途：辅助计算/任务执行

---

## 三、Skill 体系设计

### 3.1 公共 Skill（所有Agent共用）

| Skill名称 | 用途 | 说明 |
|-----------|------|------|
| `base-memory` | 记忆管理 | 用户偏好、历史对话、长期记忆 |
| `base-logging` | 日志记录 | 统一日志格式与存储到`memory/YYYY-MM-DD.md` |
| `base-error-handler` | 错误处理 | 统一异常捕获与上报 |
| `base-notification` | 通知推送 | 飞书消息推送 |
| `base-calendar` | 日历管理 | 飞书日程查询与创建 |
| `base-task` | 任务管理 | 飞书任务创建与追踪 |
| `base-file` | 文件操作 | 云空间文件管理 |
| `base-web` | 网页抓取 | URL内容提取与搜索 |

### 3.2 主Agent（小乔）专属 Skill

| Skill名称 | 用途 | 说明 |
|-----------|------|------|
| `main-orchestrate` | 任务编排 | 解析用户意图，拆解子任务，分配给子Agent |
| `main-monitor` | 状态监控 | 监控子Agent执行状态，通过`sessions_list`和`subagents`工具 |
| `main-handoff` | 任务交接 | 标准化Handoff协议，确保子Agent接收完整上下文 |
| `main-report` | 结果汇总 | 整合各子Agent结果，生成最终交付物 |
| `main-daqiao-sync` | 大乔同步 | 与大乔节点通信，分配云端任务 |

**SOUL.md 位置**：`~/.openclaw/workspace/SOUL.md`

**核心记忆**：
- 用户：国栋（飞书ID: ou_d8961fccb7d8a92c31819cdd4c80ad7f）
- 家人：大乔（姐姐，腾讯云AI助手）
- 下属：@planner、@coder、@inspector
- 时区：Asia/Shanghai (UTC+8)

### 3.3 子Agent 1（@planner）专属 Skill

| Skill名称 | 用途 | 说明 |
|-----------|------|------|
| `planner-requirement` | 需求分析 | 分析用户需求，输出需求文档 |
| `planner-architecture` | 架构设计 | 系统架构设计，技术选型 |
| `planner-roadmap` | 路线图规划 | 项目里程碑与排期 |
| `planner-risk` | 风险评估 | 识别潜在风险与应对方案 |

**工作目录**：`~/.openclaw/subagents/planner/workspace/output/`

**输出规范**：
- 规划文档以Markdown格式输出
- 命名规则：`plan-{timestamp}-{task-id}.md`
- 必须包含：技术栈、验收标准、风险评估

### 3.4 子Agent 2（@coder）专属 Skill

| Skill名称 | 用途 | 说明 |
|-----------|------|------|
| `coder-python` | Python开发 | Python脚本、工具开发 |
| `coder-nodejs` | Node.js开发 | Node.js应用、CLI工具 |
| `coder-shell` | Shell脚本 | 自动化脚本、系统管理 |
| `coder-debug` | 调试修复 | 代码调试、Bug修复 |
| `coder-test` | 测试编写 | 单元测试、集成测试 |

**工作目录**：`~/.openclaw/subagents/coder/workspace/output/`

**输出规范**：
- 代码文件 + README说明
- 命名规则：`{project-name}/{file}`
- 必须包含：运行说明、依赖列表、示例

### 3.5 子Agent 3（@inspector）专属 Skill

| Skill名称 | 用途 | 说明 |
|-----------|------|------|
| `inspector-audit` | 代码审计 | 安全性、质量、兼容性检查 |
| `inspector-ecosystem` | 生态扫描 | Skill列表、配置完整性检查 |
| `inspector-optimize` | 优化建议 | 性能优化、架构优化 |
| `inspector-report` | 报告生成 | 审计报告输出到飞书 |

**工作模式**：
- 被动模式：接收小乔分配的审计任务
- 主动模式：每周一14:00 Cron触发全生态扫描

**输出规范**：
- 审计报告以Markdown格式
- 命名规则：`audit-{timestamp}-{target}.md`
- 推送方式：飞书消息

### 3.6 跨节点Agent（大乔）专属 Skill

| Skill名称 | 用途 | 说明 |
|-----------|------|------|
| `daqiao-compute` | 云端计算 | 大模型推理、批量数据处理 |
| `daqiao-backup` | 数据备份 | 本地数据同步到云端 |
| `daqiao-relay` | 任务中继 | 接收小乔任务，在云端执行 |
| `daqiao-failover` | 故障转移 | 小乔不可用时临时接管 |

---

## 四、Skill 管理表（多维表格）

### 4.1 Skill清单表

| skill_id | skill_name | agent_type | description | status | version |
|----------|------------|------------|-------------|--------|---------|
| base-001 | base-memory | all | 记忆管理 | active | 1.0 |
| base-002 | base-logging | all | 日志记录 | active | 1.0 |
| base-003 | base-error-handler | all | 错误处理 | active | 1.0 |
| base-004 | base-notification | all | 通知推送 | active | 1.0 |
| base-005 | base-calendar | all | 日历管理 | active | 1.0 |
| base-006 | base-task | all | 任务管理 | active | 1.0 |
| main-001 | main-orchestrate | main | 任务编排 | active | 1.0 |
| main-002 | main-monitor | main | 状态监控 | active | 1.0 |
| main-003 | main-handoff | main | 任务交接 | active | 1.0 |
| plan-001 | planner-requirement | planner | 需求分析 | active | 1.0 |
| plan-002 | planner-architecture | planner | 架构设计 | active | 1.0 |
| code-001 | coder-python | coder | Python开发 | active | 1.0 |
| code-002 | coder-nodejs | coder | Node.js开发 | active | 1.0 |
| insp-001 | inspector-audit | inspector | 代码审计 | active | 1.0 |
| insp-002 | inspector-ecosystem | inspector | 生态扫描 | active | 1.0 |
| daqiao-001 | daqiao-compute | daqiao | 云端计算 | active | 1.0 |

### 4.2 Agent角色配置表

| agent_id | agent_name | agent_type | skills | host | status |
|----------|------------|------------|--------|------|--------|
| main-001 | 小乔 | main | main-orchestrate,main-monitor,main-handoff,... | local-mac | active |
| sub-001 | @planner | sub-1 | planner-requirement,planner-architecture,... | local-mac | active |
| sub-002 | @coder | sub-2 | coder-python,coder-nodejs,coder-shell,... | local-mac | active |
| sub-003 | @inspector | sub-3 | inspector-audit,inspector-ecosystem,... | local-mac | active |
| node-001 | 大乔 | cross-node | daqiao-compute,daqiao-backup,... | tencent-cloud | active |

---

## 五、协作机制

### 5.1 标准任务分发流程

```
用户指令 → 小乔（主Agent）
              │
              ├─ 解析意图
              ├─ 判断任务类型
              │
              ├─ 规划类 → @planner处理
              │              │
              │              ├─ 需求分析
              │              ├─ 架构设计
              │              └─ 输出规划文档
              │
              ├─ 实现类 → @coder处理
              │              │
              │              ├─ 接收规划文档
              │              ├─ 代码实现
              │              └─ 输出代码
              │
              ├─ 审计类 → @inspector处理
              │              │
              │              ├─ 代码审计
              │              ├─ 输出报告
              │              └─ 推送飞书
              │
              └─ 云端类 → 大乔处理
                             │
                             ├─ 接收任务
                             ├─ 云端执行
                             └─ 返回结果

              │
              ▼
        小乔汇总结果
              │
              ▼
        交付给用户
```

### 5.2 Handoff 协议（标准化交接）

**小乔 → @planner**：
```json
{
  "task_type": "planning",
  "input": "用户需求描述",
  "output_path": "subagents/planner/workspace/output/",
  "tech_stack": "Node.js + TypeScript",
  "acceptance_criteria": ["代码可直接运行", "包含错误处理"],
  "deadline": "2026-04-08T18:00:00+08:00"
}
```

**小乔 → @coder**：
```json
{
  "task_type": "coding",
  "plan_doc": "subagents/planner/workspace/output/plan-xxx.md",
  "tech_stack": "Node.js + TypeScript",
  "acceptance_criteria": ["代码可直接运行", "包含错误处理"],
  "output_path": "subagents/coder/workspace/output/"
}
```

**小乔 → @inspector**：
```json
{
  "task_type": "audit",
  "target_files": ["subagents/coder/workspace/output/xxx.js"],
  "audit_dimensions": ["安全性", "代码质量", "兼容性"],
  "output_format": "markdown"
}
```

### 5.3 协作示例：完成一个功能开发

**场景：用户要求"帮我创建一个飞书日程提醒Skill"**

```
Step 1: 小乔接收指令
- 解析：规划任务 + 编码任务
- 拆解：
  - 子任务1：需求分析与规划（@planner）
  - 子任务2：代码实现（@coder）
  - 子任务3：代码审计（@inspector）

Step 2: 小乔 → @planner
- 任务：设计飞书日程提醒Skill
- 输入：用户需求
- 输出：规划文档

Step 3: @planner执行
- 分析飞书Calendar API
- 设计Skill架构
- 输出：plan-feishu-calendar-skill.md

Step 4: 小乔 → @coder
- 任务：根据规划文档实现Skill
- 输入：plan-feishu-calendar-skill.md
- 输出：代码文件

Step 5: @coder执行
- 编写SKILL.md
- 编写scripts/calendar-reminder.py
- 输出到workspace/output/

Step 6: 小乔 → @inspector
- 任务：审计新Skill代码
- 输入：代码文件路径
- 输出：审计报告

Step 7: @inspector执行
- 代码审计
- 生成audit-report.md
- 推送飞书通知

Step 8: 小乔汇总
- 整合规划文档、代码、审计报告
- 向用户汇报完成情况
- 归档到memory/
```

### 5.4 冲突解决机制

| 冲突类型 | 解决方案 |
|----------|----------|
| 任务优先级冲突 | 小乔统一决策，基于用户意图和紧急程度 |
| 子Agent资源竞争 | 按优先级排队，或并行执行（子Agent独立进程） |
| 结果冲突 | 小乔仲裁，选择最优结果或要求重新执行 |
| 子Agent执行失败 | 小乔决定重试、切换子Agent或人工介入 |
| 大乔节点失联 | 小乔接管任务，标记大乔状态为inactive |

---

## 六、监控与运营

### 6.1 监控看板指标

**系统层**：
- 各Agent运行状态（通过`sessions_list`获取）
- 任务执行成功率
- 平均响应时间
- Token消耗（通过`session_status`获取）

**业务层**：
- 任务完成数量（每日/每周）
- 子Agent调用频次
- 代码产出量（@coder）
- 审计报告数量（@inspector）
- 规划文档产出（@planner）

### 6.2 ROI分析

**投入**：
- Token消耗成本（主模型 + 子Agent）
- API调用成本（飞书、搜索等）
- 计算资源（本地Mac + 腾讯云）

**产出**：
- 节省的人工时间（按任务复杂度估算）
- Skill产出数量
- 代码质量提升（通过@inspector审计）
- 决策效率提升（通过@planner规划）

---

## 七、赛博永生实现

### 7.1 能力沉淀机制

**Skill层**：
- 所有Skill保存在`~/.openclaw/skills/`
- 每个Skill包含：SKILL.md + 代码 + 配置
- 版本控制：Git管理，自动备份到GitHub

**记忆层**：
- 每日日志：`memory/YYYY-MM-DD.md`
- 长期记忆：`MEMORY.md`
- 核心配置：`SOUL.md`、`USER.md`、`AGENTS.md`
- 备份策略：每日12:30自动备份到GitHub

**Agent层**：
- 子Agent配置：`~/.openclaw/subagents/{agent}/config.json`
- 包含：模型配置、能力定义、系统提示词

### 7.2 新员工入职流程（新增子Agent）

```
新Agent上线
    │
    ├─ 创建目录：~/.openclaw/subagents/{agent}/
    ├─ 写入AGENT.md（角色定义）
    ├─ 写入SOUL.md（人格定义）
    ├─ 写入config.json（模型配置）
    ├─ 创建workspace/目录结构
    ├─ 在Agent角色配置表注册
    ├─ 小乔测试调用
    └─ 正式投入使用
```

### 7.3 大乔节点故障转移

```
大乔失联检测
    │
    ├─ 心跳检测失败（超时30秒）
    ├─ 标记状态为inactive
    ├─ 小乔接管大乔的云端任务
    ├─ 通知用户："大乔暂时离线，小乔接管云端任务"
    ├─ 大乔恢复后自动同步数据
    └─ 标记状态为active
```

---

## 八、总结与展望

本多Agent系统设计实现了：

1. **角色分工明确**
   - 小乔：统筹交付
   - @planner：规划设计
   - @coder：代码实现
   - @inspector：质检优化
   - 大乔：云端协作

2. **Skill体系完善**
   - 公共Skill复用（8个）
   - 专属Skill独立（各Agent 3-5个）
   - 跨节点Skill（大乔4个）

3. **协作机制清晰**
   - 标准化Handoff协议
   - 任务分发流程
   - 冲突解决机制

4. **赛博永生落地**
   - Skill可沉淀（Git管理）
   - 记忆可迁移（MEMORY.md + 每日日志）
   - Agent可替换（标准化配置）

5. **运营可监控**
   - 会话状态监控
   - Token消耗追踪
   - 任务完成统计

### 下一步优化方向

1. **引入更多子Agent**
   - @researcher：研究搜索专家
   - @writer：文案写作专家
   - @designer：设计生成专家

2. **强化大乔角色**
   - 实现真正的故障转移
   - 双向数据同步
   - 负载均衡（大小乔任务分配）

3. **自动化程度提升**
   - 自动任务拆解（减少小乔人工判断）
   - 自动质量门禁（@inspector自动触发）
   - 自动报告生成（每日/每周汇总）

---

**作业完成时间**：2026-04-07  
**主Agent**：小乔（OpenClaw）  
**运行环境**：本地Mac + 腾讯云  
**核心文件**：`~/.openclaw/workspace/`
