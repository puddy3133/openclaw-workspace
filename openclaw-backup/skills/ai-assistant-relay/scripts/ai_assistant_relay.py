#!/usr/bin/env python3
"""
AI Assistant Relay - Send messages between AI assistants via Feishu
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.parse
from pathlib import Path

# 常量
FEISHU_TOKEN_URL = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
FEISHU_SEND_URL = "https://open.feishu.cn/open-apis/im/v1/messages"
DEFAULT_TIMEOUT = 30

def now_meta():
    return {
        "meta": {
            "skill": "ai-assistant-relay",
            "version": "1.0.0"
        }
    }

def jprint(data):
    print(json.dumps(data, ensure_ascii=False, indent=2))

def load_config():
    """加载配置文件"""
    config_path = Path.home() / ".openclaw" / "config" / "ai-assistant-relay.json"
    
    if not config_path.exists():
        return None
    
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        # 检查必要字段
        if not config.get('enabled', True):
            raise ValueError("Skill disabled in config")
        
        if not config.get('chat_id'):
            raise ValueError("Missing chat_id in config")
        
        return config
    except Exception as e:
        raise ValueError(f"Failed to load config: {e}")

def get_feishu_token(app_id, app_secret):
    """获取 tenant_access_token"""
    data = json.dumps({
        "app_id": app_id,
        "app_secret": app_secret
    }).encode('utf-8')
    
    req = urllib.request.Request(
        FEISHU_TOKEN_URL,
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=DEFAULT_TIMEOUT) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            if result.get('code') == 0:
                return result.get('tenant_access_token')
            else:
                raise Exception(result.get('msg', 'Unknown error'))
    except Exception as e:
        raise Exception(f"Failed to get Feishu token: {e}")

def send_feishu_message(token, chat_id, text, at_user_id=None):
    """发送消息到飞书群聊"""
    if at_user_id:
        # 添加 @ 标记
        content_text = f"{text} <at user_id=\"{at_user_id}\"></at>"
    else:
        content_text = text
    
    payload = {
        "receive_id": chat_id,
        "msg_type": "text",
        "content": json.dumps({"text": content_text})
    }
    
    # receive_id_type 需要作为 URL 参数
    url = f"{FEISHU_SEND_URL}?receive_id_type=chat_id"
    
    data = json.dumps(payload).encode('utf-8')
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    req = urllib.request.Request(url, data=data, headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=DEFAULT_TIMEOUT) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            return result
    except Exception as e:
        raise Exception(f"Failed to send message: {e}")

def cmd_send(args, config):
    """发送消息命令"""
    chat_id = args.chat or config.get('chat_id')
    assistants = config.get('assistants', {})
    
    # 确定目标助手
    target_asst = None
    at_user_id = None
    
    if args.to:
        if args.to not in assistants:
            print(json.dumps({
                "ok": False,
                "error": f"Assistant '{args.to}' not found in config. Available: {', '.join(assistants.keys())}",
                "meta": now_meta()
            }))
            sys.exit(1)
        target_asst = assistants[args.to]
        at_user_id = target_asst['open_id']
    
    # 获取 Feishu token
    # 优先使用 --app-id 和 --app-secret，否则使用 config 中的
    app_id = args.app_id or config.get('app_id')
    app_secret = args.app_secret or config.get('app_secret')
    
    if not app_id or not app_secret:
        print(json.dumps({
            "ok": False,
            "error": "Missing Feishu credentials. Provide --app-id and --app-secret or set them in config.",
            "meta": now_meta()
        }))
        sys.exit(1)
    
    try:
        token = get_feishu_token(app_id, app_secret)
    except Exception as e:
        print(json.dumps({
            "ok": False,
            "error": str(e),
            "meta": now_meta()
        }))
        sys.exit(1)
    
    # 发送消息
    try:
        result = send_feishu_message(token, chat_id, args.msg, at_user_id)
        
        if result.get('code') == 0:
            print(json.dumps({
                "ok": True,
                "message": f"发送给 {target_asst['name'] if target_asst else '群聊'} 成功",
                "data": result.get('data'),
                "meta": now_meta()
            }))
        else:
            print(json.dumps({
                "ok": False,
                "error": result.get('msg', 'Unknown error'),
                "meta": now_meta()
            }))
            sys.exit(1)
    except Exception as e:
        print(json.dumps({
            "ok": False,
            "error": str(e),
            "meta": now_meta()
        }))
        sys.exit(1)

def cmd_list(args, config):
    """列出已配置的助手"""
    assistants = config.get('assistants', {})
    
    result = {
        "ok": True,
        "assistants": assistants,
        "default_chat": config.get('chat_id'),
        "meta": now_meta()
    }
    jprint(result)

def main():
    parser = argparse.ArgumentParser(description='AI Assistant Relay - Feishu message sender')
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # send 命令
    send_parser = subparsers.add_parser('send', help='Send message')
    send_parser.add_argument('--to', help='Target assistant key (e.g., daqiao)')
    send_parser.add_argument('--msg', required=True, help='Message text')
    send_parser.add_argument('--chat', help='Override chat ID')
    send_parser.add_argument('--app-id', help='Feishu App ID (overrides config)')
    send_parser.add_argument('--app-secret', help='Feishu App Secret (overrides config)')
    
    # list 命令
    list_parser = subparsers.add_parser('list', help='List configured assistants')
    
    args = parser.parse_args()
    
    # 加载配置
    try:
        config = load_config()
        if config is None:
            print(json.dumps({
                "ok": False,
                "error": "Config not found. Run: cp config/ai-assistant-relay.json.template ~/.openclaw/config/ai-assistant-relay.json",
                "meta": now_meta()
            }))
            sys.exit(1)
    except Exception as e:
        print(json.dumps({
            "ok": False,
            "error": str(e),
            "meta": now_meta()
        }))
        sys.exit(1)
    
    # 执行命令
    if args.command == 'send':
        cmd_send(args, config)
    elif args.command == 'list':
        cmd_list(args, config)
    else:
        parser.print_help()
        sys.exit(1)

if __name__ == '__main__':
    main()
