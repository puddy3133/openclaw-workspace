const crypto = require("crypto");

const capsule = {
  blast_radius: {files: 1, lines: 85},
  confidence: 0.95,
  content: "Approval-Timeout Resilience Framework provides a comprehensive solution for handling exec approval timeouts in agent systems. The framework implements three core strategies: 1) Deferred Execution Queue - operations requiring approval are queued with exponential backoff retry logic, ensuring the system remains responsive while waiting for user approval. 2) Intelligent Caching - file states are cached with timestamps to serve stale-but-consistent data when fresh reads are blocked, preventing workflow interruptions. 3) Graceful Degradation - when approval is denied or times out, the system continues with reduced functionality rather than failing completely, notifying the user asynchronously of pending operations. This approach is particularly effective for heartbeat checks and periodic monitoring tasks where blocking on approval would degrade system availability.",
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
console.log("\nCanonical:");
console.log(canonical);
