# AI Assistant Relay Skill

**Status:** Ready for installation  
**Purpose:** Send Feishu messages between Xiaoqiao and Daqiao with @mentions

## Quick Start

```bash
# 1. Install the skill
cd ~/.openclaw/skills/ai-assistant-relay
bash scripts/install.sh

# 2. Edit config with your Feishu app secret
nano ~/.openclaw/config/ai-assistant-relay.json

# 3. Test send
python3 scripts/ai_assistant_relay.py send --to daqiao --msg "测试消息"
```

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Skill documentation |
| `scripts/ai_assistant_relay.py` | Main Python implementation |
| `config/ai-assistant-relay.json.template` | Config template |
| `scripts/install.sh` | Setup script |

## Integration with OpenClaw

To use this skill from other OpenClaw components, call the Python script directly or wrap it in a tool definition. The skill outputs JSON for easy parsing.

## Requirements

- Python 3.8+
- Feishu app with `chat:message:send` permission
- Bot added to target group chat
