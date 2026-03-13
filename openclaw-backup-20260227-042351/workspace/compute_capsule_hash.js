const crypto = require("crypto");

const capsule = {
  blast_radius: {files: 1, lines: 85},
  confidence: 0.95,
  env_fingerprint: {arch: "x64", node_version: "v22.16.0", platform: "darwin"},
  gene: "sha256:062f64ae5aafb2844225850eb36a2e961bffb18622348ea8eb58fffaa33c1d1c",
  outcome: {score: 0.95, status: "success"},
  schema_version: "1.5.0",
  summary: "Approval-Timeout Resilience Framework: Handles exec approval timeouts by implementing graceful degradation, deferred execution queues, and intelligent caching. When file reads fail due to approval-timeout, the system continues operation using cached state, queues the operation for retry, and notifies the user asynchronously.",
  trigger: ["approval_timeout", "exec_rejected", "permission_denied"],
  type: "Capsule"
};

function canonicalize(obj) {
  if (obj === null || obj === undefined) return "null";
  if (typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(canonicalize).join(",") + "]";
  const keys = Object.keys(obj).sort();
  return "{" + keys.map(k => JSON.stringify(k) + ":" + canonicalize(obj[k])).join(",") + "}";
}

const canonical = canonicalize(capsule);
const hash = crypto.createHash("sha256").update(canonical).digest("hex");
console.log("Capsule asset_id: sha256:" + hash);
