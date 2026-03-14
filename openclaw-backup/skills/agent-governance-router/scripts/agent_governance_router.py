#!/usr/bin/env python3
import argparse
import json
from datetime import datetime


def out(data, code=0):
    print(json.dumps(data, ensure_ascii=False, indent=2))
    return code


def meta(fallback=False):
    return {"meta": {"router": "agent-governance-router", "version": "1.1", "fallback": fallback}}


def route(goal):
    text = (goal or "").lower()
    if any(k in text for k in ["状态", "status", "汇报"]):
        next_task = "status-format"
    elif any(k in text for k in ["复盘", "retro", "改进", "learning"]):
        next_task = "retro-plan"
    else:
        next_task = "proactive-policy"
    return {"task": "route", "ok": True, "data": {"goal": goal, "next_task": next_task}, **meta()}


def status_format(status, step, message):
    icon = {
        "progress": "[~]",
        "success": "[+]",
        "error": "[!]",
        "warning": "[?]",
    }.get(status, "[~]")
    line = f"{icon} [{step}] {message}".strip()
    if len(line) > 180:
        line = line[:177] + "..."
    return {
        "task": "status-format",
        "ok": True,
        "data": {
            "status": status,
            "formatted": line,
            "timestamp": datetime.now().isoformat(timespec="seconds"),
        },
        **meta(),
    }


def retro_plan(incident):
    template = {
        "incident": incident,
        "what_happened": "",
        "root_cause": "",
        "what_worked": "",
        "what_failed": "",
        "action_items": [
            "",
            "",
        ],
        "promote_to_policies": [
            "AGENTS.md",
            "skill-specific SKILL.md",
            "automation checklists",
        ],
    }
    return {"task": "retro-plan", "ok": True, "data": template, **meta()}


def proactive_policy(context):
    text = (context or "").lower()
    if any(k in text for k in ["生产", "prod", "外部动作", "高风险"]):
        mode = "conservative"
        rules = [
            "No external side-effect without explicit confirmation.",
            "Prefer read-only checks first.",
            "Report before each high-impact step.",
        ]
    elif any(k in text for k in ["探索", "research", "低风险"]):
        mode = "aggressive"
        rules = [
            "Batch operations allowed after one confirmation.",
            "Auto-run local checks and summarize only failures.",
            "Parallelize non-destructive tasks.",
        ]
    else:
        mode = "balanced"
        rules = [
            "Proceed autonomously on local, reversible actions.",
            "Confirm before external writes or publishing.",
            "Keep periodic progress updates.",
        ]
    return {"task": "proactive-policy", "ok": True, "data": {"mode": mode, "rules": rules}, **meta()}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--task", required=True, choices=["route", "status-format", "retro-plan", "proactive-policy"])
    p.add_argument("--goal")
    p.add_argument("--status", default="progress")
    p.add_argument("--step", default="step")
    p.add_argument("--message", default="")
    p.add_argument("--incident", default="")
    p.add_argument("--context", default="")
    a = p.parse_args()

    try:
        if a.task == "route":
            return out(route(a.goal or ""))
        if a.task == "status-format":
            return out(status_format(a.status, a.step, a.message))
        if a.task == "retro-plan":
            return out(retro_plan(a.incident))
        if a.task == "proactive-policy":
            return out(proactive_policy(a.context))
        return out({"task": a.task, "ok": False, "error": "unsupported", **meta(fallback=True)}, code=1)
    except Exception as e:
        return out({"task": a.task, "ok": False, "error": str(e), **meta(fallback=True)}, code=1)


if __name__ == "__main__":
    raise SystemExit(main())
