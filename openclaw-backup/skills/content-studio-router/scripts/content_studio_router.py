#!/usr/bin/env python3
import argparse
import json
import os
import random
import sys
import time
import urllib.parse
import urllib.request

QIANFAN = "https://qianfan.baidubce.com"


def meta(fallback=False):
    return {"meta": {"router": "content-studio-router", "version": "1.1", "fallback": bool(fallback)}}


def jdump(obj, code=0):
    print(json.dumps(obj, ensure_ascii=False, indent=2))
    return code


def require_baidu_key():
    key = os.getenv("BAIDU_API_KEY", "").strip()
    if not key:
        raise RuntimeError("BAIDU_API_KEY is required for this task")
    return key


def http_json(method, url, data=None, headers=None, timeout=30, retries=2):
    body = None
    h = dict(headers or {})
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        h.setdefault("Content-Type", "application/json")
    last_err = None
    for i in range(retries + 1):
        try:
            req = urllib.request.Request(url, data=body, headers=h, method=method)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
        except Exception as e:
            last_err = e
            if i < retries:
                time.sleep(min(2 ** i, 4))
    raise RuntimeError(f"request failed after retries: {last_err}")


def stream_sse_json(url, headers, payload, timeout=120, retries=1):
    last_err = None
    for i in range(retries + 1):
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST",
            )
            events = []
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                for bline in resp:
                    line = bline.decode("utf-8", errors="ignore").strip()
                    if not line.startswith("data:"):
                        continue
                    chunk = line[5:].strip()
                    if not chunk:
                        continue
                    try:
                        events.append(json.loads(chunk))
                    except Exception:
                        continue
            return events
        except Exception as e:
            last_err = e
            if i < retries:
                time.sleep(min(2 ** i, 4))
    raise RuntimeError(f"sse request failed after retries: {last_err}")


def route_plan(goal):
    text = (goal or "").lower()
    if any(k in text for k in ["ppt", "slide", "课件", "演示"]):
        path = "ppt"
    elif any(k in text for k in ["笔记", "视频", "notes"]):
        path = "notes"
    elif any(k in text for k in ["绘本", "picture", "故事视频"]):
        path = "picture"
    else:
        path = "notes"
    return {
        "task": "route",
        "ok": True,
        "data": {
            "recommended_path": path,
            "has_baidu_key": bool(os.getenv("BAIDU_API_KEY")),
            "free_fallback": [
                "Use research-router for source retrieval and references.",
                "Generate draft outline/text locally with LLM without external media APIs.",
                "For PPT: emit markdown outline first, then render manually in office tools.",
            ],
        },
        "notes": ["No API call made."],
        **meta(False),
    }


def notes_create(video_url):
    key = require_baidu_key()
    data = http_json("POST", f"{QIANFAN}/v2/tools/ai_note/task_create", {"url": video_url}, headers={"Authorization": f"Bearer {key}", "X-Appbuilder-From": "openclaw"})
    if data.get("errno", 0) != 0:
        raise RuntimeError(data.get("show_msg") or data.get("errmsg") or "ai_note create failed")
    return data.get("data", {})


def notes_query(task_id):
    key = require_baidu_key()
    params = urllib.parse.urlencode({"task_id": task_id})
    return http_json("GET", f"{QIANFAN}/v2/tools/ai_note/query?{params}", headers={"Authorization": f"Bearer {key}", "X-Appbuilder-From": "openclaw"})


def notes_poll(task_id, max_attempts=20, interval=3):
    last = {}
    for _ in range(max_attempts):
        last = notes_query(task_id)
        errno = last.get("errno", 0)
        if errno == 10000:
            time.sleep(interval)
            continue
        if errno != 0:
            raise RuntimeError(last.get("show_msg") or last.get("errmsg") or "ai_note failed")
        data = last.get("data", {})
        statuses = [x.get("detail", {}).get("status") for x in data.get("list", [])]
        if statuses and all(s == 10002 for s in statuses):
            return data
        time.sleep(interval)
    return {"timeout": True, "last": last}


def picture_create(method, content):
    key = require_baidu_key()
    if method not in (9, 10):
        raise RuntimeError("method must be 9 or 10")
    data = http_json("POST", f"{QIANFAN}/v2/tools/ai_picture_book/task_create", {"method": method, "input_type": "1", "input_content": content}, headers={"Authorization": f"Bearer {key}", "X-Appbuilder-From": "openclaw"})
    if data.get("errno", 0) != 0 or "code" in data:
        raise RuntimeError(data.get("detail") or data.get("errmsg") or "ai_picture_book create failed")
    return data.get("data", {})


def picture_query(task_id):
    key = require_baidu_key()
    ids = [x.strip() for x in task_id.split(",") if x.strip()]
    data = http_json("POST", f"{QIANFAN}/v2/tools/ai_picture_book/query", {"task_ids": ids}, headers={"Authorization": f"Bearer {key}", "X-Appbuilder-From": "openclaw"})
    if data.get("errno", 0) != 0 or "code" in data:
        raise RuntimeError(data.get("detail") or data.get("errmsg") or "ai_picture_book query failed")
    return data.get("data", [])


def picture_poll(task_id, max_attempts=20, interval=5):
    last = []
    for _ in range(max_attempts):
        last = picture_query(task_id)
        if not last:
            time.sleep(interval)
            continue
        status = last[0].get("status")
        if status == 2:
            return last
        if status in (0, 1, 3):
            time.sleep(interval)
            continue
        return {"failed_status": status, "last": last}
    return {"timeout": True, "last": last}


def ppt_themes(limit=100):
    key = require_baidu_key()
    data = http_json("POST", f"{QIANFAN}/v2/tools/ai_ppt/get_ppt_theme", headers={"Authorization": f"Bearer {key}", "X-Appbuilder-From": "openclaw"})
    if data.get("errno", 0) != 0:
        raise RuntimeError(data.get("errmsg") or "get_ppt_theme failed")
    themes = data.get("data", {}).get("ppt_themes", [])[:limit]
    return [{"style_name_list": t.get("style_name_list", []), "style_id": t.get("style_id"), "tpl_id": t.get("tpl_id")} for t in themes]


def ppt_generate(query, style_id=0, tpl_id=None, web_content=None):
    key = require_baidu_key()
    if tpl_id is None:
        themes = ppt_themes(limit=20)
        if not themes:
            raise RuntimeError("no ppt themes available")
        t = random.choice(themes)
        style_id, tpl_id = int(t["style_id"]), int(t["tpl_id"])

    headers = {
        "Authorization": f"Bearer {key}",
        "X-Appbuilder-From": "openclaw",
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
    }
    outline_events = stream_sse_json(f"{QIANFAN}/v2/tools/ai_ppt/generate_outline", headers=headers, payload={"query": query})
    if not outline_events:
        raise RuntimeError("generate_outline returned no events")
    first = outline_events[0]
    title = first.get("title", "")
    chat_id = int(first.get("chat_id", 0))
    query_id = int(first.get("query_id", 0))
    outline = "".join(e.get("outline", "") for e in outline_events)

    payload = {
        "query_id": query_id,
        "chat_id": chat_id,
        "query": query,
        "outline": outline,
        "title": title,
        "style_id": int(style_id),
        "tpl_id": int(tpl_id),
        "web_content": web_content,
    }
    ppt_events = stream_sse_json(f"{QIANFAN}/v2/tools/ai_ppt/generate_ppt_by_outline", headers=headers, payload=payload)
    final_event = next((e for e in reversed(ppt_events) if e.get("is_end")), ppt_events[-1] if ppt_events else {})
    return {"template": {"style_id": style_id, "tpl_id": tpl_id}, "outline": {"title": title, "chat_id": chat_id, "query_id": query_id}, "final": final_event, "event_count": len(ppt_events)}


def main():
    p = argparse.ArgumentParser(description="Unified content studio router")
    p.add_argument("--task", required=True, choices=["route", "notes-create", "notes-query", "notes-poll", "picture-create", "picture-query", "picture-poll", "ppt-themes", "ppt-generate"])
    p.add_argument("--goal")
    p.add_argument("--video-url")
    p.add_argument("--task-id")
    p.add_argument("--method", type=int)
    p.add_argument("--content")
    p.add_argument("--query")
    p.add_argument("--style-id", type=int, default=0)
    p.add_argument("--tpl-id", type=int)
    p.add_argument("--web-content")
    p.add_argument("--max-attempts", type=int, default=20)
    p.add_argument("--interval", type=int, default=3)
    args = p.parse_args()

    try:
        if args.task != "route" and not os.getenv("BAIDU_API_KEY"):
            goal = args.goal or args.query or args.content or args.video_url or "content generation"
            fallback = route_plan(goal)
            fallback.update({"task": args.task, "ok": False, "error": "BAIDU_API_KEY is required for this task"})
            fallback["notes"] = fallback.get("notes", []) + ["Fallback plan returned because BAIDU_API_KEY is missing."]
            fallback["meta"]["fallback"] = True
            return jdump(fallback)

        if args.task == "route":
            return jdump(route_plan(args.goal or ""))
        if args.task == "notes-create":
            if not args.video_url:
                raise RuntimeError("--video-url is required")
            data = notes_create(args.video_url)
        elif args.task == "notes-query":
            if not args.task_id:
                raise RuntimeError("--task-id is required")
            data = notes_query(args.task_id)
        elif args.task == "notes-poll":
            if not args.task_id:
                raise RuntimeError("--task-id is required")
            data = notes_poll(args.task_id, args.max_attempts, args.interval)
        elif args.task == "picture-create":
            if args.method is None or not args.content:
                raise RuntimeError("--method and --content are required")
            data = picture_create(args.method, args.content)
        elif args.task == "picture-query":
            if not args.task_id:
                raise RuntimeError("--task-id is required")
            data = picture_query(args.task_id)
        elif args.task == "picture-poll":
            if not args.task_id:
                raise RuntimeError("--task-id is required")
            data = picture_poll(args.task_id, args.max_attempts, args.interval)
        elif args.task == "ppt-themes":
            data = ppt_themes()
        else:
            if not args.query:
                raise RuntimeError("--query is required")
            data = ppt_generate(args.query, args.style_id, args.tpl_id, args.web_content)

        return jdump({"task": args.task, "ok": True, "data": data, **meta(False)})
    except Exception as e:
        return jdump({"task": args.task, "ok": False, "error": str(e), **meta(False)}, code=1)


if __name__ == "__main__":
    sys.exit(main())
