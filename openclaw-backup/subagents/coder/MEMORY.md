# 专属记忆空间
- 目前暂时没有特定的代码架构上下文记忆。
- （后续所有确定的技术栈基调将会被自动同步至此处）

## 工具整合记录

### coding-agent skill 整合 (2026-03-01)
- **状态**: 已整合到 SOUL.md
- **目的**: 增强代码生成效率，提供外部 Coding Agent 支持
- **使用策略**: 
  - 优先自己编写核心逻辑
  - 外部 Agent 用于辅助生成模板、重复代码、快速原型
  - 所有外部生成的代码必须经过审核

### 外部 Coding Agents 状态
- Codex CLI: 未安装
- Claude Code: 未安装
- OpenCode: 未安装
- Pi Coding Agent: 未安装

### 安装命令（备用）
```bash
# Codex CLI (需要 OpenAI API Key)
npm install -g @openai/codex

# Claude Code (需要 Anthropic API Key)
npm install -g @anthropics/claude-code

# OpenCode
npm install -g opencode

# Pi Coding Agent
npm install -g @mariozechner/pi-coding-agent
```