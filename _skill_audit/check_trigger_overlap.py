#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path("skills")
START = "<!-- TRIGGER_PHRASES_START -->"
END = "<!-- TRIGGER_PHRASES_END -->"

phrases = {}
errors = []

for md in sorted(ROOT.glob("*/SKILL.md")):
    text = md.read_text(encoding="utf-8", errors="ignore")
    if START not in text or END not in text:
        errors.append(f"Missing trigger block: {md}")
        continue

    block = text.split(START, 1)[1].split(END, 1)[0]
    lines = [ln.strip() for ln in block.splitlines() if ln.strip().startswith("- ")]
    local = []
    for ln in lines:
        m = re.match(r"-\s*`(.+?)`\s*$", ln)
        if not m:
            errors.append(f"Bad trigger format in {md}: {ln}")
            continue
        p = m.group(1).strip().lower()
        local.append(p)
        phrases.setdefault(p, []).append(str(md))

    if len(local) != len(set(local)):
        errors.append(f"Duplicate trigger inside file: {md}")

overlaps = {k: v for k, v in phrases.items() if len(v) > 1}

print("Trigger files checked:", len(list(ROOT.glob("*/SKILL.md"))))
print("Unique trigger phrases:", len(phrases))
print("Overlaps:", len(overlaps))

if errors:
    print("\nFormat errors:")
    for e in errors:
        print("-", e)

if overlaps:
    print("\nOverlapping phrases:")
    for p, owners in sorted(overlaps.items()):
        print(f"- {p}: {owners}")

if errors or overlaps:
    raise SystemExit(1)

print("\nPASS: No overlap and trigger blocks are well-formed.")
