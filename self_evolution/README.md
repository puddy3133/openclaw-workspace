# OpenClaw Self-Evolution

本目录用于让 OpenClaw 持续进行“评估 -> 调优 -> 复盘”的自我进化闭环。

## 当前闭环

1. 健康扫描（每 6 小时）

- 任务名：`自我进化-健康扫描`
- 入口脚本：`workspace/scripts/self_evolution_cycle.py`
- 输出：
  - `workspace/self_evolution/state/latest.json`
  - `workspace/self_evolution/reports/*.md`

2. 安全调优（每 12 小时）

- 任务名：`自我进化-安全调优`
- 入口脚本：`workspace/scripts/self_evolution_tune.py`
- 仅做低风险自动调优：
  - 同名任务重复启用去重
  - 过高频任务降频（`everyMs` 下限）
  - 超长超时参数收敛

3. 每周复盘（周一 09:30，Asia/Shanghai）

- 任务名：`自我进化-每周复盘`
- 汇总周内报告，沉淀改进项到 `WEEKLY.md`/`BACKLOG.md`

## 手动运行

```bash
python3 ~/.openclaw/workspace/scripts/self_evolution_cycle.py --lookback-hours 240
python3 ~/.openclaw/workspace/scripts/self_evolution_tune.py
python3 ~/.openclaw/workspace/scripts/self_evolution_tune.py --apply
```

## 目标

- 减少 cron 任务超时率
- 降低模型鉴权/网络导致的空转
- 让每周都有可追踪的进化改进记录
