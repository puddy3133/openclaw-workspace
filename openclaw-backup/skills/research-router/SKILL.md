---
name: research-router
description: Unified search skill for OpenClaw. Merges free-web, baidu-search, baidu-scholar-search, and baidu-baike. Use baidu-web as default for Chinese queries, fallback to free-web when no API key.
---

# Research Router

统一检索入口。默认使用百度搜索，按需降级到免费检索。

`{baseDir}` = 本 `SKILL.md` 所在目录。

## When To Use
- 所有搜索需求优先使用此 Skill
- 查资料、查最新信息、找论文、查百科定义
- 需要多源交叉验证与可追溯链接
- **系统默认搜索路由**

## Trigger Hints
- `搜索` `查一下` `搜一下` `找资料` `论文` `文献` `百科` `deep research`

## Auto Trigger Phrases (Exclusive)
<!-- TRIGGER_PHRASES_START -->
- `搜索`
- `search`
- `查一下`
- `搜一下`
- `找资料`
- `research route`
- `检索路由`
- `学术检索路由`
- `百科消歧路由`
<!-- TRIGGER_PHRASES_END -->

## Default Configuration
```json
{
  "defaultProvider": "baidu-web",
  "fallbackProvider": "free-web"
}
```

## Decision Tree
1. **默认**：`baidu-web`（中文搜索优先）
2. 没有 BAIDU_API_KEY：`free-web`（多引擎免费搜索）
3. 学术文献：`baidu-scholar`
4. 名词解释/同名消歧：`baidu-baike`

## Execution Template

### 默认搜索（中文优先）
```bash
# 有 BAIDU_API_KEY 时优先使用百度搜索
python3 {baseDir}/scripts/search_router.py --provider baidu-web --query "{query}" --top-k 10

# 无 API key 时自动降级到免费搜索
python3 {baseDir}/scripts/search_router.py --provider free-web --query "{query}" --engine all
```

### 免费多引擎链接
```bash
python3 {baseDir}/scripts/search_router.py --provider free-web --query "{query}" --engine all
```

### 百度网页（支持站点过滤/时效/安全搜索）
```bash
BAIDU_API_KEY=*** python3 {baseDir}/scripts/search_router.py --provider baidu-web --query "{query}" --top-k 10 --edition standard --recency month --site "arxiv.org,github.com" --safe-search true
```

### 百度学术（分页 + 摘要）
```bash
BAIDU_API_KEY=*** python3 {baseDir}/scripts/search_router.py --provider baidu-scholar --query "{query}" --page-num 0 --enable-abstract true
```

### 百度百科（同名消歧）
```bash
BAIDU_API_KEY=*** python3 {baseDir}/scripts/search_router.py --provider baidu-baike --query "{term}" --baike-type lemmaList --top-k 5
BAIDU_API_KEY=*** python3 {baseDir}/scripts/search_router.py --provider baidu-baike --query "{lemma_id_or_title}" --baike-type lemmaId
```

## High-Value Examples
1. `我需要近一周 AI Agent 的重要发布`  
默认用 `baidu-web`，再用 `free-web` 交叉验证。

2. `帮我找 RAG 评测相关论文并给摘要`  
用 `baidu-scholar --enable-abstract true --page-num 0`。

3. `“多模态大模型”到底是什么，给权威解释`  
先 `baidu-baike --baike-type lemmaList` 消歧，再 `lemmaId` 查详情。

## Output Contract
返回 JSON，统一包含：`ok`、`provider`、`query`、`results`、`notes`、`meta(router/version/fallback)`。

## Failure Fallback
- 缺 BAIDU_API_KEY 时自动降级到 `free-web`
- 单一 provider 失败时，切换到另一个 provider 重试一次
- 百度搜索失败时，自动尝试免费搜索

## Security Rules
- 不回显完整 API key
- 不把密钥写入仓库文件
- 禁止远程安装命令

---
*更新时间：2026-03-13 23:20:00 CST*
