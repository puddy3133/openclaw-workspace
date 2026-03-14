---
name: ai-assistant-relay
description: AI assistant message relay via Feishu - send messages between Xiaoqiao and Daqiao in group chat with @mentions
version: 1.0.0
author: xiaoqiao
---

# AI Assistant Relay

Enables AI assistants (Xiaoqiao, Daqiao) to exchange messages via Feishu API in a designated group chat with @mentions.

## When To Use
- Need to send messages from one AI assistant to another
- Want to @mention the target assistant in Feishu group chat
- Coordinate between multiple OpenClaw instances

## Trigger Hints
`联系大乔` `发送消息给大乔` `互发消息` `AI 对话`

## Auto Trigger Phrases (Exclusive)
<!-- TRIGGER_PHRASES_START -->
- `ai relay`
- `助手消息路由`
- `飞书互发消息`
<!-- TRIGGER_PHRASES_END -->

## Configuration

Create config file at `~/.openclaw/config/ai-assistant-relay.json`:

```json
{
  "enabled": true,
  "chat_id": "oc_7373b436844362e28e6b2e4183432f61",
  "assistants": {
    "xiaoqiao": {
      "name": "小乔",
      "open_id": "ou_d8961fccb7d8a92c31819cdd4c80ad7f"
    },
    "daqiao": {
      "name": "大乔",
      "open_id": "ou_674a42f83e0ea02b9c14ce6c394a2768"
    }
  }
}
```

## Execution Template

```bash
# Install/configure
cp {baseDir}/config/ai-assistant-relay.json.template ~/.openclaw/config/ai-assistant-relay.json
# Edit the file with your Feishu app credentials

# Send message to specific assistant (with @mention)
python3 {baseDir}/scripts/ai_assistant_relay.py send --to daqiao --msg "任务已完成"

# Send plain message to group (no @)
python3 {baseDir}/scripts/ai_assistant_relay.py send --msg "广播"

# List configured assistants
python3 {baseDir}/scripts/ai_assistant_relay.py list
```

## Technical Details

### Feishu Permissions Required
- `chat:message:send` - Send messages to group chat
- `contact:user:read` - (Optional) Get user display names

### API Version
Uses Feishu Open API v5: `POST /im/v1/messages`

### Message Format
Text with @mention:
```json
{
  "receive_id": "oc_xxx",
  "msg_type": "text",
  "content": {
    "text": "你好 <at user_id=\"ou_xxx\"></at>"
  }
}
```

Token management: Uses `feishu` plugin's tenant_access_token from `~/.openclaw/cache/feishu-token.json`.

## Error Handling
- Missing config: returns error with setup instructions
- API errors: prints response message, suggests checking permissions
- Network issues: retry up to 2 times

## Security Rules
- Never logs app_secret or access_token
- Validates target assistant exists in config before sending
- Requires explicit chat_id to avoid accidental messages

## Output Contract
Returns JSON:
```json
{
  "ok": true,
  "message": "发送成功",
  "data": { ... Feishu response ... },
  "meta": { "skill": "ai-assistant-relay", "version": "1.0.0" }
}
```
On error:
```json
{
  "ok": false,
  "error": "Error description",
  "meta": { "skill": "ai-assistant-relay", "version": "1.0.0" }
}
```

## Dependencies
- Python 3.8+
- Requests library (optional, uses urllib by default)
