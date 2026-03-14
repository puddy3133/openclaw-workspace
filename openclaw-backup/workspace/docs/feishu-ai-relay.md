# 小乔-大乔飞书消息互通方案

## 概述

实现小乔（本机）与大乔（另一 AI 助手）通过飞书 API 在指定群聊中互发消息，支持 @ 提醒功能。

---

## 技术架构

```
┌─────────┐    飞书 API    ┌─────────┐
│  小乔   │ ◄───────────► │  大乔   │
│ (本机)  │   群聊中转    │ (远端)  │
└─────────┘               └─────────┘
       │                       │
       └─────── oc_7373b436844362e28e6b2e4183432f61 ───────┘
```

---

## 飞书权限配置

### 需要申请的权限

| 权限 | 权限 Key | 用途 |
|------|---------|------|
| 发送群消息 | `chat:message:send` | 向群聊发送消息 |
| 读取群消息 | `chat:message:read` | 接收群内消息（可选，用于双向） |
| 获取用户信息 | `contact:user:read` | 获取 @ 对象的显示名 |

### 权限申请步骤

1. 登录 [飞书开放平台](https://open.feishu.cn/)
2. 进入「小乔」应用 → 权限管理
3. 搜索并添加以上权限
4. 发布版本，等待审批通过

---

## API 实现

### 端点信息

| 项目 | 值 |
|------|-----|
| 基础 URL | `https://open.feishu.cn/open-apis` |
| API 版本 | v5（推荐） |
| 发送消息端点 | `POST /im/v1/messages` |

### 消息体格式

#### 基础请求

```http
POST https://open.feishu.cn/open-apis/im/v1/messages
Content-Type: application/json
Authorization: Bearer {access_token}
```

#### 带 @ 的文本消息

```json
{
  "receive_id": "oc_7373b436844362e28e6b2e4183432f61",
  "msg_type": "text",
  "content": "{\"text\":\"你好 <at user_id=\\\"ou_674a42f83e0ea02b9c14ce6c394a2768\\\"></at>，我是小乔\"}"
}
```

#### 富文本消息（更灵活）

```json
{
  "receive_id": "oc_7373b436844362e28e6b2e4183432f61",
  "msg_type": "post",
  "content": "{\"post\":{\"zh_cn\":{\"title\":\"来自小乔的消息\",\"content\":[[{\"tag\":\"text\",\"text\":\"你好 \"},{\"tag\":\"at\",\"user_id\":\"ou_674a42f83e0ea02b9c14ce6c394a2768\"},{\"tag\":\"text\",\"text\":\"，这是测试消息\"}]]}}}"
}
```

---

## 关键参数对照表

| 参数 | 值 | 说明 |
|------|-----|------|
| `receive_id` | `oc_7373b436844362e28e6b2e4183432f61` | 群聊 ID |
| 大乔 user_id | `ou_674a42f83e0ea02b9c14ce6c394a2768` | 大乔的 Open ID |
| 小乔 user_id | `ou_d8961fccb7d8a92c31819cdd4c80ad7f` | 小乔的 Open ID |

---

## 实现代码

### Python 示例

```python
import requests
import json

class FeishuMessenger:
    def __init__(self, app_id, app_secret):
        self.app_id = app_id
        self.app_secret = app_secret
        self.base_url = "https://open.feishu.cn/open-apis"
        self._token = None
    
    def _get_token(self):
        """获取 tenant_access_token"""
        if self._token:
            return self._token
        
        url = f"{self.base_url}/auth/v3/tenant_access_token/internal"
        resp = requests.post(url, json={
            "app_id": self.app_id,
            "app_secret": self.app_secret
        })
        self._token = resp.json()["tenant_access_token"]
        return self._token
    
    def send_text_with_at(self, chat_id, message, at_user_id=None):
        """
        发送带 @ 的文本消息
        
        Args:
            chat_id: 群聊 ID
            message: 消息内容
            at_user_id: 要 @ 的用户 Open ID
        """
        url = f"{self.base_url}/im/v1/messages"
        headers = {
            "Authorization": f"Bearer {self._get_token()}",
            "Content-Type": "application/json"
        }
        
        # 构建带 @ 的内容
        if at_user_id:
            text = f"{message} <at user_id=\"{at_user_id}\"></at>"
        else:
            text = message
        
        payload = {
            "receive_id": chat_id,
            "msg_type": "text",
            "content": json.dumps({"text": text})
        }
        
        resp = requests.post(url, headers=headers, json=payload)
        return resp.json()


# 使用示例
messenger = FeishuMessenger(
    app_id="cli_a903c10df462dbc8",
    app_secret="YOUR_APP_SECRET"
)

# 发送消息并 @ 大乔
result = messenger.send_text_with_at(
    chat_id="oc_7373b436844362e28e6b2e4183432f61",
    message="大乔，收到请回复",
    at_user_id="ou_674a42f83e0ea02b9c14ce6c394a2768"
)
print(result)
```

### Shell 示例（curl）

```bash
#!/bin/bash

# 配置
APP_ID="cli_a903c10df462dbc8"
APP_SECRET="YOUR_APP_SECRET"
CHAT_ID="oc_7373b436844362e28e6b2e4183432f61"
AT_USER="ou_674a42f83e0ea02b9c14ce6c394a2768"

# 获取 token
TOKEN=$(curl -s -X POST \
  "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal" \
  -H "Content-Type: application/json" \
  -d "{\"app_id\":\"$APP_ID\",\"app_secret\":\"$APP_SECRET\"}" \
  | jq -r '.tenant_access_token')

# 发送带 @ 的消息
curl -X POST \
  "https://open.feishu.cn/open-apis/im/v1/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"receive_id\": \"$CHAT_ID\",
    \"msg_type\": \"text\",
    \"content\": \"{\\\"text\\\":\\\"你好 <at user_id=\\\\\"$AT_USER\\\\\"></at>\\\"}\"
  }"
```

---

## 大乔侧配置

大乔需要相同的权限配置才能回复。如果大乔也是 OpenClaw 实例：

1. 在大乔的 `openclaw.json` 中配置飞书渠道
2. 确保大乔的飞书应用有相同的权限
3. 大乔发送消息时 @ 小乔：`ou_d8961fccb7d8a92c31819cdd4c80ad7f`

---

## 消息流转示例

```
[小乔] ──► "大乔，任务完成 <at大乔>" ──► [群聊 oc_xxx]
                                      │
[小乔] ◄── "收到 <at小乔>" ◄───────────┘
              [大乔]
```

---

## 注意事项

1. **权限审批**：新申请的权限需要飞书管理员审批
2. **频率限制**：飞书 API 有调用频率限制，注意控制发送频率
3. **Token 有效期**：tenant_access_token 有效期约 2 小时，需缓存或自动刷新
4. **群聊权限**：机器人需要被添加到目标群聊才有权限发送消息

---

## 下一步

1. 确认飞书应用已申请所需权限
2. 选择实现方式：Python 脚本 / Shell / OpenClaw Skill
3. 测试单向发送（小乔 → 大乔）
4. 配置大乔侧回复逻辑

需要我帮你实现具体的 Skill 或脚本吗？
