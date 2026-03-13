# Incidents Memory

## 2026-03 P0/P1 Incident Summary

### Incident A: Cron Timeout Storm + Gateway Contention

- Level: P0
- Symptom: 定时任务大量 `timeout`，主链路响应明显变慢。
- Impact: 网关稳定性下降，出现任务堆积与会话干扰。
- Root Cause:
  - 历史 cron 任务过多且高频。
  - 多个任务使用主通道或高耗时模型调用。
- Fix Applied:
  - 精简到 3 个高价值任务。
  - 全部改为 `sessionTarget=isolated`。
  - 降频并收紧 timeout。
- Prevention:
  - 新增任务必须评估频率、超时、隔离策略。

### Incident B: Plugin ID Mismatch Noise / Instability

- Level: P1
- Symptom: 日志反复出现 `plugin id mismatch` 警告。
- Impact: 初始化噪声高，定位故障困难，潜在配置读取错位。
- Root Cause:
  - 插件 manifest id 与 openclaw 配置键不一致。
- Fix Applied:
  - 对齐插件 id 与配置键。
  - 插件代码兼容 canonical + legacy key 读取。
- Prevention:
  - 变更插件后必须跑一次键名一致性检查。

### Incident C: Model Auth/Failover Delay

- Level: P1
- Symptom: `401/403 auth` + 长回退链导致响应显著变慢。
- Impact: 主会话首响应延迟增大。
- Root Cause:
  - 全局 timeout 过大。
  - fallback 链过长。
- Fix Applied:
  - timeout 收敛到 180s。
  - fallback 缩短到 1-2 个快速模型。
- Prevention:
  - 每周复盘失败码分布，优先修复认证问题。
