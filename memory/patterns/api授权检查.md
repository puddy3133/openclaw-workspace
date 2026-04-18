---
task-type: API授权检查
context: 第三方平台文档操作
created: 2026-04-17
updated: 2026-04-17
version: 1
tags: [api授权检查]
refs: 0
---

## 场景
第三方平台文档操作

## 方法
任务开始前验证token，失效时立即走重新授权流程

## 效果
由 daily_reflection 自动提取。

## 注意事项
需设计用户中断-恢复机制，避免重复劳动

## 更新记录
- v1 (2026-04-17): 初始创建
