# Temu多国家同步系统 - 详细补充文档

> 补充规划细节 | 版本：v1.3

---

## 一、Temu API 详细接口规范

### 1.1 接口认证机制

**签名生成算法**：
```python
def generate_sign(app_key, app_secret, timestamp, params, body):
    """
    Temu API签名算法
    规则：MD5(app_key + timestamp + params_json + body_json + app_secret)
    """
    import json
    import hashlib
    
    params_str = json.dumps(params, sort_keys=True, separators=(',', ':'))
    body_str = json.dumps(body, sort_keys=True, separators=(',', ':'))
    
    sign_str = f"{app_key}{timestamp}{params_str}{body_str}{app_secret}"
    return hashlib.md5(sign_str.encode('utf-8')).hexdigest()
```

**请求头示例**：
```http
POST /openapi/router HTTP/1.1
Host: openapi-b-eu.temu.com
Content-Type: application/json
X-App-Key: f860e759073f9d1e5c8bbeb7baac1dbf
X-Timestamp: 1711881600
X-Sign: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
X-Access-Token: epla5wjmugeksf1w4how6ty4o9dcubbfnksqpl4vivoh78xdjl9tzlui2uo

{
  "method": "temu.product.list",
  "params": {"status": "approved", "page": 1, "page_size": 50},
  "body": {}
}
```

### 1.2 核心接口详情

#### 接口1：获取商品列表

**功能**：查询德国站已核价通过的商品

**请求**：
```json
{
  "method": "temu.product.list",
  "params": {
    "status": "approved",
    "page": 1,
    "page_size": 50,
    "site_id": "DE"
  },
  "body": {}
}
```

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "request_id": "req_123456789",
  "data": {
    "total": 156,
    "page": 1,
    "page_size": 50,
    "list": [
      {
        "product_id": "1234567890123",
        "sku": "SKU-001",
        "title": "Wireless Bluetooth Headphones",
        "main_image": "https://img.temu.com/goods/xxx.jpg",
        "status": "approved",
        "site_id": "DE",
        "price": 49.99,
        "currency": "EUR",
        "stock": 100,
        "category_id": "1234",
        "create_time": "2026-03-01T10:00:00Z",
        "update_time": "2026-03-15T14:30:00Z",
        "sync_status": {
          "FR": "synced",
          "IT": "pending",
          "ES": "not_synced"
        }
      }
    ]
  }
}
```

#### 接口2：批量同步商品到多国

**功能**：将德国站商品同步到其他欧盟国家

**请求**：
```json
{
  "method": "temu.product.sync.batch",
  "params": {},
  "body": {
    "source_site_id": "DE",
    "product_id": "1234567890123",
    "target_sites": [
      {
        "site_id": "FR",
        "price": 54.99,
        "stock": 100,
        "currency": "EUR"
      },
      {
        "site_id": "IT",
        "price": 54.99,
        "stock": 100,
        "currency": "EUR"
      },
      {
        "site_id": "UK",
        "price": 44.99,
        "stock": 100,
        "currency": "GBP"
      },
      {
        "site_id": "CZ",
        "price": 1299.00,
        "stock": 100,
        "currency": "CZK"
      }
    ]
  }
}
```

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "request_id": "req_123456790",
  "data": {
    "batch_id": "batch_abc123",
    "total": 4,
    "accepted": 4,
    "results": [
      {"site_id": "FR", "status": "accepted", "message": ""},
      {"site_id": "IT", "status": "accepted", "message": ""},
      {"site_id": "UK", "status": "accepted", "message": ""},
      {"site_id": "CZ", "status": "accepted", "message": ""}
    ]
  }
}
```

#### 接口3：查询同步任务状态

**功能**：查询批量同步任务的执行状态

**请求**：
```json
{
  "method": "temu.product.sync.query",
  "params": {
    "batch_id": "batch_abc123"
  },
  "body": {}
}
```

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "batch_id": "batch_abc123",
    "status": "completed",
    "total": 4,
    "success": 3,
    "failed": 1,
    "pending": 0,
    "results": [
      {"site_id": "FR", "status": "success", "product_id": "2234567890123"},
      {"site_id": "IT", "status": "success", "product_id": "3234567890123"},
      {"site_id": "UK", "status": "failed", "error_code": 1005, "error_msg": "价格超出平台限制"},
      {"site_id": "CZ", "status": "success", "product_id": "5234567890123"}
    ],
    "create_time": "2026-03-31T10:00:00Z",
    "complete_time": "2026-03-31T10:05:30Z"
  }
}
```

### 1.3 错误码详细说明

| 错误码 | 错误信息 | 原因 | 解决方案 |
|--------|----------|------|----------|
| 0 | success | 请求成功 | - |
| 1001 | INVALID_PARAMETER | 参数格式错误 | 检查参数类型和必填项 |
| 1002 | INVALID_SIGN | 签名验证失败 | 检查签名算法和时间戳 |
| 1003 | INVALID_TOKEN | access_token无效或过期 | 重新授权获取新token |
| 1004 | PRODUCT_NOT_FOUND | 商品不存在 | 检查product_id是否正确 |
| 1005 | PRICE_LIMIT_EXCEEDED | 价格超出平台限制 | 调整价格在允许范围内 |
| 1006 | INSUFFICIENT_STOCK | 库存不足 | 检查库存设置 |
| 1007 | UNSUPPORTED_COUNTRY | 不支持的目标国家 | 检查国家代码是否正确 |
| 1008 | PRODUCT_NOT_APPROVED | 商品未通过审核 | 等待商品审核通过 |
| 2001 | RATE_LIMIT_EXCEEDED | 请求频率过高 | 降低请求频率，稍后重试 |
| 2002 | SYSTEM_BUSY | 系统繁忙 | 稍后重试 |
| 5001 | INTERNAL_ERROR | 系统内部错误 | 联系Temu技术支持 |

---

## 二、飞书多维表格详细设计

### 2.1 表结构设计

**表名**：`Temu产品价格库存管理`

**字段清单**（共54个字段）：

| 序号 | 字段名 | 类型 | 必填 | 说明 |
|------|--------|------|------|------|
| 1 | 产品标签 | 文本 | ✅ | 主字段，内部SKU |
| 2 | Temu商品ID | 文本 | ✅ | 德国站商品ID |
| 3 | 商品标题 | 文本 | - | 商品名称（自动同步） |
| 4 | 所属账号 | 单选 | ✅ | 账号A/B/C... |
| 5 | 同步状态 | 单选 | ✅ | 待同步/已同步/同步中/失败 |
| 6 | 德国状态 | 单选 | - | 德国站商品状态 |
| 7 | DE_价格 | 数字 | - | 德国售价(EUR) |
| 8 | DE_库存 | 数字 | - | 德国库存 |
| 9 | DE_成本 | 数字 | - | 德国成本价 |
| 10 | FR_价格 | 数字 | - | 法国售价(EUR) |
| 11 | FR_库存 | 数字 | - | 法国库存 |
| 12 | IT_价格 | 数字 | - | 意大利售价(EUR) |
| 13 | IT_库存 | 数字 | - | 意大利库存 |
| 14 | ES_价格 | 数字 | - | 西班牙售价(EUR) |
| 15 | ES_库存 | 数字 | - | 西班牙库存 |
| 16 | UK_价格 | 数字 | - | 英国售价(GBP) |
| 17 | UK_库存 | 数字 | - | 英国库存 |
| 18 | CZ_价格 | 数字 | - | 捷克售价(CZK) |
| 19 | CZ_库存 | 数字 | - | 捷克库存 |
| 20 | PL_价格 | 数字 | - | 波兰售价(PLN) |
| 21 | PL_库存 | 数字 | - | 波兰库存 |
| ... | ... | ... | ... | 其他20国... |
| 52 | 最后同步时间 | 日期时间 | - | 自动记录 |
| 53 | 失败原因 | 文本 | - | 同步失败时记录 |
| 54 | 备注 | 文本 | - | 其他说明 |

### 2.2 视图设计

**视图1：待同步清单**
- 筛选条件：同步状态 = "待同步"
- 排序：最后同步时间 升序
- 显示字段：产品标签、所属账号、DE_价格、同步状态
- 用途：快速查看待处理产品

**视图2：按账号分组**
- 分组字段：所属账号
- 筛选条件：无
- 排序：产品标签 升序
- 用途：多账号管理

**视图3：同步失败**
- 筛选条件：同步状态 = "失败"
- 排序：最后同步时间 降序
- 显示字段：产品标签、失败原因、最后同步时间
- 用途：优先处理失败项

**视图4：价格总览**
- 筛选条件：无
- 显示字段：产品标签 + 25国价格字段
- 用途：查看所有国家价格配置

### 2.3 权限设计

| 角色 | 权限 | 说明 |
|------|------|------|
| **管理员** | 全部权限 | 可修改表格结构、所有数据 |
| **运营人员** | 编辑数据 | 可修改价格、库存、触发同步 |
| **财务人员** | 查看成本 | 可查看成本字段，不可修改 |
| **外部系统** | API只读 | OpenClaw Skill读取数据 |

---

## 三、异常处理详细设计

### 3.1 异常分类体系

```
异常
├── 网络层异常
│   ├── 连接超时（重试3次）
│   ├── DNS解析失败（立即告警）
│   └── SSL证书错误（立即告警）
├── 应用层异常
│   ├── 认证失败（重新授权）
│   ├── 参数错误（记录日志，不重试）
│   └── 频率限制（指数退避重试）
├── 业务层异常
│   ├── 价格超限（人工处理）
│   ├── 库存不足（自动补货提醒）
│   └── 商品下架（标记状态）
└── 系统层异常
    ├── 数据库错误（重试3次）
    └── 内存不足（立即告警）
```

### 3.2 重试策略矩阵

| 异常类型 | 重试次数 | 重试间隔 | 退避策略 | 最终处理 |
|----------|----------|----------|----------|----------|
| 网络超时 | 3 | 1s, 2s, 4s | 指数退避 | 标记失败 |
| 频率限制 | 5 | 5s, 10s, 20s, 40s, 80s | 指数退避 | 标记失败 |
| 认证失败 | 0 | - | - | 重新授权 |
| 参数错误 | 0 | - | - | 记录日志 |
| 系统繁忙 | 3 | 10s, 20s, 40s | 指数退避 | 标记失败 |

### 3.3 告警机制

**告警级别**：

| 级别 | 触发条件 | 通知方式 | 响应时间 |
|------|----------|----------|----------|
| **P0-紧急** | 系统完全不可用 | 电话+飞书+邮件 | 5分钟 |
| **P1-高** | 批量同步失败率>20% | 飞书+邮件 | 15分钟 |
| **P2-中** | 单个账号同步失败 | 飞书 | 1小时 |
| **P3-低** | 偶发单条失败 | 日志记录 | 次日处理 |

**告警消息模板**：
```
⚠️ Temu同步告警 [P1]

时间：2026-03-31 14:30:00
账号：账号A
异常：批量同步失败率 25% (5/20)
失败原因：
- SKU-001: 价格超出限制
- SKU-002: Token过期
- ...

建议操作：
1. 检查账号A的授权状态
2. 核实失败产品的价格设置

[查看详情](飞书表格链接)
```

---

## 四、安全与权限管理

### 4.1 API密钥管理

**存储方案**：
```python
# 使用OpenClaw内置的密钥管理
# 不硬编码在代码中，通过环境变量或配置文件注入

import os

class Config:
    # 从环境变量读取
    TEMU_APP_KEY = os.getenv('TEMU_APP_KEY')
    TEMU_APP_SECRET = os.getenv('TEMU_APP_SECRET')
    
    # 或使用OpenClaw的加密配置
    # 通过 openclaw config get temu.app_key 读取
```

**密钥轮换策略**：
- 定期轮换（每90天）
- 异常时立即轮换
- 旧密钥保留24小时作为过渡期

### 4.2 多账号隔离

**账号配置结构**：
```json
{
  "accounts": [
    {
      "name": "账号A",
      "access_token": "token_a_encrypted",
      "refresh_token": "refresh_a_encrypted",
      "expires_at": "2026-04-30T00:00:00Z"
    },
    {
      "name": "账号B",
      "access_token": "token_b_encrypted",
      "refresh_token": "refresh_b_encrypted",
      "expires_at": "2026-04-30T00:00:00Z"
    }
  ]
}
```

**隔离机制**：
- 每个账号独立access_token
- 账号切换时清空上下文
- 操作日志记录账号信息

### 4.3 数据安全

**敏感字段加密**：
- access_token：AES-256加密存储
- 成本价格：仅管理员可见
- 日志脱敏：token只显示前6位

**访问审计**：
- 记录所有API调用
- 记录所有数据修改
- 保留审计日志180天

---

## 五、测试方案

### 5.1 测试环境

**沙盒环境**：
- Temu提供沙盒API环境
- 使用测试账号和测试数据
- 不影响生产数据

**测试账号**：
```
Username: pddxjh@gmail.com
Password: 123456a@
app_key: f860e759073f9d1e5c8bbeb7baac1dbf
app_secret: 121eac72693c6e587f7e15ce4721b42da5df2def
```

### 5.2 测试用例

| 用例ID | 场景 | 输入 | 预期结果 |
|--------|------|------|----------|
| TC01 | 正常同步 | SKU-001 → 德国,法国 | 同步成功，状态更新 |
| TC02 | 价格超限 | SKU-002 价格=9999€ | 同步失败，记录原因 |
| TC03 | 无效Token | 过期access_token | 提示重新授权 |
| TC04 | 网络超时 | 模拟网络中断 | 重试3次后失败 |
| TC05 | 批量同步 | 50个SKU → 25国 | 全部成功 |
| TC06 | 部分失败 | 5个SKU（1个无效） | 4成功1失败 |
| TC07 | 多账号切换 | 账号A→账号B | 正确切换，数据隔离 |

### 5.3 性能测试

**测试指标**：
- 单条同步耗时：< 3秒
- 批量50条耗时：< 60秒
- 并发支持：5个账号同时操作
- 内存占用：< 200MB

---

## 六、部署与运维

### 6.1 部署架构

```
┌─────────────────────────────────────────────────────────┐
│                    OpenClaw Gateway                      │
│                   (Skill加载与调度)                       │
└─────────────────────────┬───────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ temu-sync     │ │ 飞书消息      │ │ 日志与监控    │
│ skill         │ │ 处理器        │ │ 模块          │
│               │ │               │ │               │
│ - API调用     │ │ - 指令解析    │ │ - 日志收集    │
│ - 表格读取    │ │ - 消息格式化  │ │ - 告警发送    │
│ - 异常处理    │ │ - 回复发送    │ │ - 指标统计    │
└───────┬───────┘ └───────────────┘ └───────────────┘
        │
    ┌───┴───┐
    ↓       ↓
┌───────┐ ┌───────────┐
│Temu   │ │ 飞书多维  │
│API    │ │ 表格      │
└───────┘ └───────────┘
```

### 6.2 监控指标

| 指标 | 类型 | 告警阈值 |
|------|------|----------|
| 同步成功率 | 百分比 | < 95% |
| 平均同步耗时 | 秒 | > 5s |
| API错误率 | 百分比 | > 5% |
| Skill内存占用 | MB | > 500MB |
| 飞书消息延迟 | 秒 | > 10s |

### 6.3 运维手册

**日常检查**：
```bash
# 检查Skill状态
openclaw skill status temu-sync

# 查看最近日志
openclaw logs temu-sync --tail 100

# 检查API配额
openclaw skill exec temu-sync check_quota
```

**故障处理**：

| 故障现象 | 可能原因 | 处理步骤 |
|----------|----------|----------|
| 同步全部失败 | Token过期 | 1. 检查授权状态 2. 重新授权 |
| 部分产品失败 | 价格超限 | 1. 查看失败原因 2. 调整价格 3. 重试 |
| 响应缓慢 | 网络问题 | 1. 检查网络 2. 降低并发 3. 联系Temu |
| Skill崩溃 | 内存不足 | 1. 重启Skill 2. 检查内存泄漏 |

---

## 七、实施检查清单

### 7.1 开发前准备

- [ ] 注册Temu Partner Platform账号
- [ ] 创建应用，获取app_key/app_secret
- [ ] 创建飞书多维表格，配置字段
- [ ] 准备测试账号和测试数据
- [ ] 确认OpenClaw环境可用

### 7.2 开发阶段

- [ ] 实现Temu API客户端
- [ ] 实现飞书表格读取/写入
- [ ] 实现Skill主逻辑
- [ ] 实现异常处理和重试
- [ ] 实现飞书消息格式化
- [ ] 编写单元测试

### 7.3 测试阶段

- [ ] 沙盒环境测试
- [ ] 功能测试（所有用例通过）
- [ ] 性能测试（指标达标）
- [ ] 异常场景测试
- [ ] 用户验收测试

### 7.4 上线阶段

- [ ] 生产环境配置
- [ ] 监控告警配置
- [ ] 操作手册编写
- [ ] 培训运营人员
- [ ] 正式上线

---

*文档版本：v1.3  
*更新时间：2026-03-31
