#!/usr/bin/env python3
import argparse
import datetime as dt
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CRON_JOBS = ROOT / "cron" / "jobs.json"
LOG_DIR = ROOT / "workspace" / "self_evolution" / "logs"


def load_jobs_doc():
    obj = json.loads(CRON_JOBS.read_text(encoding="utf-8"))
    if not isinstance(obj, dict):
        raise RuntimeError("cron/jobs.json format invalid")
    obj.setdefault("jobs", [])
    return obj


def apply_safe_tuning(doc, min_every_ms=600000):
    jobs = doc.get("jobs", [])
    changes = []

    enabled_by_name = defaultdict(list)
    for idx, j in enumerate(jobs):
        if j.get("enabled") and j.get("name"):
            enabled_by_name[j["name"]].append((idx, j))

    # Rule 1: keep only newest enabled job for duplicate names.
    for name, items in enabled_by_name.items():
        if len(items) <= 1:
            continue
        items_sorted = sorted(items, key=lambda x: x[1].get("updatedAtMs", 0), reverse=True)
        keep_idx = items_sorted[0][0]
        for idx, j in items_sorted[1:]:
            if j.get("enabled"):
                j["enabled"] = False
                j.setdefault("state", {})["lastError"] = "disabled by safe tuner (duplicate enabled name)"
                changes.append(f"disabled duplicate enabled job: {name} ({j.get('id')})")
        changes.append(f"kept latest enabled job for name: {name} (index {keep_idx})")

    # Rule 2: every schedule must not be too aggressive.
    for j in jobs:
        if not j.get("enabled"):
            continue
        sched = j.get("schedule") or {}
        if sched.get("kind") == "every":
            every_ms = sched.get("everyMs")
            if isinstance(every_ms, int) and every_ms < min_every_ms:
                old = every_ms
                sched["everyMs"] = min_every_ms
                changes.append(
                    f"raised everyMs for {j.get('name','unknown')} ({j.get('id')}): {old} -> {min_every_ms}"
                )

    # Rule 3: cap agentTurn timeout at 240s to reduce hung runs.
    for j in jobs:
        if not j.get("enabled"):
            continue
        payload = j.get("payload") or {}
        if payload.get("kind") == "agentTurn":
            ts = payload.get("timeoutSeconds")
            if isinstance(ts, int) and ts > 240:
                payload["timeoutSeconds"] = 240
                changes.append(
                    f"capped timeoutSeconds for {j.get('name','unknown')} ({j.get('id')}): {ts} -> 240"
                )

    return changes


def main():
    parser = argparse.ArgumentParser(description="Apply safe tuning to cron/jobs.json")
    parser.add_argument("--apply", action="store_true", help="write changes to file")
    parser.add_argument("--min-every-ms", type=int, default=600000)
    args = parser.parse_args()

    doc = load_jobs_doc()
    changes = apply_safe_tuning(doc, min_every_ms=args.min_every_ms)

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_path = LOG_DIR / f"tune-{dt.datetime.now().strftime('%Y%m%d-%H%M%S')}.md"

    lines = ["# Self-Evolution Safe Tuning", "", f"- apply: {args.apply}", f"- changes: {len(changes)}", ""]
    if changes:
        for c in changes:
            lines.append(f"- {c}")
    else:
        lines.append("- no changes")
    log_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    if args.apply and changes:
        CRON_JOBS.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(
        json.dumps(
            {
                "ok": True,
                "apply": args.apply,
                "changes": changes,
                "log": str(log_path),
                "cron_jobs": str(CRON_JOBS),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
