---
name: Memory Lifecycle and Expiration Policy
description: Defines memory creation, active period, decay, expiration, and archival with automatic lifecycle management
type: reference
---

# Memory Lifecycle Management

## Lifecycle Stages

### 1. Creation (Day 0)
- **Trigger**: Memory written via Write tool
- **Fields Added**:
  - `created_at`: ISO 8601 timestamp
  - `last_accessed`: Same as created_at
  - `access_count`: 0
  - `lifecycle_stage`: "active"

### 2. Active Period (Days 0-30)
- **Duration**: 30 days from creation
- **Behavior**: 
  - Full retrieval eligibility
  - Access count incremented on each retrieval
  - `last_accessed` updated on each access
  - Relevance score calculated normally
- **Expiration Field**: `expires_at = created_at + 30 days`

### 3. Decay Period (Days 31-60)
- **Duration**: 30 days after active period
- **Behavior**:
  - Retrieval eligibility reduced by 50%
  - Relevance score multiplied by 0.5
  - `lifecycle_stage`: "decay"
  - Still searchable but deprioritized
- **Condition**: `last_accessed < 30 days ago AND created_at > 60 days ago`

### 4. Expiration (Day 61+)
- **Trigger**: `created_at + 60 days < today`
- **Action**: Move to `memory/archive/` with timestamp suffix
- **Behavior**: No longer retrieved in normal queries
- **Filename**: `{original_name}.{created_date}.archived.md`

### 5. Archival (Permanent)
- **Location**: `memory/archive/`
- **Retention**: Indefinite (searchable via archive queries)
- **Use Case**: Historical reference, pattern analysis, incident review

## Automatic Lifecycle Management

### Cron Job: Memory Lifecycle Processor
- **Schedule**: Daily at 03:00 (Asia/Shanghai)
- **Session**: Isolated (no impact on main openclaw)
- **Timeout**: 60 seconds
- **Actions**:
  1. Scan all files in `memory/*.md`
  2. Check `created_at` and `lifecycle_stage` fields
  3. Move expired files to `memory/archive/`
  4. Update decay-stage files with reduced relevance
  5. Log results to `memory/logs/lifecycle-{date}.log`

### Cron Job: Archive Cleanup
- **Schedule**: Monthly on 1st at 04:00 (Asia/Shanghai)
- **Session**: Isolated
- **Timeout**: 120 seconds
- **Actions**:
  1. Scan `memory/archive/` for files older than 1 year
  2. Create quarterly summary archives
  3. Compress old archives (optional, if storage needed)
  4. Log cleanup results

## Frontmatter Template

```markdown
---
name: {{memory_name}}
description: {{one-line description}}
type: {{user|feedback|project|reference}}
created_at: {{ISO 8601 timestamp}}
expires_at: {{ISO 8601 timestamp, created_at + 30 days}}
last_accessed: {{ISO 8601 timestamp}}
access_count: {{integer, starts at 0}}
lifecycle_stage: {{active|decay|expired}}
---
```

## Backward Compatibility

- Existing memories without lifecycle fields: Auto-populated on first scan
- `created_at` inferred from file modification time if missing
- `expires_at` calculated as `created_at + 30 days`
- No existing memories deleted during migration

## Rollback Procedure

1. Stop lifecycle processor cron job
2. Restore `memory/archive/` from backup (if needed)
3. Remove lifecycle fields from all files (optional)
4. Restart normal operations

## Additional Directory Policies

### `.learning/` JSON Files
| 文件 | 保留策略 |
|------|---------|
| `patterns.json` | 永久保留；pattern 条目 confidence < 0.50 且 frequency < 2 超过 90 天后删除 |
| `tag-index.json` | 永久保留；计数每季度重算 |
| `consolidation-log.json` | completed 条目保留 180 天后归档 |
| `learning-metrics.json` | 每周滚动，历史快照存入 `archive/learning-metrics/` |
| `recommendations.json` | rejected/completed 条目 30 天后清理 |

### `learning-queue/` 条目
- `pending/` → 超过 14 天未处理：自动移入 `archive/`
- `scheduled/` → 超过 7 天未执行：降级回 `pending/`
- `completed/` → 保留 60 天后归档至 `archive/learning-queue/`
- `completion-log.json` → 永久保留

### `daily-context/` 文件
- 保留最近 7 天，超过 7 天自动删除（日志已在 day/ 中持久化）
- 格式：`daily-context-{YYYY-MM-DD}.json`

### `day/` 日志文件
- 活跃：最近 45 天
- 超过 45 天：迁移至 `archive/day/`（Memory Lifecycle Processor 负责）

## Monitoring

- Track daily: files moved to archive, decay-stage count, lifecycle errors
- Alert if: >50% of memories in decay stage (indicates low relevance)
- Alert if: lifecycle processor fails 3+ consecutive runs
