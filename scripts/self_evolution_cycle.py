#!/usr/bin/env python3
import argparse
import datetime as dt
import glob
import json
import os
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CRON_JOBS = ROOT / "cron" / "jobs.json"
CRON_RUNS = ROOT / "cron" / "runs"
OUT_BASE = ROOT / "workspace" / "self_evolution"


def load_jobs():
    if not CRON_JOBS.exists():
        return []
    obj = json.loads(CRON_JOBS.read_text(encoding="utf-8"))
    return obj.get("jobs", []) if isinstance(obj, dict) else []


def parse_ts(ts):
    if ts is None:
        return None
    if isinstance(ts, (int, float)):
        return dt.datetime.fromtimestamp(ts / 1000, tz=dt.timezone.utc)
    return None


def load_recent_runs(hours):
    now = dt.datetime.now(dt.timezone.utc)
    cutoff = now - dt.timedelta(hours=hours)
    records = []
    for fp in glob.glob(str(CRON_RUNS / "*.jsonl")):
        for line in Path(fp).read_text(encoding="utf-8", errors="ignore").splitlines():
            if not line.strip():
                continue
            try:
                item = json.loads(line)
            except Exception:
                continue
            ts = parse_ts(item.get("ts"))
            if ts and ts >= cutoff:
                item["_ts"] = ts.isoformat()
                records.append(item)
    return records


def summarize(jobs, runs, lookback_hours):
    id_to_name = {j.get("id", ""): j.get("name", j.get("id", "unknown")) for j in jobs}

    status_counter = Counter()
    err_counter = Counter()
    per_job = defaultdict(lambda: {"ok": 0, "error": 0, "timeout": 0})

    for r in runs:
        jid = r.get("jobId", "")
        st = r.get("status", "unknown")
        status_counter[st] += 1
        name = id_to_name.get(jid, jid or "unknown")
        if st == "ok":
            per_job[name]["ok"] += 1
        elif st == "error":
            per_job[name]["error"] += 1
            err = (r.get("error") or "").lower()
            if "timed out" in err:
                per_job[name]["timeout"] += 1
                err_counter["timeout"] += 1
            if "auth" in err or "api key" in err or "401" in err or "403" in err:
                err_counter["auth"] += 1
            if "node" in err and "pair" in err:
                err_counter["node_pairing"] += 1

    enabled = [j for j in jobs if j.get("enabled")]
    duplicates_enabled = []
    name_count = Counter(j.get("name", "") for j in enabled)
    for n, c in name_count.items():
        if n and c > 1:
            duplicates_enabled.append({"name": n, "count": c})

    recommendations = []
    total_runs = len(runs)
    total_errors = status_counter.get("error", 0)
    if total_runs > 0 and total_errors / total_runs >= 0.35:
        recommendations.append("最近运行错误率偏高，建议先将高错误任务改为更低频率或先禁用，聚焦修复前 1-2 个根因。")
    if err_counter.get("timeout", 0) >= 3:
        recommendations.append("存在持续超时，建议将重任务间隔拉长到 >= 30 分钟，并将 timeoutSeconds 设为 120-180。")
    if err_counter.get("auth", 0) >= 1:
        recommendations.append("检测到鉴权失败，建议检查主模型/备用模型 key 可用性并做降级策略。")
    if err_counter.get("node_pairing", 0) >= 1:
        recommendations.append("检测到 EvoMap 节点配对异常，建议先恢复节点配对再启用 EvoMap 自动任务。")
    if duplicates_enabled:
        recommendations.append("检测到同名任务重复启用，建议只保留一个启用实例，避免重复消耗。")
    if not recommendations:
        recommendations.append("当前运行稳定，建议保持节奏并每周复盘一次策略有效性。")

    return {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "lookback_hours": lookback_hours,
        "jobs_total": len(jobs),
        "jobs_enabled": len(enabled),
        "runs_total": total_runs,
        "runs_ok": status_counter.get("ok", 0),
        "runs_error": total_errors,
        "error_types": dict(err_counter),
        "duplicates_enabled": duplicates_enabled,
        "per_job": dict(sorted(per_job.items(), key=lambda kv: (-(kv[1]["error"]), kv[0]))),
        "recommendations": recommendations,
    }


def write_outputs(summary):
    OUT_BASE.mkdir(parents=True, exist_ok=True)
    (OUT_BASE / "reports").mkdir(parents=True, exist_ok=True)
    (OUT_BASE / "state").mkdir(parents=True, exist_ok=True)

    now_local = dt.datetime.now()
    stamp = now_local.strftime("%Y%m%d-%H%M%S")

    state_path = OUT_BASE / "state" / "latest.json"
    state_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    report_path = OUT_BASE / "reports" / f"{stamp}.md"
    lines = []
    lines.append(f"# Self-Evolution Health Report ({stamp})")
    lines.append("")
    lines.append(f"- lookback_hours: **{summary['lookback_hours']}**")
    lines.append(f"- jobs_total: **{summary['jobs_total']}**")
    lines.append(f"- jobs_enabled: **{summary['jobs_enabled']}**")
    lines.append(f"- runs_total: **{summary['runs_total']}**")
    lines.append(f"- runs_ok: **{summary['runs_ok']}**")
    lines.append(f"- runs_error: **{summary['runs_error']}**")
    lines.append("")

    lines.append("## Top Recommendations")
    for rec in summary["recommendations"]:
        lines.append(f"- {rec}")
    lines.append("")

    lines.append("## Error Types")
    if summary["error_types"]:
        for k, v in summary["error_types"].items():
            lines.append(f"- {k}: {v}")
    else:
        lines.append("- none")
    lines.append("")

    lines.append("## Per Job")
    if summary["per_job"]:
        for name, m in summary["per_job"].items():
            lines.append(f"- {name}: ok={m['ok']} error={m['error']} timeout={m['timeout']}")
    else:
        lines.append("- no runs in window")

    report_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    backlog_path = OUT_BASE / "BACKLOG.md"
    if not backlog_path.exists():
        backlog_path.write_text(
            "# Self-Evolution Backlog\n\n"
            "## Active\n\n"
            "## History\n\n",
            encoding="utf-8",
        )

    backlog_text = backlog_path.read_text(encoding="utf-8", errors="ignore")
    lines = backlog_text.splitlines()
    active_items = [f"- [ ] {x}" for x in summary["recommendations"][:3]]
    if "## Active" not in backlog_text:
        lines += ["", "## Active", ""]
    if "## History" not in backlog_text:
        lines += ["", "## History", ""]

    # Find Active section (allow optional suffix like " (Week of ...)")
    active_idx = -1
    for i, line in enumerate(lines):
        if line.startswith("## Active"):
            active_idx = i
            break
    if active_idx == -1:
        active_idx = len(lines)
    try:
        history_idx = lines.index("## History")
    except ValueError:
        history_idx = len(lines)
        lines += ["", "## History"]

    before = lines[: active_idx + 1]
    after = lines[history_idx:]
    stamp = now_local.strftime("%Y-%m-%d %H:%M:%S")
    history_block = [f"- [{stamp}] runs_total={summary['runs_total']} runs_error={summary['runs_error']}"]
    for rec in summary["recommendations"][:2]:
        history_block.append(f"  - {rec}")
    merged = before + [""] + active_items + [""] + after + [""] + history_block
    backlog_path.write_text("\n".join(merged).strip() + "\n", encoding="utf-8")

    return state_path, report_path, backlog_path


def main():
    parser = argparse.ArgumentParser(description="Generate self-evolution health report from cron jobs/runs")
    parser.add_argument("--lookback-hours", type=int, default=24)
    args = parser.parse_args()

    jobs = load_jobs()
    runs = load_recent_runs(args.lookback_hours)
    summary = summarize(jobs, runs, args.lookback_hours)
    state_path, report_path, backlog_path = write_outputs(summary)

    out = {
        "ok": True,
        "state": str(state_path),
        "report": str(report_path),
        "backlog": str(backlog_path),
        "summary": {
            "runs_total": summary["runs_total"],
            "runs_error": summary["runs_error"],
            "jobs_enabled": summary["jobs_enabled"],
            "recommendations": summary["recommendations"],
        },
    }
    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
