> 文档版本：v1.0 FINAL更新日期：2026-04-03
> 适用场景：Temu欧盟25国产品同步业务规模：日均100+产品，预期增长至1000+
---

## 目录
1. 项目概述
2. 需求分析
3. 技术方案选型
4. 系统架构设计
5. 详细设计方案
6. 核心功能实现
7. 异常处理机制
8. 附录
---

## 一、项目概述
### 1.1 项目背景
Temu（拼多多海外版）电商平台要求商家在欧盟25个国家分别上架产品。当前流程存在以下痛点：
- **手动操作繁琐**：每个产品需在25个国家分别填写价格、库存
- **多账号管理复杂**：一人管理多个店铺账号，切换频繁
- **核价周期长**：德国站提交后需等待24-48小时核价
- **数据管理混乱**：价格、库存分散管理，易出错
### 1.2 项目目标
构建自动化系统，实现：
1. **一键同步**：德国站核价通过后，自动同步到24个欧盟国家
2. **多账号管理**：支持多店铺账号自动切换
3. **数据集中管理**：飞书多维表格统一管理25国价格、库存
4. **飞书指令驱动**：通过飞书消息触发同步操作
### 1.3 核心指标

<lark-table rows="5" cols="2" header-row="true" column-widths="350,350"

  <lark-tr>
    <lark-td>
      指标
    </lark-td>
    <lark-td>
      目标值
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      同步成功率
    </lark-td>
    <lark-td>
      > 95%
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      平均同步耗时
    </lark-td>
    <lark-td>
      < 5秒/国家
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      日处理能力
    </lark-td>
    <lark-td>
      1000+产品
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      数据一致率
    </lark-td>
    <lark-td>
      > 99%
    </lark-td>
  </lark-tr>
</lark-table>

---

## 二、需求分析
### 2.1 业务流程
```plaintext
德国站上架 → 平台核价(24-48h) → 获取商品ID → 同步24国
                                              ↓
                                    ┌─────────────────────┐
                                    │ 飞书多维表格管理    │
                                    │ • 25国价格         │
                                    │ • 25国库存         │
                                    │ • 同步状态         │
                                    └─────────────────────┘

```

### 2.2 功能需求

<lark-table rows="7" cols="3" header-row="true" column-widths="244,267,244"

  <lark-tr>
    <lark-td>
      功能模块
    </lark-td>
    <lark-td>
      需求描述
    </lark-td>
    <lark-td>
      优先级
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      批量同步
    </lark-td>
    <lark-td>
      支持单产品/多产品批量同步
    </lark-td>
    <lark-td>
      P0
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      数据校验
    </lark-td>
    <lark-td>
      同步前校验价格/库存有效性
    </lark-td>
    <lark-td>
      P1
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      多账号切换
    </lark-td>
    <lark-td>
      自动切换不同店铺账号
    </lark-td>
    <lark-td>
      P2
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      核价监控
    </lark-td>
    <lark-td>
      自动检测核价状态，通过后触发同步
    </lark-td>
    <lark-td>
      P3（待定）
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      回滚机制
    </lark-td>
    <lark-td>
      支持同步失败后的回滚操作
    </lark-td>
    <lark-td>
      P4（待定）
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      数据一致性
    </lark-td>
    <lark-td>
      定期校验飞书与平台数据一致性
    </lark-td>
    <lark-td>
      P5（待定）
    </lark-td>
  </lark-tr>
</lark-table>

### 2.3 非功能需求
- **可用性**：系统可用性 > 99.5%
- **安全性**：API密钥加密存储，多账号隔离
- **可扩展性**：支持未来扩展到更多国家
- **可维护性**：代码模块化，文档完善
---

## 三、技术方案选型
### 3.1 方案对比

<lark-table rows="5" cols="5" header-row="true" column-widths="122,122,122,122,122"

  <lark-tr>
    <lark-td>
      方案
    </lark-td>
    <lark-td>
      自动化程度
    </lark-td>
    <lark-td>
      封号风险
    </lark-td>
    <lark-td>
      开发周期
    </lark-td>
    <lark-td>
      推荐度
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      **官方API**
    </lark-td>
    <lark-td>
      高
    </lark-td>
    <lark-td>
      无
    </lark-td>
    <lark-td>
      2-3天
    </lark-td>
    <lark-td>
      ⭐⭐⭐⭐⭐
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      **影刀RPA**
    </lark-td>
    <lark-td>
      高
    </lark-td>
    <lark-td>
      中
    </lark-td>
    <lark-td>
      1-2天
    </lark-td>
    <lark-td>
      ⭐⭐⭐⭐
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      **半自动辅助**
    </lark-td>
    <lark-td>
      中
    </lark-td>
    <lark-td>
      低
    </lark-td>
    <lark-td>
      0.5天
    </lark-td>
    <lark-td>
      ⭐⭐⭐
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      **云手机集群**
    </lark-td>
    <lark-td>
      高
    </lark-td>
    <lark-td>
      低
    </lark-td>
    <lark-td>
      3-5天
    </lark-td>
    <lark-td>
      ⭐⭐⭐
    </lark-td>
  </lark-tr>
</lark-table>

### 3.2 推荐方案：官方API + RPA备选
**首选方案：官方API（Skill化）**
- 无封号风险，效率最高
- 飞书指令直接操作
- 长期可持续维护**备选方案：影刀RPA**
- API不可用时启用
- 浏览器自动化，需防检测措施
- 确保业务连续性**兜底方案：半自动辅助**
- 任何自动化失效时使用
- 人工+工具辅助
### 3.3 技术栈

<lark-table rows="6" cols="3" header-row="true" column-widths="244,244,244"

  <lark-tr>
    <lark-td>
      层级
    </lark-td>
    <lark-td>
      技术
    </lark-td>
    <lark-td>
      用途
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      前端交互
    </lark-td>
    <lark-td>
      飞书消息
    </lark-td>
    <lark-td>
      用户指令输入、结果通知
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      业务逻辑
    </lark-td>
    <lark-td>
      Python + OpenClaw Skill
    </lark-td>
    <lark-td>
      指令解析、业务编排
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      数据存储
    </lark-td>
    <lark-td>
      飞书多维表格
    </lark-td>
    <lark-td>
      价格、库存、状态管理
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      外部接口
    </lark-td>
    <lark-td>
      Temu Open API
    </lark-td>
    <lark-td>
      商品同步、价格更新
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      备选方案
    </lark-td>
    <lark-td>
      影刀RPA + Chrome
    </lark-td>
    <lark-td>
      浏览器自动化
    </lark-td>
  </lark-tr>
</lark-table>

---

## 四、系统架构设计
### 4.1 整体架构
```plaintext
┌─────────────────────────────────────────────────────────────┐
│                        用户层                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   飞书消息  │  │  多维表格   │  │  监控面板   │         │
│  └──────┬──────┘  └─────────────┘  └─────────────┘         │
└─────────┼───────────────────────────────────────────────────┘
          │
┌─────────┼───────────────────────────────────────────────────┐
│         ↓              应用层（OpenClaw Skill）              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Temu Sync Skill                        │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │   │
│  │  │指令解析 │→ │业务编排 │→ │API调用  │→ │状态更新│ │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Temu Open API │  │ 飞书多维表格  │  │  影刀RPA备选  │
│ • 商品同步    │  │ • 价格管理    │  │ • 浏览器控制  │
│ • 价格更新    │  │ • 库存管理    │  │ • 自动填表    │
│ • 库存更新    │  │ • 状态追踪    │  │ • 模拟点击    │
└───────────────┘  └───────────────┘  └───────────────┘



```

### 4.2 数据流
```plaintext
1. 用户发送指令: @openclaw 同步Temu SKU-001 到 欧盟25国
           ↓
2. Skill解析指令，提取SKU和目标国家
           ↓
3. 查询飞书多维表格获取25国价格/库存
           ↓
4. 调用Temu API批量同步到25个国家
           ↓
5. 更新飞书表格同步状态
           ↓
6. 返回结果到飞书消息

```

---

## 五、详细设计方案
### 5.1 飞书多维表格设计
**表名**：Temu产品价格库存管理
#### 核心字段

<lark-table rows="6" cols="4" header-row="true" column-widths="183,183,183,224"

  <lark-tr>
    <lark-td>
      字段名
    </lark-td>
    <lark-td>
      类型
    </lark-td>
    <lark-td>
      必填
    </lark-td>
    <lark-td>
      说明
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      产品标签
    </lark-td>
    <lark-td>
      文本
    </lark-td>
    <lark-td>
      ✅
    </lark-td>
    <lark-td>
      内部SKU，主字段
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      Temu商品ID
    </lark-td>
    <lark-td>
      文本
    </lark-td>
    <lark-td>
      ✅
    </lark-td>
    <lark-td>
      德国站商品ID
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      所属账号
    </lark-td>
    <lark-td>
      单选
    </lark-td>
    <lark-td>
      ✅
    </lark-td>
    <lark-td>
      账号A/账号B/...
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      同步状态
    </lark-td>
    <lark-td>
      单选
    </lark-td>
    <lark-td>
      ✅
    </lark-td>
    <lark-td>
      待同步/已同步/失败/核价中
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      核价状态
    </lark-td>
    <lark-td>
      单选
    </lark-td>
    <lark-td>
      ✅
    </lark-td>
    <lark-td>
      核价中/已通过/已拒绝
    </lark-td>
  </lark-tr>
</lark-table>

#### 25国价格库存字段

<lark-table rows="5" cols="4" header-row="true" column-widths="183,183,183,183"

  <lark-tr>
    <lark-td>
      国家
    </lark-td>
    <lark-td>
      价格字段
    </lark-td>
    <lark-td>
      库存字段
    </lark-td>
    <lark-td>
      货币
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      德国
    </lark-td>
    <lark-td>
      DE_价格
    </lark-td>
    <lark-td>
      DE_库存
    </lark-td>
    <lark-td>
      EUR
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      法国
    </lark-td>
    <lark-td>
      FR_价格
    </lark-td>
    <lark-td>
      FR_库存
    </lark-td>
    <lark-td>
      EUR
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      英国
    </lark-td>
    <lark-td>
      UK_价格
    </lark-td>
    <lark-td>
      UK_库存
    </lark-td>
    <lark-td>
      GBP
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      ...
    </lark-td>
    <lark-td>
      ...
    </lark-td>
    <lark-td>
      ...
    </lark-td>
    <lark-td>
      ...
    </lark-td>
  </lark-tr>
</lark-table>

#### 系统字段

<lark-table rows="4" cols="4" header-row="true" column-widths="183,183,183,183"

  <lark-tr>
    <lark-td>
      字段名
    </lark-td>
    <lark-td>
      类型
    </lark-td>
    <lark-td>
      自动
    </lark-td>
    <lark-td>
      说明
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      创建时间
    </lark-td>
    <lark-td>
      创建时间
    </lark-td>
    <lark-td>
      ✅
    </lark-td>
    <lark-td>
      记录创建时间
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      最后同步时间
    </lark-td>
    <lark-td>
      修改时间
    </lark-td>
    <lark-td>
      ✅
    </lark-td>
    <lark-td>
      最后同步操作时间
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      失败原因
    </lark-td>
    <lark-td>
      文本
    </lark-td>
    <lark-td>
      ✅
    </lark-td>
    <lark-td>
      同步失败时记录
    </lark-td>
  </lark-tr>
</lark-table>

#### 视图设计
1. **待同步视图**：筛选同步状态="待同步"
1. **按账号分组**：按所属账号分组显示
1. **同步失败**：筛选同步状态="失败"
1. **核价中**：筛选核价状态="核价中"
### 5.2 Temu API接口设计
#### 5.2.1 多店铺API管理架构
**核心原则：1个应用，多套Token**
```plaintext
┌─────────────────────────────────────────────────────────────┐
│                    Temu Partner Platform                     │
│  ┌─────────────────┐                                        │
│  │  1个开发者应用   │  ← 申请1次，获得 App Key + App Secret  │
│  │  (Self-developed │                                        │
│  │   App)          │                                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              店铺授权流程（每个店铺独立）              │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │    │
│  │  │ 店铺1   │  │ 店铺2   │  │ 店铺3   │  │ ...    │ │    │
│  │  │授权     │  │授权     │  │授权     │  │授权    │ │    │
│  │  │↓       │  │↓       │  │↓       │  │↓       │ │    │
│  │  │Token A │  │Token B │  │Token C │  │Token N │ │    │
│  │  │mall_1  │  │mall_2  │  │mall_3  │  │mall_n  │ │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └────────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    OpenClaw Skill 层                        │
│  • Token池管理：维护5个店铺的Access Token                    │
│  • 店铺切换：通过更换 X-Access-Token 实现                    │
│  • 轮询机制：批量操作时按序切换店铺Token                      │
│  • 故障隔离：单个Token失效不影响其他店铺                      │
└─────────────────────────────────────────────────────────────┘

```

**关键结论**：
- 只需申请 **1个开发者应用**，获得全局唯一的 `App Key` 和 `App Secret`
- 每个店铺需 **单独授权**，获得独立的 `Access Token` 和 `mall_id`
- 调用API时通过更换请求头中的 `X-Access-Token` 来切换不同店铺
---

#### 5.2.2 API端点配置
**地域端点隔离（强制）**

<lark-table rows="4" cols="3" header-row="true" column-widths="244,244,244"

  <lark-tr>
    <lark-td>
      地域
    </lark-td>
    <lark-td>
      生产环境端点
    </lark-td>
    <lark-td>
      适用站点
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      欧盟 (EU)
    </lark-td>
    <lark-td>
      `https://openapi-b-eu.temu.com/openapi/router`
    </lark-td>
    <lark-td>
      德国、法国、意大利、西班牙等欧盟25国
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      美国 (US)
    </lark-td>
    <lark-td>
      `https://openapi-b-us.temu.com/openapi/router`
    </lark-td>
    <lark-td>
      美国站
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      全球 (Global)
    </lark-td>
    <lark-td>
      `https://openapi-b-global.temu.com/openapi/router`
    </lark-td>
    <lark-td>
      墨西哥、日本等其他地区
    </lark-td>
  </lark-tr>
</lark-table>

## **注意**：欧盟25国统一使用 EU 端点，无需按国家分别调用。
#### 5.2.3 多店铺Token管理方案
**Token存储结构**
```json
{
  "app_config": {
    "app_key": "your_app_key",
    "app_secret": "your_app_secret",
    "endpoint": "https://openapi-b-eu.temu.com/openapi/router"
  },
  "shops": [
    {
      "shop_id": "shop_001",
      "shop_name": "店铺A-主店",
      "mall_id": "1234567890",
      "access_token": "eu_token_xxxxxxxxxx",
      "refresh_token": "eu_refresh_xxxxxxx",
      "expires_at": "2026-06-30T23:59:59Z",
      "countries": ["DE", "FR", "IT", "ES", "NL", "BE", "AT", "PL"],
      "status": "active",
      "last_used": "2026-04-01T10:30:00Z"
    },
    {
      "shop_id": "shop_002",
      "shop_name": "店铺B-副店1",
      "mall_id": "2345678901",
      "access_token": "eu_token_yyyyyyyyyy",
      "refresh_token": "eu_refresh_yyyyyyy",
      "expires_at": "2026-06-30T23:59:59Z",
      "countries": ["SE", "DK", "FI", "NO", "IE", "PT", "GR", "CZ"],
      "status": "active",
      "last_used": "2026-04-01T09:15:00Z"
    },
    {
      "shop_id": "shop_003",
      "shop_name": "店铺C-副店2",
      "mall_id": "3456789012",
      "access_token": "eu_token_zzzzzzzzzz",
      "refresh_token": "eu_refresh_zzzzzzz",
      "expires_at": "2026-06-30T23:59:59Z",
      "countries": ["HU", "SK", "SI", "HR", "BG", "RO", "LT", "LV", "EE"],
      "status": "active",
      "last_used": "2026-04-01T08:45:00Z"
    }
  ],
  "rotation_config": {
    "strategy": "round_robin",
    "qps_limit_per_shop": 10,
    "failover_enabled": true,
    "health_check_interval": 300
  }
}

```

**Token轮换策略**

<lark-table rows="5" cols="3" header-row="true" column-widths="158,158,329"

  <lark-tr>
    <lark-td>
      策略
    </lark-td>
    <lark-td>
      适用场景
    </lark-td>
    <lark-td>
      说明
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      `round_robin`
    </lark-td>
    <lark-td>
      批量同步多店铺
    </lark-td>
    <lark-td>
      按序轮询各店铺Token，均衡负载
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      `priority`
    </lark-td>
    <lark-td>
      指定店铺优先
    </lark-td>
    <lark-td>
      主店铺优先，失败时 fallback 到备用店铺
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      `random`
    </lark-td>
    <lark-td>
      高并发分散压力
    </lark-td>
    <lark-td>
      随机选择可用Token，避免单点热点
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      `sticky`
    </lark-td>
    <lark-td>
      同店铺操作保持
    </lark-td>
    <lark-td>
      同一批操作固定使用同一Token
    </lark-td>
  </lark-tr>
</lark-table>

---

#### 5.2.4 店铺切换与轮询机制
**核心类设计**
```python
class MultiShopTokenManager:
    """多店铺Token管理器"""
    
    def __init__(self, config_path: str):
        self.config = self._load_config(config_path)
        self.token_pool = self._init_token_pool()
        self.current_index = 0
        self.lock = threading.Lock()
    
    def get_next_token(self, strategy: str = "round_robin") -> dict:
        """获取下一个可用Token"""
        with self.lock:
            if strategy == "round_robin":
                return self._round_robin_select()
            elif strategy == "priority":
                return self._priority_select()
            elif strategy == "random":
                return self._random_select()
            else:
                return self._sticky_select()
    
    def _round_robin_select(self) -> dict:
        """轮询选择：按序循环使用各店铺Token"""
        active_shops = [s for s in self.config['shops'] if s['status'] == 'active']
        if not active_shops:
            raise NoActiveShopError("无可用店铺")
        
        token = active_shops[self.current_index % len(active_shops)]
        self.current_index += 1
        token['last_used'] = datetime.now().isoformat()
        return token
    
    def get_token_by_shop(self, shop_id: str) -> dict:
        """指定店铺获取Token"""
        for shop in self.config['shops']:
            if shop['shop_id'] == shop_id and shop['status'] == 'active':
                shop['last_used'] = datetime.now().isoformat()
                return shop
        raise ShopNotFoundError(f"店铺 {shop_id} 不存在或不可用")


class TemuMultiShopAPI:
    """Temu多店铺API客户端"""
    
    def __init__(self, token_manager: MultiShopTokenManager):
        self.token_manager = token_manager
        self.app_key = token_manager.config['app_config']['app_key']
        self.app_secret = token_manager.config['app_config']['app_secret']
        self.endpoint = token_manager.config['app_config']['endpoint']
    
    def call_api(self, method: str, params: dict, body: dict, 
                 shop_id: str = None, auto_rotate: bool = True) -> dict:
        """
        调用API，支持自动店铺切换
        
        Args:
            method: API方法名
            params: URL参数
            body: 请求体
            shop_id: 指定店铺ID（None则自动轮询）
            auto_rotate: 失败时是否自动切换店铺重试
        """
        # 获取Token
        if shop_id:
            shop = self.token_manager.get_token_by_shop(shop_id)
        else:
            shop = self.token_manager.get_next_token("round_robin")
        
        headers = self._build_headers(shop['access_token'])
        
        try:
            response = requests.post(
                self.endpoint,
                headers=headers,
                json={"method": method, "params": params, "body": body},
                timeout=30
            )
            return self._handle_response(response, shop)
        except TokenExpiredError:
            if auto_rotate:
                # Token过期，标记当前店铺并切换到下一个
                self._mark_shop_unavailable(shop['shop_id'])
                return self.call_api(method, params, body, auto_rotate=False)
            raise
        except RateLimitError:
            if auto_rotate:
                # 触发限流，切换到下一个店铺
                return self.call_api(method, params, body, auto_rotate=False)
            raise
    
    def _build_headers(self, access_token: str) -> dict:
        """构建请求头"""
        timestamp = str(int(time.time()))
        sign = self._generate_sign(timestamp)
        
        return {
            "Content-Type": "application/json",
            "X-App-Key": self.app_key,
            "X-Timestamp": timestamp,
            "X-Sign": sign,
            "X-Access-Token": access_token  # ← 切换店铺的关键
        }
    
    def _generate_sign(self, timestamp: str) -> str:
        """生成签名"""
        raw = f"{self.app_key}{timestamp}{self.app_secret}"
        return hashlib.md5(raw.encode()).hexdigest()

```

**批量同步时的店铺轮询**
```python
class BatchSyncManager:
    """批量同步管理器：自动在多个店铺间分配任务"""
    
    def __init__(self, api_client: TemuMultiShopAPI):
        self.api = api_client
        self.task_queue = Queue()
        self.results = []
    
    def sync_products_to_countries(self, products: list, countries: list) -> dict:
        """
        批量同步产品到多个国家，自动在店铺间轮询
        
        策略：
        1. 按国家分组，每个国家对应负责的店铺
        2. 使用轮询策略分散请求压力
        3. 单个店铺失败时自动切换到备用店铺
        """
        # 获取所有可用店铺
        shops = self.api.token_manager.get_active_shops()
        
        # 将国家分配给各店铺（根据店铺配置的国家范围）
        shop_tasks = self._distribute_countries(countries, shops)
        
        # 并行执行各店铺的任务
        with ThreadPoolExecutor(max_workers=len(shops)) as executor:
            futures = []
            for shop_id, shop_countries in shop_tasks.items():
                future = executor.submit(
                    self._sync_to_shop_countries,
                    shop_id, products, shop_countries
                )
                futures.append((shop_id, future))
            
            # 收集结果
            for shop_id, future in futures:
                try:
                    result = future.result(timeout=300)
                    self.results.append({"shop_id": shop_id, "status": "success", "data": result})
                except Exception as e:
                    self.results.append({"shop_id": shop_id, "status": "failed", "error": str(e)})
        
        return self._aggregate_results()
    
    def _distribute_countries(self, countries: list, shops: list) -> dict:
        """将国家分配给各店铺"""
        shop_tasks = {shop['shop_id']: [] for shop in shops}
        
        for country in countries:
            # 找到支持该国家的店铺
            for shop in shops:
                if country in shop.get('countries', []):
                    shop_tasks[shop['shop_id']].append(country)
                    break
            else:
                # 无明确配置时，轮询分配
                shop_id = list(shop_tasks.keys())[len(countries) % len(shops)]
                shop_tasks[shop_id].append(country)
        
        return shop_tasks
    
    def _sync_to_shop_countries(self, shop_id: str, products: list, countries: list):
        """同步指定产品到指定国家（使用指定店铺）"""
        results = []
        for product in products:
            for country in countries:
                try:
                    result = self.api.call_api(
                        method="temu.product.sync",
                        params={"product_id": product['temu_id']},
                        body={
                            "target_site": country,
                            "price": product['prices'][country],
                            "stock": product['stocks'][country]
                        },
                        shop_id=shop_id,
                        auto_rotate=True  # 当前店铺失败时自动切换
                    )
                    results.append({"product": product['sku'], "country": country, "status": "success"})
                except Exception as e:
                    results.append({"product": product['sku'], "country": country, "status": "failed", "error": str(e)})
                
                # 控制QPS，避免触发限流
                time.sleep(0.1)
        
        return results

```

---

#### 5.2.5 API接口详情
**接口1：获取商品列表（单店铺）**
```http
POST /openapi/router
Content-Type: application/json
X-App-Key: {app_key}
X-Timestamp: {timestamp}
X-Sign: {sign}
X-Access-Token: {shop_specific_token}  ← 不同店铺使用不同Token

{
  "method": "temu.product.list",
  "params": {
    "status": "approved",
    "page": 1,
    "page_size": 50,
    "mall_id": "1234567890"  ← 可选，用于校验
  },
  "body": {}
}

```

**接口2：同步商品到多国（支持店铺切换）**
```python
# 使用示例：同步SKU-001到欧盟25国，自动在3个店铺间分配
api = TemuMultiShopAPI(token_manager)
batch_manager = BatchSyncManager(api)

result = batch_manager.sync_products_to_countries(
    products=[{"sku": "SKU-001", "temu_id": "12345", "prices": {...}, "stocks": {...}}],
    countries=["DE", "FR", "IT", "ES", "NL", "BE", "AT", "PL", 
               "SE", "DK", "FI", "NO", "IE", "PT", "GR", "CZ",
               "HU", "SK", "SI", "HR", "BG", "RO", "LT", "LV", "EE"]
)

# 返回结果示例
{
  "total_products": 1,
  "total_countries": 25,
  "shop_distribution": {
    "shop_001": ["DE", "FR", "IT", "ES", "NL", "BE", "AT", "PL"],      # 8国
    "shop_002": ["SE", "DK", "FI", "NO", "IE", "PT", "GR", "CZ"],      # 8国  
    "shop_003": ["HU", "SK", "SI", "HR", "BG", "RO", "LT", "LV", "EE"]  # 9国
  },
  "results": [
    {"shop_id": "shop_001", "status": "success", "synced": 8, "failed": 0},
    {"shop_id": "shop_002", "status": "success", "synced": 8, "failed": 0},
    {"shop_id": "shop_003", "status": "success", "synced": 9, "failed": 0}
  ],
  "summary": {
    "total_synced": 25,
    "total_failed": 0,
    "duration_seconds": 12.5
  }
}

```

**接口3：查询店铺授权状态**
```http
{
  "method": "temu.shop.auth.status",
  "params": {},
  "body": {
    "shop_id": "shop_001"
  }
}

# 返回
{
  "code": 0,
  "data": {
    "mall_id": "1234567890",
    "shop_name": "店铺A-主店",
    "auth_status": "authorized",  // authorized | expired | revoked
    "expires_at": "2026-06-30T23:59:59Z",
    "permissions": ["product.read", "product.write", "price.update", "stock.update"]
  }
}

```

---

#### 5.2.6 错误码与处理策略

<lark-table rows="13" cols="4" header-row="true" column-widths="102,162,183,236"

  <lark-tr>
    <lark-td>
      错误码
    </lark-td>
    <lark-td>
      说明
    </lark-td>
    <lark-td>
      触发场景
    </lark-td>
    <lark-td>
      处理策略
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      0
    </lark-td>
    <lark-td>
      成功
    </lark-td>
    <lark-td>
      -
    </lark-td>
    <lark-td>
      继续执行
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      1001
    </lark-td>
    <lark-td>
      App Key无效
    </lark-td>
    <lark-td>
      应用未审核通过
    </lark-td>
    <lark-td>
      检查应用状态，联系Temu运营
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      1002
    </lark-td>
    <lark-td>
      App Secret错误
    </lark-td>
    <lark-td>
      密钥配置错误
    </lark-td>
    <lark-td>
      核对密钥，重新配置
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      1003
    </lark-td>
    <lark-td>
      Access Token过期
    </lark-td>
    <lark-td>
      Token超过90天未刷新
    </lark-td>
    <lark-td>
      自动刷新Token或重新授权
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      1004
    </lark-td>
    <lark-td>
      Access Token无效
    </lark-td>
    <lark-td>
      店铺取消授权
    </lark-td>
    <lark-td>
      标记店铺失效，通知人工处理
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      1005
    </lark-td>
    <lark-td>
      店铺未授权此应用
    </lark-td>
    <lark-td>
      未在卖家后台授权
    </lark-td>
    <lark-td>
      引导卖家完成授权流程
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      **429**
    </lark-td>
    <lark-td>
      **请求过于频繁**
    </lark-td>
    <lark-td>
      **触发QPS限流**
    </lark-td>
    <lark-td>
      **读取Retry-After，指数退避重试**
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      2001
    </lark-td>
    <lark-td>
      商品不存在
    </lark-td>
    <lark-td>
      SKU错误或已下架
    </lark-td>
    <lark-td>
      跳过该商品，记录日志
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      3001
    </lark-td>
    <lark-td>
      QPS超限
    </lark-td>
    <lark-td>
      请求频率过高
    </lark-td>
    <lark-td>
      触发限流保护，切换店铺或降速
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      3002
    </lark-td>
    <lark-td>
      店铺被限流
    </lark-td>
    <lark-td>
      单店铺请求过多
    </lark-td>
    <lark-td>
      自动切换到其他店铺
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      5000
    </lark-td>
    <lark-td>
      系统错误
    </lark-td>
    <lark-td>
      Temu服务端异常
    </lark-td>
    <lark-td>
      指数退避重试，最多3次
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      5001
    </lark-td>
    <lark-td>
      服务不可用
    </lark-td>
    <lark-td>
      系统维护中
    </lark-td>
    <lark-td>
      延迟30分钟后重试
    </lark-td>
  </lark-tr>
</lark-table>

**错误处理代码示例**
```python
class APIErrorHandler:
    """API错误处理器"""
    
    ERROR_STRATEGIES = {
        1003: {"action": "refresh_token", "retry": True},
        1004: {"action": "mark_inactive", "retry": False, "alert": True},
        1005: {"action": "guide_auth", "retry": False, "alert": True},
        429: {"action": "rate_limit", "retry": True, "read_header": True},
        3001: {"action": "rate_limit", "retry": True, "delay": 60},
        3002: {"action": "switch_shop", "retry": True},
        5000: {"action": "exponential_backoff", "retry": True, "max_retries": 3},
        5001: {"action": "delay_retry", "retry": True, "delay": 1800}
    }
    
    def handle_error(self, error_code: int, response: requests.Response, 
                     shop_id: str, context: dict) -> dict:
        """处理API错误"""
        strategy = self.ERROR_STRATEGIES.get(error_code, {"action": "unknown", "retry": False})
        
        # 处理限流错误（429）
        if error_code == 429 or strategy.get("read_header"):
            return self._handle_rate_limit(response, shop_id, context)
        
        if strategy["action"] == "refresh_token":
            return self._refresh_token(shop_id)
        elif strategy["action"] == "mark_inactive":
            return self._mark_shop_inactive(shop_id, context)
        elif strategy["action"] == "switch_shop":
            return self._switch_to_next_shop(context)
        elif strategy["action"] == "rate_limit":
            delay = strategy.get("delay", 60)
            time.sleep(delay)
            return {"retry": True}
        elif strategy["action"] == "exponential_backoff":
            return self._exponential_backoff(context, strategy["max_retries"])
        
        return {"retry": False, "alert": strategy.get("alert", False)}
    
    def _handle_rate_limit(self, response: requests.Response, shop_id: str, context: dict) -> dict:
        """处理429限流错误"""
        headers = response.headers
        
        # 读取Retry-After头
        retry_after = headers.get('Retry-After')
        if retry_after:
            wait_seconds = int(retry_after)
        else:
            # 备用计算
            reset_timestamp = int(headers.get('X-RateLimit-Reset', 0))
            if reset_timestamp > 0:
                wait_seconds = max(0, reset_timestamp - int(time.time()))
            else:
                wait_seconds = 60
        
        logger.warning(f"店铺 {shop_id} 触发限流，等待 {wait_seconds} 秒")
        
        # 判断是应用级还是店铺级限流
        remaining = int(headers.get('X-RateLimit-Remaining', -1))
        if remaining == 0:
            # 可能是应用级限流，尝试切换店铺
            if context.get('auto_switch_shop', True):
                return {"retry": True, "switch_shop": True, "wait": 0}
        
        time.sleep(wait_seconds)
        return {"retry": True, "switch_shop": False}
    
```

#### 5.2.7 限流机制与风控防护
**Temu限流维度（双层配额制）**Temu采用"阶梯式控制"原则，限流分为两个独立维度：

<lark-table rows="3" cols="4" header-row="true" column-widths="183,183,183,183"

  <lark-tr>
    <lark-td>
      限流维度
    </lark-td>
    <lark-td>
      控制对象
    </lark-td>
    <lark-td>
      影响范围
    </lark-td>
    <lark-td>
      隔离性
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      **应用级别** (App Level)
    </lark-td>
    <lark-td>
      App Key 全局配额
    </lark-td>
    <lark-td>
      5个店铺共享总QPS池
    </lark-td>
    <lark-td>
      ❌ 店铺间竞争
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      **店铺级别** (Mall Level)
    </lark-td>
    <lark-td>
      单个 mall_id 配额
    </lark-td>
    <lark-td>
      仅影响该店铺
    </lark-td>
    <lark-td>
      ✅ 店铺间隔离
    </lark-td>
  </lark-tr>
</lark-table>

**关键结论**：
- 5个店铺共用1个应用的流量池，高频调用会相互竞争
- 单个店铺被限流不会直接导致其他店铺不可用
- 需要队列化管理，避免5店同时瞬间高并发
---

**全局轮询排队机制（跨店铺统一调度）**由于5个店铺共享1个API Key，必须实现跨店铺的统一任务队列：
```plaintext
┌─────────────────────────────────────────────────────────────┐
│                    全局任务调度中心                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              统一任务队列 (FIFO + 优先级)              │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  任务1: SKU-001 → FR,IT,ES (店铺A)  优先级:5 │   │   │
│  │  │  任务2: SKU-002 → DE,NL,BE (店铺B)  优先级:5 │   │   │
│  │  │  任务3: SKU-003 → AT,PL,CZ (店铺C)  优先级:3 │   │   │
│  │  │  ...                                        │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │  调度规则:                                           │   │
│  │  1. 同一SKU冷却期 ≥ 2分钟                            │   │
│  │  2. 全局最小间隔 ≥ 2分钟（无论是否同SKU）            │   │
│  │  3. 店铺轮询：A→B→C→D→E→A...                        │   │
│  │  4. 优先级高的任务可插队                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    执行层（按序执行）                         │
│  执行任务 → 检查SKU冷却 → 检查全局间隔 → 检查店铺配额 → 执行API │
└─────────────────────────────────────────────────────────────┘

```

**核心设计原则**：
- **统一入口**：所有店铺的任务都进入同一个全局队列
- **最小间隔**：任意两次API调用间隔 ≥ 2分钟（30请求/小时）
- **SKU冷却**：同一SKU操作间隔 ≥ 2分钟（防止价格冷却期触发）
- **店铺轮询**：按 A→B→C→D→E 顺序循环，避免单店铺连续请求
---

**全局任务队列实现**
```python
import time
import threading
from datetime import datetime, timedelta
from collections import defaultdict
import heapq

class GlobalTaskQueue:
    """全局任务队列 - 跨店铺统一调度"""
    
    MIN_INTERVAL_SECONDS = 120  # 最小间隔：2分钟
    SKU_COOLDOWN_SECONDS = 120  # SKU冷却：2分钟
    
    def __init__(self):
        # 任务队列 [(priority, sequence, task)]
        self.queue = []
        self.sequence = 0
        self.queue_lock = threading.Lock()
        
        # 全局最后请求时间
        self.last_request_time = 0
        self.request_lock = threading.Lock()
        
        # SKU最后操作时间 {sku: last_operation_time}
        self.sku_last_operation = {}
        self.sku_lock = threading.Lock()
        
        # 店铺轮询
        self.shop_rotation = ['shop_A', 'shop_B', 'shop_C', 'shop_D', 'shop_E']
        self.current_shop_index = 0
        
        # 统计
        self.stats = {
            "total_queued": 0,
            "total_executed": 0,
            "total_wait_seconds": 0
        }
    
    def submit_task(self, task: dict, priority: int = 5) -> str:
        """提交任务到全局队列"""
        with self.queue_lock:
            self.sequence += 1
            task_item = {
                "task_id": f"task_{int(time.time())}_{self.sequence}",
                "submitted_at": datetime.now(),
                "task": task,
                "status": "queued"
            }
            heapq.heappush(self.queue, (priority, self.sequence, task_item))
            self.stats["total_queued"] += 1
        return task_item["task_id"]
    
    def get_next_executable_task(self) -> tuple[dict, int]:
        """获取下一个可执行的任务"""
        with self.queue_lock:
            if not self.queue:
                return None, 60
            
            priority, seq, task_item = self.queue[0]
            task = task_item["task"]
            sku = task["sku"]
            shop_id = task["shop_id"]
            
            # 1. 检查全局最小间隔（硬约束）
            with self.request_lock:
                elapsed = time.time() - self.last_request_time
                if elapsed < self.MIN_INTERVAL_SECONDS:
                    wait = int(self.MIN_INTERVAL_SECONDS - elapsed)
                    return None, wait
            
            # 2. 检查SKU冷却期
            with self.sku_lock:
                last_sku_time = self.sku_last_operation.get(sku)
                if last_sku_time:
                    sku_elapsed = time.time() - last_sku_time
                    if sku_elapsed < self.SKU_COOLDOWN_SECONDS:
                        sku_wait = int(self.SKU_COOLDOWN_SECONDS - sku_elapsed)
                        # 尝试找其他SKU的任务
                        alt_task = self._find_alternative_task(sku)
                        if alt_task:
                            return alt_task, 0
                        return None, min(sku_wait, 60)
            
            # 3. 检查店铺轮询
            expected_shop = self.shop_rotation[self.current_shop_index]
            if shop_id != expected_shop:
                expected_task = self._find_task_by_shop(expected_shop)
                if expected_task:
                    return expected_task, 0
                self._advance_rotation()
            else:
                self._advance_rotation()
            
            heapq.heappop(self.queue)
            task_item["status"] = "executing"
            return task_item, 0
    
    def _find_alternative_task(self, cooling_sku: str) -> dict:
        """查找其他可执行的SKU任务"""
        temp_list = []
        found_task = None
        
        for priority, seq, task_item in self.queue:
            task = task_item["task"]
            if task["sku"] != cooling_sku:
                with self.sku_lock:
                    last_time = self.sku_last_operation.get(task["sku"])
                    if not last_time or (time.time() - last_time) >= self.SKU_COOLDOWN_SECONDS:
                        found_task = task_item
                        break
            temp_list.append((priority, seq, task_item))
        
        return found_task
    
    def _find_task_by_shop(self, shop_id: str) -> dict:
        """查找指定店铺的任务"""
        for priority, seq, task_item in self.queue:
            if task_item["task"]["shop_id"] == shop_id:
                return task_item
        return None
    
    def _advance_rotation(self):
        """推进店铺轮询索引"""
        self.current_shop_index = (self.current_shop_index + 1) % len(self.shop_rotation)
    
    def record_execution(self, task_id: str, sku: str):
        """记录任务执行完成"""
        with self.sku_lock:
            self.sku_last_operation[sku] = time.time()
        with self.request_lock:
            self.last_request_time = time.time()
        self.stats["total_executed"] += 1
    
    def get_queue_status(self) -> dict:
        """获取队列状态"""
        now = time.time()
        cooling_skus = []
        
        with self.sku_lock:
            for sku, last_time in self.sku_last_operation.items():
                elapsed = now - last_time
                if elapsed < self.SKU_COOLDOWN_SECONDS:
                    cooling_skus.append({
                        "sku": sku,
                        "remaining": int(self.SKU_COOLDOWN_SECONDS - elapsed)
                    })
        
        return {
            "queue_length": len(self.queue),
            "current_shop_turn": self.shop_rotation[self.current_shop_index],
            "min_interval_seconds": self.MIN_INTERVAL_SECONDS,
            "cooling_skus_count": len(cooling_skus),
            "cooling_skus": cooling_skus[:10],
            "stats": self.stats
        }


# 工作线程示例
def worker_loop(queue: GlobalTaskQueue):
    while True:
        task_item, wait_seconds = queue.get_next_executable_task()
        
        if task_item is None:
            time.sleep(wait_seconds)
            continue
        
        task = task_item["task"]
        try:
            result = call_temu_api(task)
            queue.record_execution(task_item["task_id"], task["sku"])
        except Exception as e:
            logger.error(f"任务失败: {e}")

```

---

**调度策略与吞吐量**

<lark-table rows="5" cols="3" header-row="true" column-widths="244,244,244"

  <lark-tr>
    <lark-td>
      策略
    </lark-td>
    <lark-td>
      说明
    </lark-td>
    <lark-td>
      约束类型
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      **全局最小间隔**
    </lark-td>
    <lark-td>
      任意两次API调用间隔 ≥ 2分钟
    </lark-td>
    <lark-td>
      硬约束
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      **SKU冷却**
    </lark-td>
    <lark-td>
      同一SKU操作间隔 ≥ 2分钟
    </lark-td>
    <lark-td>
      硬约束
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      **店铺轮询**
    </lark-td>
    <lark-td>
      A→B→C→D→E循环
    </lark-td>
    <lark-td>
      软约束
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      **优先级插队**
    </lark-td>
    <lark-td>
      紧急任务可插队
    </lark-td>
    <lark-td>
      P1-P2优先
    </lark-td>
  </lark-tr>
</lark-table>

**吞吐量计算**：
```plaintext
最小间隔 2分钟 = 30 请求/小时
批量接口：1请求 = 25国
实际产能：30 × 25 = 750 国家同步/小时

```

---

**标准限流响应机制**当触发限流阈值时，Temu返回标准HTTP响应：
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1712102400
Retry-After: 60

```

---

**批量接口优先策略**
```python
# 推荐：批量接口（1次请求 = 25国）
result = api.call_api(
    method="temu.product.sync",
    body={"target_sites": [{"site": "DE", ...}, {"site": "FR", ...}, ...]}
)

```

---

**RPA兜底限速**
```python
class RPARateLimiter:
    """RPA限速器 - 最小间隔2分钟"""
    
    MIN_INTERVAL_SECONDS = 120  # 2分钟
    
    def __init__(self):
        self.last_operation_time = 0
    
    def can_execute(self) -> tuple[bool, int]:
        elapsed = time.time() - self.last_operation_time
        if elapsed < self.MIN_INTERVAL_SECONDS:
            return False, int(self.MIN_INTERVAL_SECONDS - elapsed)
        return True, 0

```

当API被封禁切换到影刀RPA时：
```python
class RPARateLimiter:
    """RPA限速器 - 每小时最多50个产品"""
    
    RPA_HOURLY_LIMIT = 50
    MIN_INTERVAL_SECONDS = 72  # 3600/50 = 72秒/产品
    
    def __init__(self):
        self.hourly_counter = 0
        self.hour_start = time.time()
        self.last_operation_time = 0
    
    def can_execute(self) -> tuple[bool, int]:
        """检查是否可执行，返回(是否可执行, 需等待秒数)"""
        now = time.time()
        
        # 检查小时限额
        if now - self.hour_start >= 3600:
            self.hourly_counter = 0
            self.hour_start = now
        
        if self.hourly_counter >= self.RPA_HOURLY_LIMIT:
            wait = 3600 - (now - self.hour_start)
            return False, int(wait)
        
        # 检查最小间隔（确保≥72秒）
        elapsed = now - self.last_operation_time
        if elapsed < self.MIN_INTERVAL_SECONDS:
            wait = self.MIN_INTERVAL_SECONDS - elapsed
            return False, int(wait)
        
        return True, 0
    
    def record_execution(self):
        """记录执行"""
        self.hourly_counter += 1
        self.last_operation_time = time.time()

```

#### 5.2.8 官方文档与平台入口
**开发者平台入口**

<lark-table rows="5" cols="3" header-row="true" column-widths="244,244,244"

  <lark-tr>
    <lark-td>
      平台类型
    </lark-td>
    <lark-td>
      适用范围
    </lark-td>
    <lark-td>
      官方网址
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      欧盟合作伙伴平台
    </lark-td>
    <lark-td>
      欧盟25国跨境/本地卖家
    </lark-td>
    <lark-td>
      [partner-eu.temu.com](https://partner-eu.temu.com)
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      美国合作伙伴平台
    </lark-td>
    <lark-td>
      美国站卖家
    </lark-td>
    <lark-td>
      [partner-us.temu.com](https://partner-us.temu.com)
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      全球合作伙伴平台
    </lark-td>
    <lark-td>
      墨西哥、日本等其他地区
    </lark-td>
    <lark-td>
      [partner.temu.com](https://partner.temu.com)
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      境内卖家平台
    </lark-td>
    <lark-td>
      中国大陆/香港注册卖家
    </lark-td>
    <lark-td>
      [partner.kuajingmaihuo.com](https://partner.kuajingmaihuo.com)
    </lark-td>
  </lark-tr>
</lark-table>

**开发者文档直达链接**
- **通用API接口列表**：[https://partner.temu.com/documentation](https://partner.temu.com/documentation)
- **卖家授权指南**：[https://partner.temu.com/documentation?menu_code=38e79b35d2cb463d85619c1c786dd303](https://partner.temu.com/documentation?menu_code=38e79b35d2cb463d85619c1c786dd303)
- **多店铺管理文档**：在开发者平台搜索 "Multi-Shop Management" 或 "多店铺管理"
---

#### 5.2.9 实施检查清单
**API申请阶段**
- [ ] 在Temu Partner Platform注册开发者账号
- [ ] 创建1个"自研应用"（Self-developed App）
- [ ] 提交应用审核（通常1-3个工作日）
- [ ] 获取 App Key 和 App Secret
- [ ] 为每个店铺（最多5个）分别完成应用授权
- [ ] 记录各店铺的 Access Token 和 mall_id**开发阶段**
---

**Token生命周期管理**
```python
class TokenLifecycleManager:
    """Token生命周期管理"""
    
    TOKEN_REFRESH_DAYS = 80  # 提前10天刷新
    
    def check_and_refresh(self):
        """检查并刷新即将过期的Token"""
        for shop in self.config['shops']:
            expires_at = datetime.fromisoformat(shop['expires_at'].replace('Z', '+00:00'))
            days_until_expire = (expires_at - datetime.now(timezone.utc)).days
            
            if days_until_expire <= self.TOKEN_REFRESH_DAYS:
                logger.info(f"店铺 {shop['shop_name']} Token将在 {days_until_expire} 天后过期，准备刷新")
                self._refresh_shop_token(shop['shop_id'])
    
    def _refresh_shop_token(self, shop_id: str):
        """刷新指定店铺的Token"""
        # 调用Temu Token刷新接口
        # 更新 config 中的 access_token 和 expires_at
        pass

```

### 5.3 飞书指令设计

<lark-table rows="5" cols="4" header-row="true" column-widths="95,163,410,152"

  <lark-tr>
    <lark-td>
      指令
    </lark-td>
    <lark-td>
      功能
    </lark-td>
    <lark-td>
      示例
    </lark-td>
    <lark-td>
      优先级
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      同步Temu
    </lark-td>
    <lark-td>
      同步指定产品
    </lark-td>
    <lark-td>
      `@openclaw 同步Temu SKU-001,SKU-002 到 欧盟25国`
    </lark-td>
    <lark-td>
      P0
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      同步全部
    </lark-td>
    <lark-td>
      同步所有待同步产品
    </lark-td>
    <lark-td>
      `@openclaw 同步Temu 全部待同步 到 德国,法国`
    </lark-td>
    <lark-td>
      P1（待定）
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      查询状态
    </lark-td>
    <lark-td>
      查询产品同步状态
    </lark-td>
    <lark-td>
      `@openclaw 查询Temu SKU-001 状态`
    </lark-td>
    <lark-td>
      P2（待定）
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      回滚
    </lark-td>
    <lark-td>
      回滚到历史版本
    </lark-td>
    <lark-td>
      `@openclaw 回滚 Temu SKU-001 到 昨天`
    </lark-td>
    <lark-td>
      P3（待定）
    </lark-td>
  </lark-tr>
</lark-table>

---

## 六、核心功能实现（首版）
### 6.1 首版功能范围
**用户输入**：Temu产品ID列表（如 `1234567890, 1234567891, 1234567892`）
**系统自动处理**：
1. 根据ID自动查询产品状态和所属店铺
1. 判断是否可以同步到欧盟24国
1. 可同步则执行同步，不可同步则记录原因并跳过
1. 按用户提供的ID顺序依次执行
1. 输出表格形式的完成情况报告
**核心流程**：
```plaintext
用户输入: ID1, ID2, ID3, ID4, ID5...
    ↓
[循环处理每个ID]
    ↓
┌─────────────────────────────────────────┐
│ 1. 查询产品信息                          │
│    - 调用 temu.product.get 接口          │
│    - 获取: 店铺ID、当前状态、所在站点     │
│    - 自动匹配 App Key 和 Access Token    │
│    ↓                                     │
│ 2. 判断可同步性                          │
│    ✅ 已通过核价 + 德国站 → 可同步24国    │
│    ❌ 核价中 → 跳过，记录"核价中"         │
│    ❌ 已拒绝 → 跳过，记录"核价被拒"       │
│    ❌ 非德国站 → 跳过，记录"非德国站源"   │
│    ❌ 产品不存在 → 跳过，记录"产品不存在" │
│    ↓                                     │
│ 3. 执行同步（如可同步）                   │
│    - 查询飞书表格获取24国价格/库存        │
│    - 调用批量同步接口                     │
│    - 记录同步结果                         │
│    ↓                                     │
│ 4. 记录结果                              │
│    - 成功: 记录同步时间和目标国家         │
│    - 失败: 记录错误原因                   │
└─────────────────────────────────────────┘
    ↓
[所有ID处理完成]
    ↓
输出: 表格形式完成情况报告

```

---

### 6.2 产品信息查询与店铺匹配
**自动匹配逻辑**：
```python
class ProductInfoResolver:
    """产品信息解析器 - 自动匹配店铺和Token"""
    
    def __init__(self, shop_config: dict):
        """
        shop_config: {
            "app_key": "xxx",
            "app_secret": "xxx",
            "shops": [
                {"shop_id": "shop_A", "mall_id": "10001", "token": "token_A"},
                {"shop_id": "shop_B", "mall_id": "10002", "token": "token_B"},
                ...
            ]
        }
        """
        self.config = shop_config
        self.shop_map = {s['mall_id']: s for s in shop_config['shops']}
    
    def resolve_product(self, product_id: str) -> dict:
        """
        查询产品信息并自动匹配店铺
        
        Returns:
            {
                "product_id": "1234567890",
                "found": True/False,
                "shop_id": "shop_A",
                "mall_id": "10001",
                "access_token": "token_A",
                "current_site": "DE",
                "pricing_status": "approved",  # approved/rejected/pending
                "syncable": True/False,
                "reason": "可同步" / "核价中" / ...
            }
        """
        # 轮询各店铺查询产品
        for shop in self.config['shops']:
            try:
                result = self._query_product(product_id, shop)
                if result['found']:
                    return self._analyze_syncability(result, shop)
            except Exception as e:
                continue
        
        return {
            "product_id": product_id,
            "found": False,
            "syncable": False,
            "reason": "产品不存在"
        }
    
    def _query_product(self, product_id: str, shop: dict) -> dict:
        """查询单个店铺中的产品"""
        response = call_temu_api(
            method="temu.product.get",
            params={"product_id": product_id},
            shop_token=shop['access_token']
        )
        
        if response['code'] == 0:
            data = response['data']
            return {
                "found": True,
                "product_id": product_id,
                "mall_id": shop['mall_id'],
                "title": data.get('title'),
                "current_site": data.get('site'),  # DE/FR/US等
                "pricing_status": data.get('pricing_status'),  # approved/pending/rejected
                "can_sync_to_eu": data.get('can_sync_to_eu', False),
                "existing_sites": data.get('existing_sites', [])  # 已同步的站点
            }
        elif response['code'] == 2001:
            return {"found": False}
        else:
            raise APIError(response['message'])
    
    def _analyze_syncability(self, product_info: dict, shop: dict) -> dict:
        """分析产品是否可同步到欧盟24国"""
        result = {
            "product_id": product_info['product_id'],
            "found": True,
            "shop_id": shop['shop_id'],
            "mall_id": shop['mall_id'],
            "access_token": shop['access_token'],
            "title": product_info['title'],
            "current_site": product_info['current_site'],
            "pricing_status": product_info['pricing_status'],
            "existing_sites": product_info['existing_sites']
        }
        
        # 判断逻辑
        if product_info['current_site'] != 'DE':
            result['syncable'] = False
            result['reason'] = f"非德国站源（当前：{product_info['current_site']}）"
        elif product_info['pricing_status'] == 'pending':
            result['syncable'] = False
            result['reason'] = "核价中"
        elif product_info['pricing_status'] == 'rejected':
            result['syncable'] = False
            result['reason'] = "核价被拒"
        elif product_info['pricing_status'] == 'approved':
            result['syncable'] = True
            result['reason'] = "可同步"
            # 计算还需同步的国家
            eu_countries = ['FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PL', 'SE', 'DK', 'FI', 
                           'NO', 'IE', 'PT', 'GR', 'CZ', 'HU', 'SK', 'SI', 'HR', 'BG', 
                           'RO', 'LT', 'LV', 'EE']
            result['target_countries'] = [c for c in eu_countries if c not in product_info['existing_sites']]
            result['already_synced'] = [c for c in eu_countries if c in product_info['existing_sites']]
        else:
            result['syncable'] = False
            result['reason'] = f"未知状态: {product_info['pricing_status']}"
        
        return result

```

---

### 6.3 同步执行流程
**主执行器**：
```python
class TemuSyncExecutor:
    """Temu同步执行器（首版）"""
    
    def __init__(self, shop_config: dict, bitable_config: dict):
        self.resolver = ProductInfoResolver(shop_config)
        self.bitable = BitableClient(bitable_config)
        self.queue = GlobalTaskQueue(min_interval=120)
        self.results = []
    
    def execute_sync(self, product_ids: list) -> list:
        """
        执行同步（按用户提供的ID顺序）
        
        Args:
            product_ids: 用户输入的ID列表，如 ['123', '456', '789']
        
        Returns:
            每个ID的执行结果列表
        """
        print(f"开始处理 {len(product_ids)} 个产品...")
        
        for idx, product_id in enumerate(product_ids, 1):
            print(f"\n[{idx}/{len(product_ids)}] 处理产品: {product_id}")
            
            # 1. 查询产品信息
            product_info = self.resolver.resolve_product(product_id)
            
            if not product_info['found']:
                self._record_result(product_id, "跳过", "产品不存在")
                continue
            
            print(f"  找到产品: {product_info.get('title', 'N/A')}")
            print(f"  所属店铺: {product_info['shop_id']}")
            print(f"  当前状态: {product_info['pricing_status']}")
            
            # 2. 判断是否可同步
            if not product_info['syncable']:
                self._record_result(
                    product_id, 
                    "跳过", 
                    product_info['reason'],
                    shop_id=product_info['shop_id']
                )
                print(f"  ⚠️ 跳过原因: {product_info['reason']}")
                continue
            
            # 3. 查询飞书表格获取价格/库存
            print(f"  查询飞书表格...")
            product_data = self.bitable.get_product_data(product_id)
            
            if not product_data:
                self._record_result(
                    product_id,
                    "失败",
                    "飞书表格中无此产品数据",
                    shop_id=product_info['shop_id']
                )
                continue
            
            # 4. 提交同步任务到队列
            print(f"  提交同步任务（目标: {len(product_info['target_countries'])} 国）...")
            task = {
                "product_id": product_id,
                "shop_id": product_info['shop_id'],
                "access_token": product_info['access_token'],
                "target_countries": product_info['target_countries'],
                "prices": {c: product_data[f'{c}_价格'] for c in product_info['target_countries']},
                "stocks": {c: product_data[f'{c}_库存'] for c in product_info['target_countries']}
            }
            
            # 5. 等待并执行（首版同步执行，后续可改为异步）
            sync_result = self._execute_sync_task(task)
            
            # 6. 记录结果
            if sync_result['success']:
                self._record_result(
                    product_id,
                    "成功",
                    f"已同步至 {len(sync_result['synced_countries'])} 国",
                    shop_id=product_info['shop_id'],
                    countries=sync_result['synced_countries'],
                    duration=sync_result['duration']
                )
                print(f"  ✅ 同步成功: {len(sync_result['synced_countries'])} 国")
            else:
                self._record_result(
                    product_id,
                    "失败",
                    sync_result['error'],
                    shop_id=product_info['shop_id']
                )
                print(f"  ❌ 同步失败: {sync_result['error']}")
            
            # 7. 遵守最小间隔（2分钟）
            if idx < len(product_ids):
                wait_time = 120  # 2分钟
                print(f"  等待 {wait_time} 秒...")
                time.sleep(wait_time)
        
        return self.results
    
    def _execute_sync_task(self, task: dict) -> dict:
        """执行单个同步任务"""
        start_time = time.time()
        
        try:
            # 构建批量同步请求
            target_sites = []
            for country in task['target_countries']:
                target_sites.append({
                    "site": country,
                    "price": task['prices'][country],
                    "currency": self._get_currency(country),
                    "stock": task['stocks'][country]
                })
            
            response = call_temu_api(
                method="temu.product.sync",
                params={"product_id": task['product_id']},
                body={"target_sites": target_sites},
                shop_token=task['access_token']
            )
            
            duration = time.time() - start_time
            
            if response['code'] == 0:
                return {
                    "success": True,
                    "synced_countries": task['target_countries'],
                    "duration": round(duration, 2)
                }
            else:
                return {
                    "success": False,
                    "error": f"API错误: {response.get('message', 'Unknown')}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _record_result(self, product_id: str, status: str, message: str, 
                       shop_id: str = "-", countries: list = None, duration: float = None):
        """记录执行结果"""
        self.results.append({
            "product_id": product_id,
            "shop_id": shop_id,
            "status": status,  # 成功/失败/跳过
            "message": message,
            "countries": countries or [],
            "duration": duration,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
    
    def _get_currency(self, country: str) -> str:
        """获取国家货币"""
        currency_map = {
            'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
            'BE': 'EUR', 'AT': 'EUR', 'PL': 'PLN', 'SE': 'SEK', 'DK': 'DKK',
            'FI': 'EUR', 'NO': 'NOK', 'IE': 'EUR', 'PT': 'EUR', 'GR': 'EUR',
            'CZ': 'CZK', 'HU': 'HUF', 'SK': 'EUR', 'SI': 'EUR', 'HR': 'EUR',
            'BG': 'BGN', 'RO': 'RON', 'LT': 'EUR', 'LV': 'EUR', 'EE': 'EUR'
        }
        return currency_map.get(country, 'EUR')

```

---

### 6.4 报告生成
**表格形式报告**：
```python
class ReportGenerator:
    """报告生成器"""
    
    def generate_report(self, results: list) -> str:
        """生成表格形式报告"""
        
        # 统计
        total = len(results)
        success = len([r for r in results if r['status'] == '成功'])
        failed = len([r for r in results if r['status'] == '失败'])
        skipped = len([r for r in results if r['status'] == '跳过'])
        
        report = []
        report.append("=" * 80)
        report.append("Temu欧盟24国同步 - 执行报告")
        report.append("=" * 80)
        report.append(f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # 汇总统计
        report.append("【汇总统计】")
        report.append(f"  总计: {total} 个产品")
        report.append(f"  ✅ 成功: {success} 个")
        report.append(f"  ❌ 失败: {failed} 个")
        report.append(f"  ⏭️  跳过: {skipped} 个")
        report.append("")
        
        # 详细表格
        report.append("【详细结果】")
        report.append("")
        report.append(f"{'序号':<4} {'产品ID':<12} {'店铺':<10} {'状态':<6} {'同步国家':<8} {'耗时':<8} {'说明'}")
        report.append("-" * 80)
        
        for idx, r in enumerate(results, 1):
            countries_str = f"{len(r['countries'])}国" if r['countries'] else "-"
            duration_str = f"{r['duration']:.1f}s" if r['duration'] else "-"
            shop_str = r['shop_id'][:8] if r['shop_id'] != '-' else '-'
            
            status_icon = {"成功": "✅", "失败": "❌", "跳过": "⏭️"}.get(r['status'], "❓")
            
            report.append(
                f"{idx:<4} {r['product_id']:<12} {shop_str:<10} "
                f"{status_icon} {r['status']:<4} {countries_str:<8} "
                f"{duration_str:<8} {r['message']}"
            )
        
        report.append("-" * 80)
        report.append("")
        
        # 失败/跳过详情
        if failed > 0:
            report.append("【失败详情】")
            for r in results:
                if r['status'] == '失败':
                    report.append(f"  • {r['product_id']}: {r['message']}")
            report.append("")
        
        if skipped > 0:
            report.append("【跳过详情】")
            for r in results:
                if r['status'] == '跳过':
                    report.append(f"  • {r['product_id']}: {r['message']}")
            report.append("")
        
        report.append("=" * 80)
        
        return "\n".join(report)


# 使用示例
executor = TemuSyncExecutor(shop_config, bitable_config)
results = executor.execute_sync(['1234567890', '1234567891', '1234567892'])

report = ReportGenerator().generate_report(results)
print(report)

```

**报告输出示例**：
```plaintext
================================================================================
Temu欧盟24国同步 - 执行报告
================================================================================
生成时间: 2026-04-03 14:30:25

【汇总统计】
  总计: 5 个产品
  ✅ 成功: 2 个
  ❌ 失败: 1 个
  ⏭️  跳过: 2 个

【详细结果】

序号 产品ID       店铺       状态   同步国家 耗时     说明
--------------------------------------------------------------------------------
1    1234567890   shop_A     ✅ 成功  24国     3.2s     已同步至 24 国
2    1234567891   shop_B     ⏭️ 跳过  -        -        核价中
3    1234567892   shop_A     ✅ 成功  20国     2.8s     已同步至 20 国 (4国已存在)
4    1234567893   shop_C     ⏭️ 跳过  -        -        非德国站源（当前：FR）
5    1234567894   shop_B     ❌ 失败  -        -        API错误: Rate limit exceeded
--------------------------------------------------------------------------------

【失败详情】
  • 1234567894: API错误: Rate limit exceeded

【跳过详情】
  • 1234567891: 核价中
  • 1234567893: 非德国站源（当前：FR）

================================================================================

```

---

### 6.5 飞书指令设计（首版）

<lark-table rows="2" cols="3" header-row="true" column-widths="244,244,244"

  <lark-tr>
    <lark-td>
      指令
    </lark-td>
    <lark-td>
      功能
    </lark-td>
    <lark-td>
      示例
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      `同步Temu`
    </lark-td>
    <lark-td>
      同步指定ID列表
    </lark-td>
    <lark-td>
      `@openclaw 同步Temu 1234567890,1234567891,1234567892`
    </lark-td>
  </lark-tr>
</lark-table>

**执行流程**：
```plaintext
用户: @openclaw 同步Temu 1234567890,1234567891,1234567892

小乔:
收到，开始处理 3 个产品...
[1/3] 查询产品 1234567890... 找到，店铺A，可同步，开始同步...
[2/3] 查询产品 1234567891... 找到，店铺B，核价中，跳过
[3/3] 查询产品 1234567892... 找到，店铺A，可同步，开始同步...

处理完成！

================================================================================
Temu欧盟24国同步 - 执行报告
================================================================================
生成时间: 2026-04-03 14:30:25

【汇总统计】
  总计: 3 个产品
  ✅ 成功: 2 个
  ⏭️  跳过: 1 个

【详细结果】
序号 产品ID       店铺       状态   同步国家 耗时     说明
--------------------------------------------------------------------------------
1    1234567890   shop_A     ✅ 成功  24国     3.2s     已同步至 24 国
2    1234567891   shop_B     ⏭️ 跳过  -        -        核价中
3    1234567892   shop_A     ✅ 成功  24国     2.9s     已同步至 24 国
--------------------------------------------------------------------------------

【跳过详情】
  • 1234567891: 核价中

================================================================================

```

---

### 6.6 首版配置要求
**配置文件结构**：
```json
{
  "temu": {
    "app_key": "your_app_key",
    "app_secret": "your_app_secret",
    "endpoint": "https://openapi-b-eu.temu.com/openapi/router"
  },
  "shops": [
    {
      "shop_id": "shop_A",
      "mall_id": "10001",
      "shop_name": "店铺A-主店",
      "access_token": "token_xxxxxxxx",
      "refresh_token": "refresh_xxxxxx",
      "expires_at": "2026-06-30T23:59:59Z"
    },
    {
      "shop_id": "shop_B",
      "mall_id": "10002",
      "shop_name": "店铺B-副店1",
      "access_token": "token_yyyyyyyy",
      "refresh_token": "refresh_yyyyyy",
      "expires_at": "2026-06-30T23:59:59Z"
    }
  ],
  "bitable": {
    "app_token": "bitable_token",
    "table_id": "tbl_xxxxxx",
    "view_id": "vew_xxxxxx"
  },
  "sync": {
    "min_interval_seconds": 120,
    "batch_size": 25,
    "retry_times": 3
  }
}

```

---

## 七、异常处理（首版）
### 7.1 异常分类与处理

<lark-table rows="9" cols="3" header-row="true" column-widths="244,244,244"

  <lark-tr>
    <lark-td>
      异常类型
    </lark-td>
    <lark-td>
      场景
    </lark-td>
    <lark-td>
      处理策略
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      产品不存在
    </lark-td>
    <lark-td>
      查询返回2001
    </lark-td>
    <lark-td>
      跳过，记录"产品不存在"
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      核价中
    </lark-td>
    <lark-td>
      pricing_status=pending
    </lark-td>
    <lark-td>
      跳过，记录"核价中"
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      核价被拒
    </lark-td>
    <lark-td>
      pricing_status=rejected
    </lark-td>
    <lark-td>
      跳过，记录"核价被拒"
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      非德国站
    </lark-td>
    <lark-td>
      current_site != DE
    </lark-td>
    <lark-td>
      跳过，记录当前站点
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      API限流
    </lark-td>
    <lark-td>
      返回429
    </lark-td>
    <lark-td>
      等待2分钟后重试，最多3次
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      Token过期
    </lark-td>
    <lark-td>
      返回1003
    </lark-td>
    <lark-td>
      标记店铺失效，通知人工
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      飞书无数据
    </lark-td>
    <lark-td>
      表格查不到产品
    </lark-td>
    <lark-td>
      失败，记录"飞书无数据"
    </lark-td>
  </lark-tr>
  <lark-tr>
    <lark-td>
      网络异常
    </lark-td>
    <lark-td>
      连接超时
    </lark-td>
    <lark-td>
      重试3次，间隔5秒
    </lark-td>
  </lark-tr>
</lark-table>

### 7.2 重试机制
```python
def execute_with_retry(func, max_retries=3, delay=120):
    """带重试的执行"""
    for attempt in range(max_retries):
        try:
            return func()
        except RateLimitError:
            if attempt < max_retries - 1:
                print(f"触发限流，等待 {delay} 秒后重试...")
                time.sleep(delay)
            else:
                raise
        except NetworkError:
            if attempt < max_retries - 1:
                time.sleep(5)
            else:
                raise

```

---

## 八、附录
### 附录A：欧盟24国列表
```python
EU_COUNTRIES = [
    'FR',  # 法国
    'IT',  # 意大利
    'ES',  # 西班牙
    'NL',  # 荷兰
    'BE',  # 比利时
    'AT',  # 奥地利
    'PL',  # 波兰
    'SE',  # 瑞典
    'DK',  # 丹麦
    'FI',  # 芬兰
    'NO',  # 挪威
    'IE',  # 爱尔兰
    'PT',  # 葡萄牙
    'GR',  # 希腊
    'CZ',  # 捷克
    'HU',  # 匈牙利
    'SK',  # 斯洛伐克
    'SI',  # 斯洛文尼亚
    'HR',  # 克罗地亚
    'BG',  # 保加利亚
    'RO',  # 罗马尼亚
    'LT',  # 立陶宛
    'LV',  # 拉脱维亚
    'EE',  # 爱沙尼亚
]

```

### 附录B：货币映射
```python
CURRENCY_MAP = {
    'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
    'BE': 'EUR', 'AT': 'EUR', 'FI': 'EUR', 'IE': 'EUR', 'PT': 'EUR',
    'GR': 'EUR', 'SK': 'EUR', 'SI': 'EUR', 'HR': 'EUR', 'LT': 'EUR',
    'LV': 'EUR', 'EE': 'EUR',
    'PL': 'PLN', 'SE': 'SEK', 'DK': 'DKK', 'NO': 'NOK',
    'CZ': 'CZK', 'HU': 'HUF', 'BG': 'BGN', 'RO': 'RON'
}

```

---

**文档结束**
*版本：v1.1 首版实现更新时间：2026-04-03作者：OpenClaw AI Assistant*
*版本：v1.0 FINAL更新时间：2026-03-31作者：OpenClaw AI Assistant*
