#!/usr/bin/env python3
import argparse
import json
import re
from pathlib import Path


RISK_PATTERNS = [
    ("remote_install", r"curl\s+[^\n]*\|\s*(bash|sh)"),
    ("dangerous_exec", r"\b(eval|exec)\s*\("),
    ("shell_spawn", r"(subprocess\.(run|Popen|call)|child_process|execSync|spawn\()"),
    ("network_exfil", r"\b(wget|curl|scp|ssh|nc|netcat)\b"),
    ("secret_ref", r"(API_KEY|TOKEN|SECRET|ACCESS_TOKEN|APP_SECRET)"),
    ("destructive_cmd", r"\brm\s+-rf\b"),
]

CATEGORY_HINTS = {
    "search": ["search", "scholar", "baike", "tavily", "research"],
    "capture": ["playwright", "browser", "scrape", "markdown", "url"],
    "content": ["ppt", "picture", "notes", "image", "comic", "cover"],
    "ops": ["skill", "vetter", "creator", "clawdhub", "find"],
    "governance": ["proactive", "self-improving", "status", "memory"],
    "writing": ["writing", "thought", "weekly", "prd", "planner"],
    "publish": ["wechat", "x", "feishu", "notify", "meeting"],
}


def out(payload, code=0):
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return code


def meta(fallback=False):
    return {"meta": {"router": "skill-ops-router", "version": "1.1", "fallback": fallback}}


def read_text(p: Path):
    try:
        return p.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""


def find_skill_dirs(skills_dir: Path):
    if not skills_dir.exists() or not skills_dir.is_dir():
        return []
    dirs = []
    for sub in sorted(skills_dir.iterdir()):
        if not sub.is_dir():
            continue
        if (sub / "SKILL.md").exists() or (sub / "skill.md").exists():
            dirs.append(sub)
    return dirs


def parse_skill_meta(skill_dir: Path):
    md = skill_dir / "SKILL.md"
    if not md.exists():
        md = skill_dir / "skill.md"
    text = read_text(md)
    name = skill_dir.name
    m = re.search(r"^name:\s*(.+)$", text, flags=re.M)
    if m:
        name = m.group(1).strip().strip('"\'')
    desc = ""
    d = re.search(r"^description:\s*(.+)$", text, flags=re.M)
    if d:
        desc = d.group(1).strip()
    return {"dir": str(skill_dir), "name": name, "description": desc, "file": str(md)}


def classify(name, desc):
    text = f"{name} {desc}".lower()
    scores = {k: 0 for k in CATEGORY_HINTS}
    for cat, hints in CATEGORY_HINTS.items():
        for h in hints:
            if h in text:
                scores[cat] += 1
    top = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    cat, score = top[0]
    return cat if score > 0 else "other"


def route(goal):
    c = classify(goal, "")
    next_task = {
        "ops": "scan-local",
        "search": "dedupe-report",
        "capture": "vet-path",
        "content": "vet-path",
        "publish": "publish-check",
    }.get(c, "scan-local")
    return {
        "task": "route",
        "ok": True,
        "data": {
            "goal": goal,
            "category": c,
            "next_task": next_task,
        },
        **meta(),
    }


def scan_local(skills_dir):
    dirs = find_skill_dirs(Path(skills_dir))
    skills = []
    for d in dirs:
        item = parse_skill_meta(d)
        item["category"] = classify(item["name"], item["description"])
        skills.append(item)
    return {
        "task": "scan-local",
        "ok": True,
        "data": {
            "skills_dir": str(Path(skills_dir).resolve()),
            "count": len(skills),
            "skills": skills,
        },
        **meta(),
    }


def vet_path(target):
    p = Path(target)
    if not p.exists():
        raise RuntimeError(f"target not found: {target}")
    files = [x for x in p.rglob("*") if x.is_file() and x.suffix.lower() in {".md", ".py", ".sh", ".js", ".ts", ".mjs", ".json", ".toml"}]

    findings = []
    for f in files:
        text = read_text(f)
        for tag, pat in RISK_PATTERNS:
            for m in re.finditer(pat, text, flags=re.I):
                findings.append({
                    "risk": tag,
                    "file": str(f),
                    "snippet": text[max(0, m.start()-40):m.end()+40].replace("\n", " ")[:180],
                })
                if len(findings) >= 200:
                    break
            if len(findings) >= 200:
                break

    severity = "low"
    tags = {x["risk"] for x in findings}
    non_md_findings = [x for x in findings if not x["file"].lower().endswith(".md")]
    non_md_tags = {x["risk"] for x in non_md_findings}
    # Treat markdown guidance text (e.g., "never use curl | bash") as non-blocking.
    if "remote_install" in non_md_tags or "destructive_cmd" in non_md_tags:
        severity = "high"
    elif "shell_spawn" in non_md_tags or "dangerous_exec" in non_md_tags:
        severity = "medium"
    elif "remote_install" in tags or "destructive_cmd" in tags:
        severity = "medium"

    return {
        "task": "vet-path",
        "ok": True,
        "data": {
            "target": str(p.resolve()),
            "file_count": len(files),
            "finding_count": len(findings),
            "severity": severity,
            "findings": findings[:80],
        },
        **meta(),
    }


def dedupe_report(skills_dir):
    dirs = find_skill_dirs(Path(skills_dir))
    entries = [parse_skill_meta(d) for d in dirs]
    grouped = {}
    for e in entries:
        cat = classify(e["name"], e["description"])
        grouped.setdefault(cat, []).append(e["name"])

    dupes = {k: v for k, v in grouped.items() if len(v) > 1}
    return {
        "task": "dedupe-report",
        "ok": True,
        "data": {
            "skills_dir": str(Path(skills_dir).resolve()),
            "category_groups": grouped,
            "overlap_groups": dupes,
            "merge_candidates": [{"category": k, "skills": v} for k, v in dupes.items()],
        },
        **meta(),
    }


def install_plan(source, package):
    source = source.lower()
    if source not in {"clawdhub", "skills.sh", "github"}:
        raise RuntimeError("source must be one of: clawdhub, skills.sh, github")

    if source == "clawdhub":
        cmds = [
            "clawdhub search <query>",
            f"clawdhub install {package}" if package else "clawdhub install <owner/skill@version>",
            "clawdhub list",
        ]
    elif source == "skills.sh":
        cmds = [
            "npx skills find <query>",
            f"npx skills add {package}" if package else "npx skills add <registry-path-or-github>",
            "npx skills check",
        ]
    else:
        cmds = [
            f"npx skills add {package}" if package else "npx skills add github.com/<owner>/<repo>/skills/<name>",
            "npx skills check",
        ]

    return {
        "task": "install-plan",
        "ok": True,
        "data": {
            "source": source,
            "package": package,
            "commands": cmds,
            "precheck": [
                "Run skill-ops-router --task vet-path on the downloaded skill directory.",
                "Confirm no secret writes and no remote install pipelines.",
            ],
        },
        **meta(),
    }


def publish_check(target):
    p = Path(target)
    if not p.exists() or not p.is_dir():
        raise RuntimeError(f"target skill dir not found: {target}")

    has_skill = (p / "SKILL.md").exists() or (p / "skill.md").exists()
    has_scripts = (p / "scripts").exists()
    blockers = []
    if not has_skill:
        blockers.append("Missing SKILL.md")

    vet = vet_path(target)["data"]
    if vet["severity"] == "high":
        blockers.append("High-risk findings detected by vet-path")

    checklist = [
        "Metadata name/description are clear and triggerable.",
        "SKILL.md includes security rules and command examples.",
        "No hardcoded secrets or real API tokens.",
        "Scripts are optional and deterministic where possible.",
        "Run smoke test for at least one command path.",
    ]

    return {
        "task": "publish-check",
        "ok": True,
        "data": {
            "target": str(p.resolve()),
            "has_skill_md": has_skill,
            "has_scripts_dir": has_scripts,
            "vet_summary": {
                "severity": vet["severity"],
                "finding_count": vet["finding_count"],
            },
            "blockers": blockers,
            "checklist": checklist,
            "ready": len(blockers) == 0,
        },
        **meta(),
    }


def main():
    parser = argparse.ArgumentParser(description="Skill operations router")
    parser.add_argument("--task", required=True, choices=["route", "scan-local", "vet-path", "dedupe-report", "install-plan", "publish-check"])
    parser.add_argument("--goal")
    parser.add_argument("--skills-dir", default="skills")
    parser.add_argument("--target")
    parser.add_argument("--source")
    parser.add_argument("--package")
    args = parser.parse_args()

    try:
        if args.task == "route":
            if not args.goal:
                raise RuntimeError("--goal is required for route")
            result = route(args.goal)
        elif args.task == "scan-local":
            result = scan_local(args.skills_dir)
        elif args.task == "vet-path":
            if not args.target:
                raise RuntimeError("--target is required for vet-path")
            result = vet_path(args.target)
        elif args.task == "dedupe-report":
            result = dedupe_report(args.skills_dir)
        elif args.task == "install-plan":
            if not args.source:
                raise RuntimeError("--source is required for install-plan")
            result = install_plan(args.source, args.package)
        else:
            if not args.target:
                raise RuntimeError("--target is required for publish-check")
            result = publish_check(args.target)

        return out(result)
    except Exception as e:
        return out({"task": args.task, "ok": False, "error": str(e), **meta(fallback=True)}, code=1)


if __name__ == "__main__":
    raise SystemExit(main())
