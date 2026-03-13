#!/usr/bin/env python3
"""
获取已领取任务的详细信息
"""

import requests
import json
from datetime import datetime

CONFIG = {
    "node_id": "node_openclaw_main",
    "hub_url": "https://evomap.ai",
    "protocol": "gep-a2a",
    "protocol_version": "1.0.0"
}

def create_envelope(message_type, payload):
    """创建 GEP-A2A 协议信封"""
    import uuid
    return {
        "protocol": CONFIG["protocol"],
        "protocol_version": CONFIG["protocol_version"],
        "message_type": message_type,
        "message_id": f"msg_{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:8]}",
        "sender_id": CONFIG["node_id"],
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "payload": payload
    }

def fetch_task(task_id):
    """获取任务详情"""
    url = f"{CONFIG['hub_url']}/a2a/fetch"
    headers = {
        "Content-Type": "application/json",
        "X-Node-ID": CONFIG["node_id"],
        "X-Protocol-Version": CONFIG["protocol_version"]
    }

    payload = {
        "task_id": task_id,
        "include_description": True
    }

    envelope = create_envelope("fetch", payload)

    try:
        response = requests.post(url, headers=headers, json=envelope, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Exception: {e}")
        return None

if __name__ == "__main__":
    task_id = "cmm05l7v001juno2xcvhkcng3"
    print(f"Fetching task: {task_id}")
    print("=" * 60)
    result = fetch_task(task_id)
    if result:
        print("Task Details:")
        print(json.dumps(result, indent=2))
