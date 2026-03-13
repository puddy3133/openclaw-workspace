#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

run() {
  local name="$1"
  shift
  echo "== $name"
  local out
  out="$("$@")"
  echo "$out" | rg '"ok"\s*:\s*true' >/dev/null
}

run "research/free-web" \
  python3 skills/research-router/scripts/search_router.py --provider free-web --query "OpenClaw skill merge"

run "research/baidu-fallback" \
  python3 skills/research-router/scripts/search_router.py --provider baidu-web --query "OpenClaw"

run "content/route" \
  python3 skills/content-studio-router/scripts/content_studio_router.py --task route --goal "做一份AI周报PPT"

run "web/route" \
  python3 skills/web-capture-router/scripts/web_capture_router.py --task route --url "https://example.com"

run "web/markdown-plan" \
  python3 skills/web-capture-router/scripts/web_capture_router.py --task markdown-plan --url "https://example.com"

run "skill-ops/scan-local" \
  python3 skills/skill-ops-router/scripts/skill_ops_router.py --task scan-local --skills-dir skills

run "skill-ops/dedupe" \
  python3 skills/skill-ops-router/scripts/skill_ops_router.py --task dedupe-report --skills-dir skills

run "publish/safety" \
  python3 skills/publish-notify-router/scripts/publish_notify_router.py --task safety-check --message "发布公告，不包含任何密钥"

run "governance/status" \
  python3 skills/agent-governance-router/scripts/agent_governance_router.py --task status-format --status progress --step merge --message "routers smoke ok"

echo "All router smoke checks passed."
