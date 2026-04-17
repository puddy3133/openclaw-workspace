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
MEMORY_BASE = ROOT / "workspace" / "memory"


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


def assess_memory_quality():
    """Assess memory system health: file counts, lifecycle compliance, pattern usage."""
    quality = {
        "lessons_count": 0,
        "patterns_count": 0,
        "projects_count": 0,
        "people_count": 0,
        "day_active_count": 0,
        "day_overdue_count": 0,
        "archive_count": 0,
        "pattern_refs_total": 0,
        "tag_coverage": 0.0,
        "learning_completed": 0,
        "recommendations": [],
    }

    # Count files in each directory
    for subdir, key in [
        ("lessons", "lessons_count"),
        ("patterns", "patterns_count"),
        ("projects", "projects_count"),
        ("people", "people_count"),
    ]:
        d = MEMORY_BASE / subdir
        if d.exists():
            quality[key] = len([f for f in d.iterdir() if f.suffix == ".md" and f.name != "README.md"])

    # Day logs: count active vs overdue
    day_dir = MEMORY_BASE / "day"
    if day_dir.exists():
        now = dt.datetime.now()
        cutoff = now - dt.timedelta(days=45)
        for f in day_dir.iterdir():
            if f.suffix != ".md":
                continue
            parts = f.stem.split("-")
            try:
                fdate = dt.datetime(int(parts[0]), int(parts[1]), int(parts[2]))
                if fdate < cutoff:
                    quality["day_overdue_count"] += 1
                else:
                    quality["day_active_count"] += 1
            except (ValueError, IndexError):
                quality["day_overdue_count"] += 1

    # Archive count
    archive_dir = MEMORY_BASE / "archive" / "day"
    if archive_dir.exists():
        quality["archive_count"] = len([f for f in archive_dir.iterdir() if f.suffix == ".md"])

    # Pattern refs (from frontmatter)
    patterns_dir = MEMORY_BASE / "patterns"
    if patterns_dir.exists():
        for f in patterns_dir.iterdir():
            if f.suffix == ".md" and f.name != "README.md":
                content = f.read_text(encoding="utf-8", errors="ignore")
                for line in content.splitlines():
                    if line.strip().startswith("refs:"):
                        try:
                            quality["pattern_refs_total"] += int(line.split(":")[1].strip())
                        except (ValueError, IndexError):
                            pass

    # Tag coverage from .learning/tag-index.json
    tag_index = MEMORY_BASE / ".learning" / "tag-index.json"
    if tag_index.exists():
        try:
            ti = json.loads(tag_index.read_text(encoding="utf-8"))
            quality["tag_coverage"] = ti.get("tag_stats", {}).get("coverage", 0.0)
        except Exception:
            pass

    # Learning completed count
    completion_log = MEMORY_BASE / "learning-queue" / "completed" / "completion-log.json"
    if completion_log.exists():
        try:
            cl = json.loads(completion_log.read_text(encoding="utf-8"))
            quality["learning_completed"] = cl.get("stats", {}).get("totalCompleted", 0)
        except Exception:
            pass

    # Generate memory-specific recommendations
    if quality["day_overdue_count"] > 5:
        quality["recommendations"].append(
            f"day/ 目录有 {quality['day_overdue_count']} 个过期日志未归档，建议运行 memory-lifecycle 任务。"
        )
    if quality["patterns_count"] < 5:
        quality["recommendations"].append(
            f"patterns/ 仅有 {quality['patterns_count']} 个推理模式，学习闭环积累不足，建议关注非平凡任务后的 pattern 提取。"
        )
    if quality["tag_coverage"] < 0.70:
        quality["recommendations"].append(
            f"标签覆盖率 {quality['tag_coverage']:.0%}，低于 70% 目标，建议运行 auto-tagger 任务。"
        )
    if quality["pattern_refs_total"] == 0 and quality["patterns_count"] > 0:
        quality["recommendations"].append(
            "所有 pattern 引用次数为 0，说明推理模式尚未被实际复用。"
        )

    return quality


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

    # Memory quality assessment
    mem_quality = assess_memory_quality()
    recommendations.extend(mem_quality.get("recommendations", []))

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
        "memory_quality": {
            "lessons": mem_quality["lessons_count"],
            "patterns": mem_quality["patterns_count"],
            "projects": mem_quality["projects_count"],
            "people": mem_quality["people_count"],
            "day_active": mem_quality["day_active_count"],
            "day_overdue": mem_quality["day_overdue_count"],
            "archived": mem_quality["archive_count"],
            "pattern_refs": mem_quality["pattern_refs_total"],
            "tag_coverage": mem_quality["tag_coverage"],
            "learning_completed": mem_quality["learning_completed"],
        },
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

    lines.append("## Memory Quality")
    mq = summary.get("memory_quality", {})
    lines.append(f"- lessons: **{mq.get('lessons', 0)}** | patterns: **{mq.get('patterns', 0)}** | projects: **{mq.get('projects', 0)}**")
    lines.append(f"- day/ active: **{mq.get('day_active', 0)}** | overdue: **{mq.get('day_overdue', 0)}** | archived: **{mq.get('archived', 0)}**")
    lines.append(f"- pattern refs: **{mq.get('pattern_refs', 0)}** | tag coverage: **{mq.get('tag_coverage', 0):.0%}**")
    lines.append(f"- learning completed: **{mq.get('learning_completed', 0)}**")
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
