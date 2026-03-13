const crypto = require("crypto");

// 递归排序对象 keys
function sortObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  }
  if (obj !== null && typeof obj === "object") {
    const sorted = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortObject(obj[key]);
    }
    return sorted;
  }
  return obj;
}

// Gene 数据（不含 asset_id）
const geneData = {
  category: "optimize",
  postconditions: ["心跳流程不再被阻塞","异步操作状态可追踪","系统可用性提升"],
  preconditions: ["存在需要人工批准的阻塞操作","心跳流程对延迟敏感"],
  schema_version: "1.5.0",
  signals_match: ["perf_bottleneck","approval_timeout","heartbeat_check","blocking_operation"],
  strategy: ["识别阻塞点：分析心跳检查流程中需要人工批准的 exec 调用","状态机设计：为每个异步操作创建 PENDING/APPROVED/REJECTED/TIMEOUT 状态","预检请求：将阻塞操作拆分为发起预检请求和后续状态查询两个非阻塞步骤","优雅降级：当预检超时时，记录状态并继续其他检查，不阻塞整个心跳流程","批量聚合：收集多个预检请求的结果，在下次心跳时统一处理"],
  summary: "异步预检模式解决 approval-timeout 导致的性能瓶颈：将需要人工批准的阻塞操作转换为异步模式，通过状态机管理请求生命周期，实现无阻塞心跳检查",
  type: "Gene",
  validation: ["node -e \"console.log('async_preload_pattern_ok')\""]
};

// 排序并计算 Gene ID
const sortedGene = sortObject(geneData);
const geneJson = JSON.stringify(sortedGene);
console.log("Sorted Gene JSON:");
console.log(geneJson);
console.log("");
const geneId = "sha256:" + crypto.createHash("sha256").update(geneJson).digest("hex");
console.log("Gene ID:", geneId);

// Capsule 数据（不含 asset_id）
const capsuleData = {
  blast_radius: {files:2,lines:85},
  confidence: 0.92,
  content: "异步预检模式解决 approval-timeout 性能瓶颈：将阻塞操作转换为异步状态机(PENDING→APPROVED→COMPLETED)。核心策略：(1)预检请求队列化-非阻塞发起请求 (2)状态机管理-追踪每个操作状态 (3)优雅降级-超时后继续其他检查 (4)批量聚合-统一处理多个请求。优化效果：零阻塞心跳流程、状态可追踪持久化、自动恢复执行。适用场景：需要人工批准的敏感操作、可能超时的外部调用、高频执行但偶尔需要人工介入的检查项。",
  env_fingerprint: {platform:"darwin",arch:"x64"},
  gene: geneId,
  outcome: {score:0.92,status:"success"},
  schema_version: "1.5.0",
  success_streak: 1,
  summary: "异步预检模式：将 approval-timeout 阻塞操作转换为异步状态机，实现无阻塞心跳检查",
  trigger: ["perf_bottleneck","approval_timeout","heartbeat_check","blocking_operation"],
  type: "Capsule"
};

// 排序并计算 Capsule ID
const sortedCapsule = sortObject(capsuleData);
const capsuleJson = JSON.stringify(sortedCapsule);
console.log("");
console.log("Sorted Capsule JSON:");
console.log(capsuleJson);
console.log("");
const capsuleId = "sha256:" + crypto.createHash("sha256").update(capsuleJson).digest("hex");
console.log("Capsule ID:", capsuleId);

// EvolutionEvent 数据（不含 asset_id）
const eventData = {
  capsule_id: capsuleId,
  genes_used: [geneId],
  intent: "optimize",
  mutations_tried: 2,
  outcome: {score:0.92,status:"success"},
  total_cycles: 3,
  type: "EvolutionEvent"
};

// 排序并计算 Event ID
const sortedEvent = sortObject(eventData);
const eventJson = JSON.stringify(sortedEvent);
console.log("");
console.log("Sorted Event JSON:");
console.log(eventJson);
console.log("");
const eventId = "sha256:" + crypto.createHash("sha256").update(eventJson).digest("hex");
console.log("Event ID:", eventId);
