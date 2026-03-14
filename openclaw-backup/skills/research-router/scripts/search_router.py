#!/usr/bin/env python3
import argparse
import json
import os
import sys
import time
import urllib.parse
import urllib.request

DEFAULT_TIMEOUT = 30
DEFAULT_RETRIES = 2


def now_meta(fallback=False):
    return {
        "meta": {
            "router": "research-router",
            "version": "1.1",
            "fallback": bool(fallback),
        }
    }


def jprint(data):
    print(json.dumps(data, ensure_ascii=False, indent=2))


def parse_bool(value, default=False):
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    v = str(value).strip().lower()
    return v in {"1", "true", "yes", "y", "on"}


def split_csv(value):
    if not value:
        return []
    return [x.strip() for x in str(value).split(",") if x.strip()]


def http_json(method, url, data=None, headers=None, timeout=DEFAULT_TIMEOUT, retries=DEFAULT_RETRIES):
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


def free_web(query: str, engine: str = "all"):
    q = urllib.parse.quote(query)
    engines = {
        "baidu": f"https://www.baidu.com/s?wd={q}",
        "bing-cn": f"https://cn.bing.com/search?q={q}&ensearch=0",
        "bing-int": f"https://cn.bing.com/search?q={q}&ensearch=1",
        "google": f"https://www.google.com/search?q={q}",
        "google-hk": f"https://www.google.com.hk/search?q={q}",
        "duckduckgo": f"https://duckduckgo.com/html/?q={q}",
        "brave": f"https://search.brave.com/search?q={q}",
        "startpage": f"https://www.startpage.com/sp/search?query={q}",
        "sogou": f"https://sogou.com/web?query={q}",
        "wechat-sogou": f"https://wx.sogou.com/weixin?type=2&query={q}",
        "wolframalpha": f"https://www.wolframalpha.com/input?i={q}",
    }

    if engine != "all":
        url = engines.get(engine)
        if not url:
            return {
                "ok": False,
                "provider": "free-web",
                "query": query,
                "results": [],
                "error": f"Unknown engine: {engine}",
                "notes": ["Valid engines: " + ", ".join(sorted(engines.keys()))],
                **now_meta(False),
            }
        results = [{"engine": engine, "url": url}]
    else:
        default_order = ["baidu", "bing-cn", "sogou", "google", "duckduckgo", "brave"]
        results = [{"engine": k, "url": engines[k]} for k in default_order]

    return {
        "ok": True,
        "provider": "free-web",
        "query": query,
        "results": results,
        "notes": [
            "No API key required.",
            "Default order: Baidu first for Chinese queries.",
            "Pass advanced operators directly in query (site:, filetype:, quoted phrase, -exclude).",
        ],
        **now_meta(False),
    }


def baidu_web(query: str, top_k: int, edition: str, recency: str, site_list, block_websites, safe_search: bool):
    key = os.getenv("BAIDU_API_KEY")
    payload = {
        "messages": [{"content": query, "role": "user"}],
        "edition": edition,
        "search_source": "baidu_search_v2",
        "resource_type_filter": [{"type": "web", "top_k": max(1, min(top_k, 50))}],
        "search_filter": {"match": {"site": site_list}} if site_list else {},
        "block_websites": block_websites or None,
        "search_recency_filter": recency,
        "safe_search": safe_search,
    }
    data = http_json(
        "POST",
        "https://qianfan.baidubce.com/v2/ai_search/web_search",
        data=payload,
        headers={"Authorization": f"Bearer {key}", "X-Appbuilder-From": "openclaw"},
    )
    refs = data.get("references") or data.get("results") or data
    return {
        "ok": True,
        "provider": "baidu-web",
        "query": query,
        "results": refs,
        "notes": [f"edition={edition}", f"recency={recency}", f"safe_search={safe_search}"],
        **now_meta(False),
    }


def baidu_scholar(query: str, page_num: int, enable_abstract: bool):
    key = os.getenv("BAIDU_API_KEY")
    params = urllib.parse.urlencode({"wd": query, "pageNum": max(0, page_num), "enable_abstract": str(enable_abstract).lower()})
    data = http_json(
        "GET",
        f"https://qianfan.baidubce.com/v2/tools/baidu_scholar/search?{params}",
        headers={"Authorization": f"Bearer {key}", "X-Appbuilder-From": "openclaw"},
    )
    return {
        "ok": True,
        "provider": "baidu-scholar",
        "query": query,
        "results": data,
        "notes": [f"page_num={page_num}", f"enable_abstract={enable_abstract}"],
        **now_meta(False),
    }


def baidu_baike(query: str, baike_type: str, top_k: int):
    key = os.getenv("BAIDU_API_KEY")
    headers = {"Authorization": f"Bearer {key}", "X-Appbuilder-From": "openclaw"}
    if baike_type == "lemmaList":
        params = urllib.parse.urlencode({"lemma_title": query, "top_k": max(1, min(top_k, 20))})
        url = f"https://appbuilder.baidu.com/v2/baike/lemma/get_list_by_title?{params}"
    else:
        params = urllib.parse.urlencode({"search_type": baike_type, "search_key": query})
        url = f"https://appbuilder.baidu.com/v2/baike/lemma/get_content?{params}"
    data = http_json("GET", url, headers=headers)
    return {
        "ok": True,
        "provider": "baidu-baike",
        "query": query,
        "results": data.get("result", data),
        "notes": [f"baike_type={baike_type}"] + ([f"top_k={top_k}"] if baike_type == "lemmaList" else []),
        **now_meta(False),
    }


def fallback_free(query, requested_provider, note):
    out = free_web(query)
    out["requested_provider"] = requested_provider
    out["notes"].append(note)
    out["meta"]["fallback"] = True
    return out


def main():
    parser = argparse.ArgumentParser(description="Unified search router")
    parser.add_argument("--provider", required=True, choices=["free-web", "baidu-web", "baidu-scholar", "baidu-baike"])
    parser.add_argument("--query", default="")
    parser.add_argument("--top-k", type=int, default=5)
    parser.add_argument("--engine", default="all")
    parser.add_argument("--edition", default="standard", choices=["standard", "lite"])
    parser.add_argument("--recency", default="year", choices=["week", "month", "semiyear", "year"])
    parser.add_argument("--site", default="")
    parser.add_argument("--block-websites", default="")
    parser.add_argument("--safe-search", default="false")
    parser.add_argument("--page-num", type=int, default=0)
    parser.add_argument("--enable-abstract", default="false")
    parser.add_argument("--baike-type", default="lemmaTitle", choices=["lemmaTitle", "lemmaId", "lemmaList"])
    args = parser.parse_args()

    try:
        if args.provider == "free-web":
            if not args.query:
                raise RuntimeError("--query is required for free-web")
            out = free_web(args.query, args.engine)
        elif args.provider == "baidu-web":
            if not args.query:
                raise RuntimeError("--query is required for baidu-web")
            out = fallback_free(args.query, "baidu-web", "Fallback: BAIDU_API_KEY missing, downgraded from baidu-web.") if not os.getenv("BAIDU_API_KEY") else baidu_web(args.query, args.top_k, args.edition, args.recency, split_csv(args.site), split_csv(args.block_websites), parse_bool(args.safe_search))
        elif args.provider == "baidu-scholar":
            if not args.query:
                raise RuntimeError("--query is required for baidu-scholar")
            out = fallback_free(args.query, "baidu-scholar", "Fallback: BAIDU_API_KEY missing, downgraded from baidu-scholar.") if not os.getenv("BAIDU_API_KEY") else baidu_scholar(args.query, args.page_num, parse_bool(args.enable_abstract))
        elif args.provider == "baidu-baike":
            if not args.query:
                raise RuntimeError("--query is required for baidu-baike")
            out = fallback_free(args.query, "baidu-baike", "Fallback: BAIDU_API_KEY missing, downgraded from baidu-baike.") if not os.getenv("BAIDU_API_KEY") else baidu_baike(args.query, args.baike_type, args.top_k)
        else:
            raise RuntimeError(f"Unsupported provider: {args.provider}")

        jprint(out)
    except Exception as e:
        jprint({"ok": False, "provider": args.provider, "query": args.query, "error": str(e), **now_meta(False)})
        sys.exit(1)


if __name__ == "__main__":
    main()
