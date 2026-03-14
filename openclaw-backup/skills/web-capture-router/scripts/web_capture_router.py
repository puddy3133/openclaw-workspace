#!/usr/bin/env python3
import argparse
import json
import re
import urllib.request
from html import unescape
from urllib.parse import urlparse


def out(data, code=0):
    print(json.dumps(data, ensure_ascii=False, indent=2))
    return code


def meta():
    return {"meta": {"router": "web-capture-router", "version": "1.1"}}


def classify_url(url):
    host = (urlparse(url).netloc or "").lower()
    dynamic_hints = ["x.com", "twitter.com", "reddit.com", "youtube.com", "mp.weixin.qq.com"]
    if any(h in host for h in dynamic_hints):
        return "dynamic"
    return "static"


def route(url):
    mode = classify_url(url)
    return {
        "task": "route",
        "ok": True,
        "data": {
            "url": url,
            "recommended": "dynamic-command" if mode == "dynamic" else "fetch-static",
            "reason": "Domain likely JS/session heavy" if mode == "dynamic" else "Likely static or server-rendered",
        },
        **meta(),
    }


def strip_html(html):
    html = re.sub(r"(?is)<script.*?>.*?</script>", " ", html)
    html = re.sub(r"(?is)<style.*?>.*?</style>", " ", html)
    text = re.sub(r"(?is)<[^>]+>", " ", html)
    text = unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_links(html, max_links=30):
    links = re.findall(r'(?is)<a[^>]+href=["\']([^"\']+)["\']', html)
    uniq = []
    seen = set()
    for x in links:
        if x not in seen:
            seen.add(x)
            uniq.append(x)
        if len(uniq) >= max(1, max_links):
            break
    return uniq


def fetch_static(url, max_text=4000, max_links=30):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        ctype = resp.headers.get("Content-Type", "")
        raw = resp.read().decode("utf-8", errors="ignore")
    text = strip_html(raw)
    links = extract_links(raw, max_links=max_links)
    return {
        "task": "fetch-static",
        "ok": True,
        "data": {
            "url": url,
            "content_type": ctype,
            "text_preview": text[: max(200, max_text)],
            "links": links,
        },
        **meta(),
    }


def dynamic_command(url):
    cmd = f'node scripts/playwright-stealth.js "{url}"'
    return {
        "task": "dynamic-command",
        "ok": True,
        "data": {
            "url": url,
            "command": cmd,
            "note": "Use only in controlled environment; avoid cookie/session extraction unless explicitly needed.",
        },
        **meta(),
    }


def markdown_plan(url):
    return {
        "task": "markdown-plan",
        "ok": True,
        "data": {
            "url": url,
            "steps": [
                "Attempt fetch-static first and keep text + links.",
                "If content incomplete, run dynamic-command capture.",
                "Normalize output to markdown sections: title/summary/key points/links.",
                "Do not include private cookies or session artifacts.",
            ],
        },
        **meta(),
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--task", required=True, choices=["route", "fetch-static", "dynamic-command", "markdown-plan"])
    p.add_argument("--url", required=True)
    p.add_argument("--max-text", type=int, default=4000)
    p.add_argument("--max-links", type=int, default=30)
    a = p.parse_args()

    try:
        if a.task == "route":
            return out(route(a.url))
        if a.task == "fetch-static":
            try:
                return out(fetch_static(a.url, a.max_text, a.max_links))
            except Exception as e:
                fallback = dynamic_command(a.url)
                return out(
                    {
                        "task": "fetch-static",
                        "ok": False,
                        "error": str(e),
                        "data": {
                            "fallback_recommended": fallback["data"]["command"],
                            "note": "Static fetch failed; use dynamic capture in isolated environment.",
                        },
                        **meta(),
                    },
                    code=1,
                )
        if a.task == "dynamic-command":
            return out(dynamic_command(a.url))
        return out(markdown_plan(a.url))
    except Exception as e:
        return out({"task": a.task, "ok": False, "error": str(e), **meta()}, code=1)


if __name__ == "__main__":
    raise SystemExit(main())
