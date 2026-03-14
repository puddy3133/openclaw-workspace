#!/usr/bin/env python3
import argparse
import json


def out(data, code=0):
    print(json.dumps(data, ensure_ascii=False, indent=2))
    return code


def meta(fallback=False):
    return {"meta": {"router": "publish-notify-router", "version": "1.1", "fallback": fallback}}


def route(goal, urgency):
    text = (goal or "").lower()
    if urgency == "high":
        channel = "feishu_phone_call"
    elif any(k in text for k in ["发布", "公众号", "wechat"]):
        channel = "wechat_publish"
    elif any(k in text for k in ["x", "推特", "tweet"]):
        channel = "x_publish"
    else:
        channel = "feishu_message"

    return {
        "task": "route",
        "ok": True,
        "data": {"goal": goal, "urgency": urgency, "recommended_channel": channel},
        **meta(),
    }


def feishu_plan(message, phone_call):
    cmd = f'python3 scripts/feishu_meeting.py notify --message "{message}"'
    if phone_call:
        cmd += " --phone-call"
    return {
        "task": "feishu-plan",
        "ok": True,
        "data": {
            "precheck": [
                "Ensure FEISHU_APP_ID/FEISHU_APP_SECRET/FEISHU_USER_OPEN_ID are set.",
                "Confirm recipient is correct.",
                "Require human confirmation before execution.",
            ],
            "command": cmd,
        },
        **meta(),
    }


def publish_plan(platform, content_file):
    if platform not in {"wechat", "x"}:
        raise RuntimeError("platform must be wechat or x")
    cmd = (
        f'bun scripts/wechat-article.ts --input "{content_file}"'
        if platform == "wechat"
        else f'bun scripts/x-article.ts --input "{content_file}"'
    )
    return {
        "task": "publish-plan",
        "ok": True,
        "data": {
            "platform": platform,
            "precheck": [
                "Content reviewed and approved.",
                "Account/session ready in isolated browser profile.",
                "Require human confirmation before post.",
            ],
            "command": cmd,
        },
        **meta(),
    }


def safety_check(message):
    flags = []
    text = message or ""
    if len(text) > 500:
        flags.append("Message too long for urgent channels.")
    if any(k in text.lower() for k in ["token", "secret", "api key", "密码", "密钥"]):
        flags.append("Potential secret leakage in message content.")
    if not text.strip():
        flags.append("Empty message.")

    return {
        "task": "safety-check",
        "ok": True,
        "data": {
            "message_length": len(text),
            "pass": len(flags) == 0,
            "flags": flags,
        },
        **meta(),
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--task", required=True, choices=["route", "feishu-plan", "publish-plan", "safety-check"])
    p.add_argument("--goal")
    p.add_argument("--urgency", default="medium", choices=["low", "medium", "high"])
    p.add_argument("--message")
    p.add_argument("--phone-call", action="store_true")
    p.add_argument("--platform")
    p.add_argument("--content-file")
    a = p.parse_args()

    try:
        if a.task == "route":
            return out(route(a.goal, a.urgency))
        if a.task == "feishu-plan":
            if not a.message:
                raise RuntimeError("--message is required")
            return out(feishu_plan(a.message, a.phone_call))
        if a.task == "publish-plan":
            if not a.platform or not a.content_file:
                raise RuntimeError("--platform and --content-file are required")
            return out(publish_plan(a.platform, a.content_file))
        if a.task == "safety-check":
            return out(safety_check(a.message or ""))
        return out({"task": a.task, "ok": False, "error": "unsupported task", **meta(fallback=True)}, code=1)
    except Exception as e:
        return out({"task": a.task, "ok": False, "error": str(e), **meta(fallback=True)}, code=1)


if __name__ == "__main__":
    raise SystemExit(main())
