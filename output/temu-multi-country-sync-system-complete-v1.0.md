# Temu 多国家同步上架系统 - 技术规划方案

> 面试准备文档 | 规划时间：2026-03-31  
> 业务规模：日均100+产品，预期增长至1000+

---

## 一、需求拆解

### 1.1 核心业务流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  德国站上架  │ → │  平台核价   │ → │  获取商品ID │ → │ 同步24个欧盟 │
│  (建议100€) │    │  (24-48h)   │    │  (唯一标识) │    │    国家     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        飞书表格 (价格/库存管理)                       │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐          │
│  │ 产品标签  │  德国    │  法国    │  英国    │  捷克    │ ...      │
│  │ (内部ID)  │  (EUR)   │  (EUR)   │  (GBP)   │  (CZK)   │          │
│  ├──────────┼──────────┼──────────┼──────────┼──────────┤          │
│  │ SKU-001  │  50€     │  55€     │  £45     │  1200    │          │
│  │ SKU-002  │  60€     │  65€     │  £52     │  1450    │          │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 关键约束条件

| 约束项 | 说明 | 影响 |
|--------|------|------|
| **多账号** | 一人多店铺账号，需切换 | 需要账号隔离、状态管理 |
| **多货币** | EUR/GBP/CZK等 | 需要汇率转换或固定价格表 |
| **核价周期** | 24-48小时 | 异步处理，需要状态追踪 |
| **封号风险** | 平台有反自动化检测 | 需要行为模拟、频率控制 |
| **商品ID** | 德国站ID作为源，同步其他国家 | ID映射关系管理 |

---

## 二、方案对比分析

### 2.1 方案总览

| 方案 | 自动化程度 | 封号风险 | 开发成本 | 维护成本 | 适用规模 |
|------|-----------|----------|----------|----------|----------|
| **E. 官方API** ⭐首选 | 高 | **无** | 低 | 低 | **所有规模** |
| **B. RPA工具** | 高 | 中 | 低 | 中 | 100-500/天 |
| **C. 半自动辅助** | 中 | 低 | 低 | 低 | 100-300/天 |
| **D. 云手机集群** | 高 | 低 | 高 | 中 | 500+/天 |
| **A. 浏览器自动化** | 高 | 高 | 中 | 高 | 不建议 |

---

### 2.2 方案A：浏览器自动化 (Selenium/Playwright)

**技术栈**：Python + Playwright/Selenium + stealth插件

**实现思路**：
```python
# 伪代码示意
class TemuAutomation:
    def __init__(self, account):
        self.browser = playwright.chromium.launch(
            headless=False,  # 有头模式降低检测
            args=['--disable-blink-features=AutomationControlled']
        )
        self.context = self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='真实浏览器UA'
        )
    
    def login(self, credentials):
        # 模拟真人登录流程
        page = self.context.new_page()
        page.goto('https://seller.temu.com')
        # 随机延迟 + 模拟鼠标移动
        self.human_like_typing(page, '#username', credentials['user'])
        self.human_like_typing(page, '#password', credentials['pass'])
        page.click('#login-btn')
    
    def sync_product(self, product_id, target_countries):
        for country in target_countries:
            self.switch_country(country)
            self.fill_price_from_sheet(product_id, country)
            self.fill_stock_from_sheet(product_id, country)
            self.submit_sync()
            self.random_delay(3, 8)  # 随机延迟防检测
```

**优点**：
- 完全自动化，效率最高
- 灵活性最强，可处理复杂交互
- 开发成熟，社区资源丰富

**缺点**：
- **封号风险高**：Temu底层是拼多多技术栈，有完善的风控检测
- 需要处理验证码、滑块等反爬机制
- 平台更新UI时需同步维护脚本
- 多账号需要独立浏览器环境，资源消耗大

**风险缓解措施**：
- 使用 stealth 插件隐藏自动化特征
- 添加随机延迟（3-10秒）
- 模拟真人鼠标移动轨迹
- 限制每小时操作次数（<50次/小时）
- 使用住宅IP代理

**综合评分**：⭐⭐ (2/5) - 风险过高，不建议

---

### 2.3 方案B：RPA工具 (影刀/八爪鱼/UiBot)

**技术栈**：影刀RPA / 八爪鱼采集器 / UiBot

**实现思路**：
```
影刀RPA流程设计：
1. 启动Chrome → 打开Temu卖家中心
2. 条件判断：检查当前登录账号
   └─ 如不匹配 → 切换账号（清除Cookie重新登录）
3. 读取飞书表格数据（通过API或Excel导出）
4. 循环：对每个待同步产品
   ├─ 打开德国站商品详情
   ├─ 点击"同步到其他站点"
   ├─ 选择目标国家（勾选24国）
   ├─ 对每个国家：
   │   ├─ 读取表格中的价格
   │   ├─ 读取表格中的库存
   │   ├─ 填入对应字段
   │   └─ 随机延迟2-5秒
   └─ 提交同步
5. 记录同步结果到日志
```

**优点**：
- 低代码/无代码，开发速度快（1-2天）
- 内置防检测机制（随机延迟、鼠标模拟）
- 可视化流程，易于调试
- 社区版免费或低成本

**缺点**：
- 灵活性不如代码方案
- 复杂逻辑处理受限
- 仍需注意操作频率，否则仍有封号风险
- 软件依赖（需安装RPA客户端）

**推荐工具对比**：

| 工具 | 价格 | 易用性 | 功能 | 推荐度 |
|------|------|--------|------|--------|
| **影刀RPA** | 免费版够用 | ⭐⭐⭐⭐⭐ | 丰富 | ⭐⭐⭐⭐⭐ |
| **八爪鱼** | 付费 | ⭐⭐⭐⭐ | 中等 | ⭐⭐⭐⭐ |
| **UiBot** | 付费 | ⭐⭐⭐ | 丰富 | ⭐⭐⭐ |

**综合评分**：⭐⭐⭐⭐ (4/5) - 平衡了效率与风险

---

### 2.4 方案C：半自动辅助工具

**技术栈**：Python + 飞书API + 浏览器插件/Bookmarklet

**实现思路**：
```
系统架构：
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   飞书表格      │ ←──→ │   辅助工具      │ ←──→ │   浏览器        │
│  (价格/库存)    │      │  (数据准备)     │      │  (人工操作)     │
└─────────────────┘      └─────────────────┘      └─────────────────┘

工作流程：
1. 工具读取飞书表格，按账号分组整理待同步产品
2. 生成"今日任务清单"（产品ID + 目标国家 + 价格 + 库存）
3. 人工登录Temu → 打开德国站商品
4. 点击浏览器插件 → 自动填充当前产品的各国价格/库存
5. 人工点击提交
6. 工具记录完成状态，生成报表
```

**技术实现**：
```python
# 数据准备工具
class TemuHelper:
    def __init__(self, feishu_token):
        self.feishu = FeishuAPI(token)
    
    def prepare_daily_tasks(self, account):
        # 从飞书读取今日待同步产品
        products = self.feishu.read_sheet('产品价格表')
        # 按账号分组
        tasks = [p for p in products if p['账号'] == account and p['状态'] == '待同步']
        return tasks
    
    def generate_fill_script(self, product):
        # 生成浏览器注入脚本
        script = f"""
        (function() {{
            const prices = {json.dumps(product['prices'])};
            const stocks = {json.dumps(product['stocks'])};
            // 自动填充表单逻辑
            Object.keys(prices).forEach(country => {{
                fillPrice(country, prices[country]);
                fillStock(country, stocks[country]);
            }});
        }})();
        """
        return script
```

**优点**：
- **封号风险最低**：人工操作主体，工具只辅助填数据
- 开发简单（1天内完成）
- 无需维护复杂的自动化流程
- 可随时调整，灵活应对平台变化

**缺点**：
- 效率不如全自动（需人工点击提交）
- 无法完全无人值守
- 人力成本随规模增长

**效率估算**：
- 熟练操作后：2-3分钟/产品
- 100个产品：3-5小时/天
- 500个产品：15-25小时/天（需多人）

**综合评分**：⭐⭐⭐ (3/5) - 安全但效率有限

---

### 2.5 方案D：云手机集群

**技术栈**：云手机服务（红手指/双子星/爱云兔）+ 自动化脚本

**实现思路**：
```
架构设计：
┌─────────────────────────────────────────────────────────────┐
│                      控制服务器                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  任务调度器  │  │  账号管理   │  │  日志监控   │         │
│  └──────┬──────┘  └─────────────┘  └─────────────┘         │
└─────────┼───────────────────────────────────────────────────┘
          │
    ┌─────┴─────┬─────────────┬─────────────┐
    ↓           ↓             ↓             ↓
┌───────┐  ┌───────┐    ┌───────┐    ┌───────┐
│云手机1│  │云手机2│    │云手机3│... │云手机N│  ← 每个对应一个账号
│账号A  │  │账号B  │    │账号C  │    │账号X  │
└───────┘  └───────┘    └───────┘    └───────┘
```

**工作流程**：
1. 每个云手机独立运行一个Temu账号
2. 控制服务器分配任务到各云手机
3. 云手机内运行自动化脚本（Auto.js/Appium）
4. 独立IP + 独立设备指纹，降低关联风险

**优点**：
- **封号风险最低**：独立设备环境，平台难以检测
- 可并行处理多账号
- 接近真人操作环境

**缺点**：
- **成本最高**：云手机租赁费（约20-50元/月/台）
- 架构复杂，维护成本高
- 需要学习云手机自动化技术

**成本估算**（10个账号）：
- 云手机租赁：20元/月 × 10 = 200元/月
- 服务器：100元/月
- 开发维护：一次性投入高

**综合评分**：⭐⭐⭐ (3/5) - 安全但成本高

---

### 2.6 方案E：官方API (已确认可行 ⭐首选)

**技术栈**：Temu Open Platform API + Python/Node.js

**官方平台信息**：
| 项目 | 详情 |
|------|------|
| **EU版入口** | https://partner-eu.temu.com/ |
| **US版入口** | https://partner-us.temu.com/ |
| **Global版** | https://partner.temu.com/ |
| **API文档** | 完整覆盖授权、商品、订单、库存 |
| **已有对接** | 通途ERP、店小蜜、Synctify OMS等 |

**核心API能力**（根据官方文档）：
- `Seller Authorization` - 卖家授权管理
- `Product API` - 商品查询、创建、更新、同步
- `Order Management` - 订单管理
- `Inventory Management` - 库存管理
- `Price Management` - 价格管理
- `Product Listing/Delisting` - 上下架管理

**实现思路**：
```python
import requests
import hashlib
import time
import json

class TemuAPIClient:
    def __init__(self, app_key, app_secret, access_token, region='EU'):
        self.app_key = app_key
        self.app_secret = app_secret
        self.access_token = access_token
        self.region = region
        self.base_url = 'https://openapi-b-eu.temu.com/openapi/router' if region == 'EU' else 'https://openapi-b.temu.com/openapi/router'
    
    def generate_sign(self, params, body):
        """生成API签名（根据Temu文档）"""
        # 按Temu签名规则：app_key + timestamp + params + body + app_secret
        timestamp = str(int(time.time()))
        sign_str = f"{self.app_key}{timestamp}{json.dumps(params)}{json.dumps(body)}{self.app_secret}"
        return hashlib.md5(sign_str.encode()).hexdigest()
    
    def call_api(self, method, params, body):
        """调用Temu API"""
        timestamp = str(int(time.time()))
        sign = self.generate_sign(params, body)
        
        headers = {
            'Content-Type': 'application/json',
            'X-App-Key': self.app_key,
            'X-Timestamp': timestamp,
            'X-Sign': sign,
            'X-Access-Token': self.access_token
        }
        
        response = requests.post(
            self.base_url,
            headers=headers,
            json={
                'method': method,
                'params': params,
                'body': body
            }
        )
        return response.json()
    
    def get_product_list(self, status='approved'):
        """获取商品列表"""
        return self.call_api(
            'temu.product.list',
            {'status': status},
            {}
        )
    
    def sync_product_to_countries(self, product_id, country_configs):
        """
        同步商品到多个国家
        country_configs: {
            'FR': {'price': 55, 'stock': 100},
            'UK': {'price': 45, 'stock': 100},
            ...
        }
        """
        results = {}
        for country, config in country_configs.items():
            result = self.call_api(
                'temu.product.sync',
                {'product_id': product_id, 'target_country': country},
                {
                    'price': config['price'],
                    'stock': config['stock'],
                    'currency': self.get_currency(country)
                }
            )
            results[country] = result
        return results
    
    def get_currency(self, country):
        """根据国家代码获取货币"""
        currency_map = {
            'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR',
            'UK': 'GBP', 'CZ': 'CZK', 'PL': 'PLN', ...
        }
        return currency_map.get(country, 'EUR')

# 使用示例
client = TemuAPIClient(
    app_key='your_app_key',
    app_secret='your_app_secret',
    access_token='your_access_token',
    region='EU'
)

# 1. 获取德国站已核价通过的商品
products = client.get_product_list(status='approved')

# 2. 从飞书表格读取价格配置
feishu_data = read_feishu_sheet()

# 3. 批量同步到24个欧盟国家
for product in products:
    sku = product['sku']
    product_id = product['product_id']
    
    # 从飞书表格获取该SKU的各国价格
    country_configs = {}
    for country in EU_COUNTRIES:
        price = feishu_data.get_price(sku, country)
        stock = feishu_data.get_stock(sku, country)
        country_configs[country] = {'price': price, 'stock': stock}
    
    # 调用API同步
    results = client.sync_product_to_countries(product_id, country_configs)
    log_sync_result(sku, results)
```

**API申请流程**：
1. 注册Temu Partner Platform账号
2. 创建应用，获取app_key和app_secret
3. 引导卖家授权（获取access_token）
4. 接入沙盒环境测试
5. 上线生产环境

**优点**：
- **✅ 无封号风险**：官方接口，合法合规
- **✅ 效率最高**：纯API调用，毫秒级响应，支持批量
- **✅ 维护成本最低**：接口稳定，无需适配UI变化
- **✅ 可扩展性强**：支持日均1000+产品无压力
- **✅ 多账号管理**：通过不同access_token隔离账号

**缺点**：
- 需要申请开发者资质（但已有通途等ERP对接，说明门槛不高）
- 需要引导卖家完成授权流程

**综合评分**：⭐⭐⭐⭐⭐ (5/5) - **首选方案**

---

### 2.7 方案对比总结（更新）

| 方案 | 推荐度 | 封号风险 | 开发周期 | 适用规模 | 备注 |
|------|--------|----------|----------|----------|------|
| **官方API** | ⭐⭐⭐⭐⭐ | 无 | 2-3天 | 所有规模 | **首选** |
| **影刀RPA** | ⭐⭐⭐⭐ | 中 | 1天 | 100-500/天 | API不可用时备选 |
| **半自动辅助** | ⭐⭐⭐ | 低 | 0.5天 | 100-300/天 | 兜底方案 |
| **云手机集群** | ⭐⭐⭐ | 低 | 3-5天 | 500+/天 | 成本过高 |
| **浏览器自动化** | ⭐⭐ | 高 | 2-3天 | 不建议 | 风险过高 |

**结论**：
1. **首选官方API**：无风险、高效率、长期可持续
2. **备选影刀RPA**：如API申请周期长，先用RPA过渡
3. **兜底半自动**：任何方案出问题都可切换

---

## 三、推荐方案（更新）

### 3.1 分阶段实施策略（基于API可行）

```
Phase 1 (立即启动)：申请Temu官方API
    ├─ 注册Partner Platform账号 (https://partner-eu.temu.com/)
    ├─ 创建应用，获取app_key/app_secret
    ├─ 开发API对接（2-3天）
    └─ 沙盒测试
    
Phase 2 (并行准备)：影刀RPA备选方案
    ↓ 如API申请周期长（>1周），RPA作为过渡
    
Phase 3 (上线后)：纯API运行
    ↓ 长期最优解，无风险高效率
```

### 3.2 最终推荐：官方API + RPA兜底

**核心架构**：
```
┌─────────────────────────────────────────────────────────────┐
│                      飞书表格 (主数据源)                      │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ 产品标签  │  账号    │  德国价  │  法国价  │  英国价  │  │
│  ├──────────┼──────────┼──────────┼──────────┼──────────┤  │
│  │ SKU-001  │  账号A   │  50€     │  55€     │  £45     │  │
│  │ SKU-002  │  账号B   │  60€     │  65€     │  £52     │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ 读取
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Temu Open Platform API (首选)                   │
│                                                             │
│  1. 多账号管理：每个Temu账号授权后获得独立access_token        │
│                                                             │
│  2. 查询德国站已核价商品：GET /product/list?status=approved  │
│                                                             │
│  3. 批量同步到24个欧盟国家：POST /product/sync               │
│     ├─ product_id: 德国站商品ID                             │
│     ├─ target_country: FR/IT/ES/UK/CZ...                    │
│     ├─ price: 从飞书表格读取                                │
│     ├─ stock: 从飞书表格读取                                │
│     └─ currency: EUR/GBP/CZK...                             │
│                                                             │
│  4. 记录同步结果到飞书表格                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           ↓                               ↓
┌─────────────────────┐         ┌─────────────────────┐
│   API方案 (主)       │         │   RPA方案 (备)       │
│   效率：1000+/天     │         │   效率：500/天       │
│   风险：无           │         │   风险：中           │
│   开发：2-3天        │         │   开发：1天          │
└─────────────────────┘         └─────────────────────┘
```

**API申请入口**：
- EU版：https://partner-eu.temu.com/
- US版：https://partner-us.temu.com/
- 文档：https://partner.temu.com/documentation

**参考实现**：通途ERP、店小秘、Synctify OMS 已成功对接

---

## 四、详细实施计划

### 4.1 技术依赖清单（API方案）

| 依赖项 | 用途 | 获取方式 | 状态 |
|--------|------|----------|------|
| **Temu Partner账号** | API接入 | https://partner-eu.temu.com/ | 待注册 |
| **app_key/secret** | API认证 | 创建应用后获得 | 待申请 |
| **飞书表格** | 价格/库存管理 | 用户已有 | ✅ 就绪 |
| **Python环境** | API调用开发 | 已安装 | ✅ 就绪 |
| **影刀RPA** | 备选方案 | 官网下载 | 待准备 |

### 4.2 API开发排期（6小时）

| 时间 | 任务 | 产出 |
|------|------|------|
| 0-1h | 注册Partner Platform，创建应用 | app_key/app_secret |
| 1-3h | 开发API客户端（签名、调用、错误处理） | Python SDK |
| 3-4h | 飞书表格集成（读取价格、更新状态） | 数据流打通 |
| 4-5h | 批量同步逻辑开发 | 核心功能完成 |
| 5-6h | 沙盒测试（5-10个产品） | 测试报告 |

---

## 五、面试Q&A更新

### Q1：Temu有官方API吗？
**A**：**有**。Temu Partner Platform 已开放API：
- 入口：https://partner-eu.temu.com/
- 能力：商品、订单、库存、价格管理
- 已有对接：通途ERP、店小秘等

### Q2：API方案和RPA方案怎么选？
**A**：
- **首选API**：无封号风险、效率高、长期可持续
- **RPA兜底**：API申请周期长时作为过渡
- **并行准备**：同时开发，降低风险

### Q3：多账号怎么管理？
**A**：
- API方案：每个账号独立access_token，切换时换token即可
- RPA方案：切换账号需清除Cookie重新登录

---

*文档更新时间：2026-03-31  
*版本：v1.1（确认API可行）

### 4.2 飞书表格设计

**表1：产品价格库存表**

| 字段 | 类型 | 说明 |
|------|------|------|
| 产品标签 | 文本 | 内部SKU，如"SKU-001" |
| Temu商品ID | 文本 | 德国站商品唯一ID |
| 所属账号 | 单选 | 账号A/账号B/账号C... |
| 同步状态 | 单选 | 待同步/已同步/失败 |
| 德国价格 | 数字 | EUR |
| 德国库存 | 数字 | 件 |
| 法国价格 | 数字 | EUR |
| 法国库存 | 数字 | 件 |
| 英国价格 | 数字 | GBP |
| 英国库存 | 数字 | 件 |
| ... | ... | 其他22国 |
| 最后同步时间 | 日期 | 自动记录 |
| 失败原因 | 文本 | 失败时记录 |

**表2：账号管理表**

| 字段 | 类型 | 说明 |
|------|------|------|
| 账号名称 | 文本 | 账号A、账号B... |
| 登录邮箱 | 文本 | Temu登录账号 |
| 登录密码 | 文本 | 加密存储 |
| 状态 | 单选 | 正常/异常/封禁 |
| 备注 | 文本 | 其他信息 |

### 4.3 影刀RPA流程设计

**主流程：批量同步产品**

```
开始
  ↓
读取飞书表格配置（账号、产品范围）
  ↓
启动Chrome → 打开Temu卖家中心
  ↓
检测当前登录账号
  ├─ 匹配 → 继续
  └─ 不匹配 → 切换账号流程
  ↓
循环：每个待同步产品
  ├─ 打开德国站商品详情
  ├─ 检查是否已有"同步到其他站点"按钮
  │   └─ 无 → 记录"未上架" → 跳过
  ├─ 点击"同步到其他站点"
  ├─ 勾选24个目标国家
  ├─ 循环：每个国家
  │   ├─ 读取飞书表格价格
  │   ├─ 读取飞书表格库存
  │   ├─ 填入价格字段
  │   ├─ 填入库存字段
  │   └─ 随机延迟(2,5)秒
  ├─ 点击"提交同步"
  ├─ 等待提交结果(10秒)
  ├─ 判断结果
  │   ├─ 成功 → 更新飞书"已同步"
  │   └─ 失败 → 更新飞书"失败"+记录原因
  └─ 随机延迟(5,10)秒（防检测）
  ↓
生成同步报表
  ↓
结束
```

**子流程：切换账号**

```
清除浏览器Cookie
  ↓
刷新页面 → 进入登录页
  ↓
从飞书表格读取账号密码
  ↓
模拟人工输入账号
  ↓
随机延迟(1,3)秒
  ↓
模拟人工输入密码
  ↓
随机延迟(1,3)秒
  ↓
点击登录按钮
  ↓
等待登录完成(10秒)
  ↓
检测是否登录成功
  ├─ 成功 → 返回主流程
  └─ 失败（如需验证码）→ 人工介入提示
```

### 4.4 风险防控措施

| 风险点 | 防控措施 | 实施方式 |
|--------|----------|----------|
| **操作频率过高** | 限制每小时操作次数 | 每产品间隔5-10秒，每小时<50个 |
| **行为模式单一** | 随机延迟 + 鼠标模拟 | 影刀内置功能 |
| **多账号关联** | 账号切换时清除Cookie | 子流程实现 |
| **验证码拦截** | 异常时暂停，人工介入 | 弹窗提示 |
| **数据错误** | 同步前二次确认 | 关键步骤截图记录 |

---

## 五、时间规划

### 5.1 开发排期（6小时准备时间分配）

| 阶段 | 时间 | 任务 | 产出 |
|------|------|------|------|
| **第1小时** | 0-1h | 环境准备 | 影刀安装、账号配置 |
| **第2-3小时** | 1-3h | 核心流程开发 | 登录、同步主流程 |
| **第4小时** | 3-4h | 飞书集成 | 表格读取、状态更新 |
| **第5小时** | 4-5h | 异常处理 | 重试、人工介入机制 |
| **第6小时** | 5-6h | 测试优化 | 5-10个产品实测 |

### 5.2 面试时可展示的内容

1. **架构图**：上述流程图打印或展示
2. **飞书表格设计**：展示数据结构
3. **风险分析**：封号风险及应对措施
4. **实施计划**：6小时开发排期
5. **备选方案**：如RPA不可行，有半自动兜底

---

## 六、面试Q&A准备

### Q1：如果Temu封了RPA操作的账号，怎么办？
**A**：
- 预防：控制操作频率（每小时<50次），随机延迟，模拟真人行为
- 兜底：准备半自动方案，封号后可立即切换
- 长期：跟进官方API开放进度

### Q2：多货币怎么处理？汇率怎么算？
**A**：
- 方案1：飞书表格直接存各币种的固定价格（推荐，业务可控）
- 方案2：表格存EUR基准价，工具自动按实时汇率转换

### Q3：24-48小时的核价周期怎么管理？
**A**：
- 飞书表格增加"核价状态"字段
- 每天定时扫描"核价中"的产品，检查是否已完成
- 完成后自动触发同步流程

### Q4：如果产品数量增长到1000+/天，方案还适用吗？
**A**：
- 短期：增加RPA运行时长（目前设计支持8小时/天）
- 中期：多开RPA实例（需多设备/多账号）
- 长期：推动官方API开放，或接入ERP系统

---

## 七、总结

| 维度 | 推荐方案 |
|------|----------|
| **技术选型** | 影刀RPA + 飞书表格 |
| **自动化程度** | 高度自动化（90%+） |
| **封号风险** | 中低（可控） |
| **开发周期** | 1天（6小时） |
| **维护成本** | 低（影刀可视化维护） |
| **扩展性** | 支持500-1000产品/天 |

**核心优势**：
1. 平衡了效率与风险
2. 有半自动兜底方案
3. 基于飞书，与现有工作流融合
4. 面试时可展示完整规划能力

---

*文档生成时间：2026-03-31  
*规划版本：v1.0

---

## 附录A：基于OpenClaw的Skill化方案（推荐）

### A.1 方案概述

将Temu多国家同步功能封装为**OpenClaw Skill**，通过飞书指令驱动，实现：
- 飞书发送指令 → OpenClaw解析 → 执行同步 → 返回结果到飞书

**优势**：
- 无需安装额外软件，飞书直接操作
- 与现有工作流无缝集成
- 可复用OpenClaw基础设施（定时任务、日志、通知）
- 支持多人协作、权限管理

### A.2 飞书交互流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│   用户在     │────→│  飞书消息   │────→│   OpenClaw Skill    │
│  飞书发送指令 │     │   指令解析   │     │  temu-sync-skill    │
└─────────────┘     └─────────────┘     └─────────────────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    ↓                             ↓                             ↓
            ┌───────────────┐           ┌─────────────────┐           ┌─────────────────┐
            │ 飞书多维表格   │           │  Temu Open API  │           │  飞书消息回复   │
            │ (读取25国价格) │           │  (执行同步)     │           │  (返回结果)     │
            └───────────────┘           └─────────────────┘           └─────────────────┘
```

### A.3 飞书指令设计

**指令格式**：
```
@小乔 同步Temu [产品ID列表] 到 [目标国家]

示例：
@小乔 同步Temu SKU-001,SKU-002,SKU-003 到 欧盟25国
@小乔 同步Temu 全部待同步 到 法国,德国,英国
@小乔 查询Temu SKU-001 同步状态
```

**Skill解析逻辑**：
```python
# 伪代码
class TemuSyncSkill:
    def handle(self, message):
        # 1. 解析指令
        cmd = parse_command(message)
        
        # 2. 从飞书多维表格读取数据
        products = self.read_bitable(cmd.product_ids)
        # 返回: [{sku, prices: {DE:50, FR:55, UK:45}, stocks: {DE:100, ...}}]
        
        # 3. 调用Temu API同步
        results = []
        for product in products:
            result = self.temu_api.sync(product, cmd.target_countries)
            results.append(result)
        
        # 4. 更新飞书表格状态
        self.update_bitable_status(results)
        
        # 5. 返回飞书消息
        return format_reply(results)
    
    def read_bitable(self, product_ids):
        """从飞书多维表格读取25国价格和库存"""
        # 使用 lark-cli 或 feishu_bitable API
        bitable = BitableAPI(app_token='XVqDbRlKmaW27fszflVcfqMvnof')
        
        records = []
        for product_id in product_ids:
            record = bitable.get_record(
                table_id='tblDb2KvnVJDmJNC',
                filter={'产品标签': product_id}
            )
            
            # 提取25国价格和库存
            prices = {}
            stocks = {}
            for country in EU_COUNTRIES:
                prices[country] = record[f'{country}_价格']
                stocks[country] = record[f'{country}_库存']
            
            records.append({
                'sku': product_id,
                'prices': prices,
                'stocks': stocks,
                'temu_id': record['Temu商品ID'],
                'account': record['所属账号']
            })
        
        return records
```

### A.4 飞书多维表格设计（详细）

**表结构**：`Temu产品价格库存管理`

| 字段名 | 字段类型 | 说明 | 示例 |
|--------|----------|------|------|
| **产品标签** | 文本 | 内部SKU，主字段 | SKU-001 |
| **Temu商品ID** | 文本 | 德国站商品ID | 1234567890 |
| **所属账号** | 单选 | 关联的Temu账号 | 账号A |
| **同步状态** | 单选 | 待同步/已同步/失败 | 待同步 |
| **DE_价格** | 数字 | 德国价格(EUR) | 50 |
| **DE_库存** | 数字 | 德国库存 | 100 |
| **FR_价格** | 数字 | 法国价格(EUR) | 55 |
| **FR_库存** | 数字 | 法国库存 | 100 |
| **UK_价格** | 数字 | 英国价格(GBP) | 45 |
| **UK_库存** | 数字 | 英国库存 | 100 |
| **CZ_价格** | 数字 | 捷克价格(CZK) | 1200 |
| **CZ_库存** | 数字 | 捷克库存 | 100 |
| ... | ... | 其他22国... | ... |
| **最后同步时间** | 日期时间 | 自动记录 | 2026-03-31 14:30 |
| **失败原因** | 文本 | 失败时记录 | 价格超出限制 |

**视图设计**：
1. **待同步视图** - 筛选同步状态="待同步"
2. **按账号分组** - 按所属账号分组，方便多账号管理
3. **同步失败** - 筛选同步状态="失败"，优先处理

### A.5 Skill技术实现

**文件结构**：
```
~/.openclaw/skills/temu-sync-skill/
├── SKILL.md                    # Skill定义
├── config.json                 # 配置（API密钥等）
├── scripts/
│   ├── __init__.py
│   ├── skill.py               # 主逻辑
│   ├── temu_api.py            # Temu API封装
│   ├── bitable_helper.py      # 飞书表格操作
│   └── message_formatter.py   # 飞书消息格式化
└── tests/
    └── test_sync.py
```

**核心代码**：`scripts/skill.py`
```python
#!/usr/bin/env python3
"""
Temu Sync Skill - OpenClaw Skill for Temu multi-country product sync
"""
import json
import re
from typing import List, Dict
from .temu_api import TemuAPIClient
from .bitable_helper import BitableHelper

class TemuSyncSkill:
    name = "temu-sync"
    description = "Temu多国家商品同步"
    triggers = ["同步Temu", "查询Temu"]
    
    def __init__(self, config):
        self.temu = TemuAPIClient(
            app_key=config['temu_app_key'],
            app_secret=config['temu_app_secret']
        )
        self.bitable = BitableHelper(
            app_token=config['bitable_app_token'],
            table_id=config['bitable_table_id']
        )
    
    def handle(self, message: str, context: Dict) -> str:
        """处理飞书消息"""
        
        # 解析指令
        if "同步Temu" in message:
            return self.handle_sync(message, context)
        elif "查询Temu" in message:
            return self.handle_query(message, context)
        else:
            return "未知指令。支持的指令：\n- @小乔 同步Temu [产品ID] 到 [国家]\n- @小乔 查询Temu [产品ID] 状态"
    
    def handle_sync(self, message: str, context: Dict) -> str:
        """处理同步指令"""
        # 解析产品ID和目标国家
        product_ids = self.extract_product_ids(message)
        countries = self.extract_countries(message)
        
        if not product_ids:
            return "❌ 未识别到产品ID。格式：@小乔 同步Temu SKU-001,SKU-002 到 欧盟25国"
        
        # 从飞书表格读取数据
        reply = f"🔄 开始同步 {len(product_ids)} 个产品到 {len(countries)} 个国家...\n"
        
        success_count = 0
        fail_count = 0
        
        for product_id in product_ids:
            try:
                # 读取飞书表格
                product_data = self.bitable.get_product(product_id)
                if not product_data:
                    reply += f"\n❌ {product_id}: 在飞书表格中未找到"
                    fail_count += 1
                    continue
                
                # 调用Temu API同步
                result = self.temu.sync_product(
                    product_id=product_data['temu_id'],
                    countries=countries,
                    prices={c: product_data['prices'][c] for c in countries},
                    stocks={c: product_data['stocks'][c] for c in countries}
                )
                
                # 更新飞书表格状态
                self.bitable.update_status(product_id, '已同步')
                
                reply += f"\n✅ {product_id}: 同步成功"
                success_count += 1
                
            except Exception as e:
                reply += f"\n❌ {product_id}: 同步失败 - {str(e)}"
                self.bitable.update_status(product_id, '失败', str(e))
                fail_count += 1
        
        reply += f"\n\n📊 同步完成：成功 {success_count} 个，失败 {fail_count} 个"
        return reply
    
    def extract_product_ids(self, message: str) -> List[str]:
        """从消息中提取产品ID"""
        # 匹配 SKU-XXX 或 全部待同步
        if "全部待同步" in message:
            # 从飞书表格查询所有待同步产品
            return self.bitable.get_pending_products()
        
        pattern = r'SKU-[\w-]+'
        return re.findall(pattern, message)
    
    def extract_countries(self, message: str) -> List[str]:
        """从消息中提取目标国家"""
        if "欧盟25国" in message or "欧盟" in message:
            return ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PL', 'CZ', ...]  # 25国
        
        # 匹配国家代码或名称
        country_map = {
            '德国': 'DE', '法国': 'FR', '英国': 'UK', '意大利': 'IT',
            '西班牙': 'ES', '荷兰': 'NL', ...
        }
        countries = []
        for name, code in country_map.items():
            if name in message:
                countries.append(code)
        return countries if countries else ['DE', 'FR', 'IT']  # 默认3国
```

### A.6 部署步骤

**Step 1：创建Skill目录**
```bash
mkdir -p ~/.openclaw/skills/temu-sync-skill/scripts
```

**Step 2：编写SKILL.md**
```markdown
---
name: temu-sync
description: Temu多国家商品同步
---

# Temu Sync Skill

通过飞书指令同步Temu商品到欧盟多国。

## 触发指令
- "同步Temu [产品ID] 到 [国家]"
- "查询Temu [产品ID] 状态"

## 依赖
- Temu Partner API权限
- 飞书多维表格访问权限
```

**Step 3：配置config.json**
```json
{
  "temu_app_key": "your_app_key",
  "temu_app_secret": "your_app_secret",
  "bitable_app_token": "XVqDbRlKmaW27fszflVcfqMvnof",
  "bitable_table_id": "tblDb2KvnVJDmJNC"
}
```

**Step 4：注册Skill**
在OpenClaw配置中注册新Skill。

### A.7 使用示例

**场景1：同步指定产品**
```
用户：@小乔 同步Temu SKU-001,SKU-002 到 欧盟25国

小乔：🔄 开始同步 2 个产品到 25 个国家...
     ✅ SKU-001: 同步成功
     ✅ SKU-002: 同步成功
     
     📊 同步完成：成功 2 个，失败 0 个
     详情已更新到飞书表格
```

**场景2：同步全部待同步产品**
```
用户：@小乔 同步Temu 全部待同步 到 德国,法国,英国

小乔：🔄 开始同步 15 个待同步产品到 3 个国家...
     ✅ SKU-003: 同步成功
     ✅ SKU-004: 同步成功
     ❌ SKU-005: 同步失败 - 价格超出平台限制
     ...
     
     📊 同步完成：成功 14 个，失败 1 个
     失败原因已记录到飞书表格
```

**场景3：查询同步状态**
```
用户：@小乔 查询Temu SKU-001 状态

小乔：📋 产品 SKU-001 同步状态：
     
     ┌────────┬────────┬────────┐
     │ 国家   │ 价格   │ 状态   │
     ├────────┼────────┼────────┤
     │ 德国   │ 50 EUR │ ✅ 已同步│
     │ 法国   │ 55 EUR │ ✅ 已同步│
     │ 英国   │ 45 GBP │ ✅ 已同步│
     └────────┴────────┴────────┘
```

### A.8 方案对比总结

| 方案 | 使用方式 | 开发成本 | 用户体验 | 推荐度 |
|------|----------|----------|----------|--------|
| **OpenClaw Skill** | 飞书指令 | 2-3天 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 独立Python脚本 | 命令行 | 2-3天 | ⭐⭐⭐ | ⭐⭐⭐ |
| 影刀RPA | 桌面软件 | 1天 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Web后台 | 浏览器 | 5-7天 | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**结论**：基于OpenClaw的Skill化方案是**最佳选择**，与现有工作流无缝集成，用户体验最好。

---

*更新时间：2026-03-31  
*版本：v1.2（增加OpenClaw Skill化方案）
# Temu 多国家同步系统 - 方案补充细节

> 补充文档 v1.3 | 完善技术细节、异常处理、安全方案

---

## 一、Temu Open API 详细接口规范

### 1.1 API 基础信息

| 项目 | 详情 |
|------|------|
| **EU版入口** | `https://openapi-b-eu.temu.com/openapi/router` |
| **US版入口** | `https://openapi-b.temu.com/openapi/router` |
| **协议** | HTTPS POST |
| **数据格式** | JSON |
| **字符编码** | UTF-8 |
| **签名算法** | MD5(app_key + timestamp + params + body + app_secret) |

### 1.2 通用请求头

```http
POST /openapi/router HTTP/1.1
Host: openapi-b-eu.temu.com
Content-Type: application/json
X-App-Key: your_app_key
X-Timestamp: 1711891200
X-Sign: md5_hash_here
X-Access-Token: seller_access_token
```

### 1.3 核心接口列表

#### 接口1：获取商品列表

**请求**：
```json
{
  "method": "temu.product.list",
  "params": {
    "status": "approved",
    "page": 1,
    "page_size": 50
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
    "total": 150,
    "page": 1,
    "page_size": 50,
    "products": [
      {
        "product_id": "1234567890",
        "sku": "SKU-001",
        "title": "Product Title",
        "status": "approved",
        "site": "DE",
        "create_time": "2024-01-15T10:30:00Z",
        "update_time": "2024-03-31T08:00:00Z"
      }
    ]
  }
}
```

#### 接口2：同步商品到其他国家

**请求**：
```json
{
  "method": "temu.product.sync",
  "params": {
    "product_id": "1234567890",
    "source_site": "DE"
  },
  "body": {
    "target_sites": [
      {
        "site": "FR",
        "price": 55.00,
        "currency": "EUR",
        "stock": 100
      },
      {
        "site": "UK",
        "price": 45.00,
        "currency": "GBP",
        "stock": 100
      },
      {
        "site": "CZ",
        "price": 1200.00,
        "currency": "CZK",
        "stock": 100
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
  "data": {
    "sync_id": "sync_abc123",
    "status": "processing",
    "results": [
      {"site": "FR", "status": "success", "product_id": "1234567890_FR"},
      {"site": "UK", "status": "success", "product_id": "1234567890_UK"},
      {"site": "CZ", "status": "pending_review", "message": "价格待审核"}
    ]
  }
}
```

#### 接口3：查询同步状态

**请求**：
```json
{
  "method": "temu.product.sync.query",
  "params": {
    "sync_id": "sync_abc123"
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
    "sync_id": "sync_abc123",
    "status": "completed",
    "results": [
      {"site": "FR", "status": "success", "product_id": "1234567890_FR"},
      {"site": "UK", "status": "success", "product_id": "1234567890_UK"},
      {"site": "CZ", "status": "failed", "error": "价格超出平台限制"}
    ]
  }
}
```

#### 接口4：更新商品价格

**请求**：
```json
{
  "method": "temu.product.price.update",
  "params": {
    "product_id": "1234567890_FR"
  },
  "body": {
    "price": 58.00,
    "currency": "EUR"
  }
}
```

#### 接口5：更新商品库存

**请求**：
```json
{
  "method": "temu.product.stock.update",
  "params": {
    "product_id": "1234567890_FR"
  },
  "body": {
    "stock": 80
  }
}
```

### 1.4 错误码对照表

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 0 | 成功 | - |
| 1001 | 参数错误 | 检查请求参数格式 |
| 1002 | 签名错误 | 检查签名算法 |
| 1003 | 授权失败 | access_token过期，需重新授权 |
| 1004 | 频率限制 | 降低请求频率 |
| 2001 | 商品不存在 | 检查product_id |
| 2002 | 价格超出限制 | 调整价格 |
| 2003 | 库存不足 | 检查库存设置 |
| 2004 | 站点不支持 | 检查target_site |
| 3001 | 同步任务已存在 | 等待当前任务完成 |
| 5000 | 系统错误 | 稍后重试 |

---

## 二、飞书多维表格完整设计

### 2.1 表格结构：Temu产品价格库存管理

**基础信息**：
- **表格名称**：Temu产品价格库存管理
- **表格用途**：管理产品25国价格、库存、同步状态
- **访问权限**：团队成员可编辑，外部人员仅查看

### 2.2 字段详细设计

#### 基础信息字段

| 字段名 | 字段类型 | 必填 | 默认值 | 说明 |
|--------|----------|------|--------|------|
| **产品标签** | 文本 | ✅ | - | 内部SKU，主字段，唯一标识 |
| **产品名称** | 文本 | - | - | 产品中文名称，便于识别 |
| **Temu商品ID** | 文本 | ✅ | - | 德国站商品ID |
| **所属账号** | 单选 | ✅ | 账号A | 关联的Temu卖家账号 |
| **同步状态** | 单选 | ✅ | 待同步 | 待同步/已同步/同步中/失败 |
| **核价状态** | 单选 | ✅ | 核价中 | 核价中/已通过/已拒绝 |
| **建议价格** | 数字 | - | - | 提交给平台的建议价(EUR) |
| **最终价格** | 数字 | - | - | 平台核价后的最终价(EUR) |

#### 德国站字段（源站）

| 字段名 | 字段类型 | 必填 | 单位 | 说明 |
|--------|----------|------|------|------|
| **DE_价格** | 数字 | ✅ | EUR | 德国站售价 |
| **DE_库存** | 数字 | ✅ | 件 | 德国站库存 |
| **DE_状态** | 单选 | ✅ | - | 在售/不在售/审核中 |
| **DE_链接** | 超链接 | - | - | 德国站商品链接 |

#### 其他欧盟国家字段（24国）

| 国家 | 价格字段 | 库存字段 | 状态字段 | 货币 |
|------|----------|----------|----------|------|
| 法国 | FR_价格 | FR_库存 | FR_状态 | EUR |
| 英国 | UK_价格 | UK_库存 | UK_状态 | GBP |
| 意大利 | IT_价格 | IT_库存 | IT_状态 | EUR |
| 西班牙 | ES_价格 | ES_库存 | ES_状态 | EUR |
| 荷兰 | NL_价格 | NL_库存 | NL_状态 | EUR |
| 比利时 | BE_价格 | BE_库存 | BE_状态 | EUR |
| 奥地利 | AT_价格 | AT_库存 | AT_状态 | EUR |
| 波兰 | PL_价格 | PL_库存 | PL_状态 | PLN |
| 捷克 | CZ_价格 | CZ_库存 | CZ_状态 | CZK |
| 瑞典 | SE_价格 | SE_库存 | SE_状态 | SEK |
| 丹麦 | DK_价格 | DK_库存 | DK_状态 | DKK |
| 芬兰 | FI_价格 | FI_库存 | FI_状态 | EUR |
| 爱尔兰 | IE_价格 | IE_库存 | IE_状态 | EUR |
| 葡萄牙 | PT_价格 | PT_库存 | PT_状态 | EUR |
| 希腊 | GR_价格 | GR_库存 | GR_状态 | EUR |
| 匈牙利 | HU_价格 | HU_库存 | HU_状态 | HUF |
| 罗马尼亚 | RO_价格 | RO_库存 | RO_状态 | RON |
| 保加利亚 | BG_价格 | BG_库存 | BG_状态 | BGN |
| 克罗地亚 | HR_价格 | HR_库存 | HR_状态 | EUR |
| 斯洛伐克 | SK_价格 | SK_库存 | SK_状态 | EUR |
| 斯洛文尼亚 | SI_价格 | SI_库存 | SI_状态 | EUR |
| 立陶宛 | LT_价格 | LT_库存 | LT_状态 | EUR |
| 拉脱维亚 | LV_价格 | LV_库存 | LV_状态 | EUR |
| 爱沙尼亚 | EE_价格 | EE_库存 | EE_状态 | EUR |

#### 系统字段

| 字段名 | 字段类型 | 自动 | 说明 |
|--------|----------|------|------|
| **创建时间** | 创建时间 | ✅ | 记录创建时间 |
| **最后修改时间** | 修改时间 | ✅ | 记录最后修改时间 |
| **最后同步时间** | 日期时间 | - | 最后同步操作时间 |
| **失败原因** | 文本 | - | 同步失败时记录错误信息 |
| **备注** | 文本 | - | 其他备注信息 |

### 2.3 视图设计

**视图1：待同步产品**
- 筛选条件：同步状态 = "待同步"
- 排序：创建时间 升序
- 显示字段：产品标签、产品名称、所属账号、DE_价格、DE_库存

**视图2：按账号分组**
- 分组字段：所属账号
- 筛选条件：无
- 显示字段：全部

**视图3：同步失败**
- 筛选条件：同步状态 = "失败"
- 排序：最后同步时间 降序
- 显示字段：产品标签、失败原因、最后同步时间

**视图4：核价中**
- 筛选条件：核价状态 = "核价中"
- 排序：创建时间 升序

**视图5：今日已同步**
- 筛选条件：最后同步时间 = 今天 AND 同步状态 = "已同步"
- 排序：最后同步时间 降序

### 2.4 权限设计

| 角色 | 权限 | 说明 |
|------|------|------|
| **管理员** | 全部权限 | 增删改查、字段配置 |
| **运营人员** | 编辑权限 | 修改价格、库存、触发同步 |
| **财务人员** | 查看权限 | 查看价格数据，不可修改 |
| **外部人员** | 仅查看 | 只读访问 |

---

## 三、异常处理机制

### 3.1 异常分类与处理

```
┌─────────────────────────────────────────────────────────────┐
│                      异常处理总览                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Level 1: API调用异常                                       │
│  ├── 网络超时 → 重试3次，间隔5秒                            │
│  ├── 频率限制 → 等待60秒后继续                              │
│  └── 授权失败 → 通知用户重新授权                            │
│                                                             │
│  Level 2: 业务逻辑异常                                      │
│  ├── 商品不存在 → 记录日志，跳过该产品                      │
│  ├── 价格超出限制 → 标记失败，通知用户调整价格              │
│  └── 库存不足 → 标记警告，继续同步其他产品                  │
│                                                             │
│  Level 3: 数据异常                                          │
│  ├── 飞书表格读取失败 → 重试3次，失败则终止                 │
│  ├── 价格/库存为空 → 跳过该国家，记录警告                   │
│  └── 货币不匹配 → 自动转换或标记错误                        │
│                                                             │
│  Level 4: 系统异常                                          │
│  ├── Skill崩溃 → 自动重启，恢复任务                         │
│  └── 飞书消息发送失败 → 记录到本地日志                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 重试策略

| 异常类型 | 重试次数 | 重试间隔 | 最终处理 |
|----------|----------|----------|----------|
| 网络超时 | 3次 | 5秒 | 标记失败，人工介入 |
| API限流 | 5次 | 60秒 | 延迟到下一批次处理 |
| 授权过期 | 0次 | - | 立即通知用户重新授权 |
| 数据错误 | 0次 | - | 记录错误，跳过该产品 |

### 3.3 错误通知机制

**通知方式**：飞书消息

**通知场景**：
1. **同步完成通知** - 每批次同步完成后发送汇总
2. **同步失败通知** - 单个产品同步失败时立即通知
3. **授权过期通知** - API授权失效时立即通知
4. **系统异常通知** - Skill崩溃或严重错误时通知

**通知格式**：
```
🚨 Temu同步异常通知

时间：2024-03-31 14:30:25
类型：同步失败
产品：SKU-001
账号：账号A
错误：价格超出平台限制（当前55 EUR，限制50 EUR）
建议：请调整价格后重新同步

[查看详情] [忽略] [重试]
```

---

## 四、安全与权限管理

### 4.1 API密钥管理

**存储方式**：
- 配置文件加密存储（AES-256）
- 环境变量方式（推荐）
- 密钥管理服务（KMS）

**密钥轮换**：
- access_token：90天轮换
- app_key/app_secret：180天轮换
- 轮换时自动更新配置文件

**访问控制**：
- 不同账号使用不同access_token
- token隔离，避免账号关联

### 4.2 数据安全

**传输安全**：
- 全部HTTPS通信
- 证书 pinning 防止中间人攻击

**存储安全**：
- 敏感数据（密码、token）加密存储
- 日志中脱敏处理（隐藏部分token）

**访问审计**：
- 记录所有API调用日志
- 记录用户操作日志
- 定期审计异常访问

### 4.3 多账号隔离

```
账号A
├── app_key: key_a
├── app_secret: secret_a
├── access_token: token_a
└── 关联产品: SKU-001, SKU-002

账号B
├── app_key: key_b
├── app_secret: secret_b
├── access_token: token_b
└── 关联产品: SKU-003, SKU-004
```

**隔离措施**：
- 每个账号独立API客户端实例
- 账号切换时清除缓存
- 错误隔离，一个账号失败不影响其他账号

---

## 五、测试方案

### 5.1 测试环境

**沙盒环境**：
- Temu提供沙盒API环境
- 使用测试账号和测试数据
- 不影响生产环境

**测试数据**：
- 10个测试SKU
- 覆盖3-5个目标国家
- 包含正常和异常场景

### 5.2 测试用例

| 用例ID | 场景 | 预期结果 | 优先级 |
|--------|------|----------|--------|
| TC-001 | 同步单个产品到1个国家 | 成功，状态更新 | P0 |
| TC-002 | 同步单个产品到25个国家 | 成功，全部同步 | P0 |
| TC-003 | 同步多个产品（批量） | 成功，批量更新 | P0 |
| TC-004 | 价格超出平台限制 | 失败，记录错误 | P1 |
| TC-005 | 库存为0 | 警告，继续同步 | P1 |
| TC-006 | 网络超时 | 重试3次后失败 | P1 |
| TC-007 | API授权过期 | 通知用户重新授权 | P0 |
| TC-008 | 飞书表格读取失败 | 终止，通知用户 | P0 |
| TC-009 | 多账号切换 | 正确切换，数据隔离 | P1 |
| TC-010 | 并发同步（10个产品） | 全部成功，无冲突 | P2 |

### 5.3 性能测试

| 指标 | 目标值 | 测试方法 |
|------|--------|----------|
| 单产品同步耗时 | < 5秒 | 多次测试取平均 |
| 批量同步（10个） | < 30秒 | 并行处理 |
| 批量同步（100个） | < 5分钟 | 分批处理 |
| API调用成功率 | > 99% | 1000次调用统计 |
| 内存占用 | < 200MB | 长时间运行监控 |

---

## 六、部署与运维

### 6.1 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                     OpenClaw Gateway                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Temu Sync Skill                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │ 指令解析器   │  │  API客户端  │  │ 飞书助手   │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  飞书消息     │  │ Temu Open API │  │ 飞书多维表格  │
│  (用户交互)   │  │  (业务操作)   │  │  (数据存储)   │
└───────────────┘  └───────────────┘  └───────────────┘
```

### 6.2 部署步骤

**Step 1：环境准备**
```bash
# 确认OpenClaw版本
openclaw --version  # 需要 >= 1.0.0

# 安装依赖
pip install requests python-dotenv
```

**Step 2：创建Skill目录**
```bash
mkdir -p ~/.openclaw/skills/temu-sync-skill/{scripts,tests}
touch ~/.openclaw/skills/temu-sync-skill/SKILL.md
touch ~/.openclaw/skills/temu-sync-skill/config.json
```

**Step 3：编写代码**
- 复制附录中的代码到对应文件
- 修改config.json中的配置

**Step 4：注册Skill**
在OpenClaw配置文件中添加：
```json
{
  "skills": [
    {
      "name": "temu-sync",
      "path": "~/.openclaw/skills/temu-sync-skill",
      "enabled": true
    }
  ]
}
```

**Step 5：重启OpenClaw**
```bash
openclaw restart
```

**Step 6：测试**
在飞书发送测试指令：
```
@小乔 同步Temu 测试SKU 到 德国
```

### 6.3 监控与日志

**日志位置**：
```
~/.openclaw/logs/temu-sync-skill/
├── access.log    # API调用日志
├── error.log     # 错误日志
├── sync.log      # 同步操作日志
└── performance.log  # 性能日志
```

**监控指标**：
- 每日同步产品数量
- 同步成功率
- 平均同步耗时
- API调用频率
- 错误类型分布

**告警规则**：
- 同步成功率 < 90% → 发送告警
- 连续5次API调用失败 → 发送告警
- Skill崩溃 → 立即重启并通知

### 6.4 备份与恢复

**备份内容**：
- config.json（加密存储）
- 飞书多维表格数据（定期导出）
- 操作日志（保留30天）

**恢复流程**：
1. 恢复配置文件
2. 重新授权（如token过期）
3. 验证飞书表格连接
4. 执行测试用例

---

## 七、附录：完整代码实现

### 7.1 Temu API客户端（temu_api.py）

```python
#!/usr/bin/env python3
"""
Temu Open API Client
"""
import hashlib
import json
import time
import logging
from typing import Dict, List, Optional
import requests

logger = logging.getLogger(__name__)

class TemuAPIError(Exception):
    """Temu API错误"""
    pass

class TemuAPIClient:
    """Temu Open API客户端"""
    
    EU_BASE_URL = "https://openapi-b-eu.temu.com/openapi/router"
    US_BASE_URL = "https://openapi-b.temu.com/openapi/router"
    
    def __init__(self, app_key: str, app_secret: str, access_token: str, region: str = "EU"):
        self.app_key = app_key
        self.app_secret = app_secret
        self.access_token = access_token
        self.base_url = self.EU_BASE_URL if region == "EU" else self.US_BASE_URL
        self.session = requests.Session()
        
    def _generate_sign(self, timestamp: str, params: str, body: str) -> str:
        """生成API签名"""
        sign_str = f"{self.app_key}{timestamp}{params}{body}{self.app_secret}"
        return hashlib.md5(sign_str.encode()).hexdigest()
    
    def _call_api(self, method: str, params: Dict, body: Dict, max_retries: int = 3) -> Dict:
        """调用API（带重试）"""
        timestamp = str(int(time.time()))
        params_str = json.dumps(params, sort_keys=True)
        body_str = json.dumps(body, sort_keys=True)
        sign = self._generate_sign(timestamp, params_str, body_str)
        
        headers = {
            "Content-Type": "application/json",
            "X-App-Key": self.app_key,
            "X-Timestamp": timestamp,
            "X-Sign": sign,
            "X-Access-Token": self.access_token
        }
        
        payload = {
            "method": method,
            "params": params,
            "body": body
        }
        
        for attempt in range(max_retries):
            try:
                response = self.session.post(
                    self.base_url,
                    headers=headers,
                    json=payload,
                    timeout=30
                )
                response.raise_for_status()
                data = response.json()
                
                if data.get("code") != 0:
                    raise TemuAPIError(f"API错误: {data.get('message')} (code: {data.get('code')})")
                
                return data.get("data", {})
                
            except requests.exceptions.Timeout:
                logger.warning(f"API调用超时，重试 {attempt + 1}/{max_retries}")
                if attempt == max_retries - 1:
                    raise TemuAPIError("API调用超时，请检查网络")
                time.sleep(5)
                
            except requests.exceptions.RequestException as e:
                logger.error(f"API调用失败: {e}")
                raise TemuAPIError(f"API调用失败: {e}")
    
    def get_product_list(self, status: str = "approved", page: int = 1, page_size: int = 50) -> List[Dict]:
        """获取商品列表"""
        params = {"status": status, "page": page, "page_size": page_size}
        data = self._call_api("temu.product.list", params, {})
        return data.get("products", [])
    
    def sync_product_to_countries(self, product_id: str, source_site: str, 
                                   target_configs: List[Dict]) -> Dict:
        """
        同步商品到多个国家
        
        Args:
            product_id: 德国站商品ID
            source_site: 源站点（DE）
            target_configs: 目标国家配置列表
                [{"site": "FR", "price": 55, "currency": "EUR", "stock": 100}, ...]
        """
        params = {"product_id": product_id, "source_site": source_site}
        body = {"target_sites": target_configs}
        return self._call_api("temu.product.sync", params, body)
    
    def query_sync_status(self, sync_id: str) -> Dict:
        """查询同步状态"""
        params = {"sync_id": sync_id}
        return self._call_api("temu.product.sync.query", params, {})
    
    def update_price(self, product_id: str, price: float, currency: str) -> Dict:
        """更新商品价格"""
        params = {"product_id": product_id}
        body = {"price": price, "currency": currency}
        return self._call_api("temu.product.price.update", params, body)
    
    def update_stock(self, product_id: str, stock: int) -> Dict:
        """更新商品库存"""
        params = {"product_id": product_id}
        body = {"stock": stock}
        return self._call_api("temu.product.stock.update", params, body)
```

### 7.2 飞书多维表格助手（bitable_helper.py）

```python
#!/usr/bin/env python3
"""
飞书多维表格操作助手
"""
import logging
from typing import Dict, List, Optional
from datetime import datetime

# 使用lark-cli或feishu_bitable工具
from feishu_bitable_app_table_record import feishu_bitable_app_table_record

logger = logging.getLogger(__name__)

class BitableHelper:
    """飞书多维表格助手"""
    
    # 欧盟25国列表
    EU_COUNTRIES = [
        'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PL', 'CZ', 'SE',
        'DK', 'FI', 'IE', 'PT', 'GR', 'HU', 'RO', 'BG', 'HR', 'SK',
        'SI', 'LT', 'LV', 'EE'
    ]
    
    def __init__(self, app_token: str, table_id: str):
        self.app_token = app_token
        self.table_id = table_id
    
    def get_product(self, sku: str) -> Optional[Dict]:
        """
        根据SKU获取产品信息（含25国价格库存）
        
        Returns:
            {
                'sku': 'SKU-001',
                'temu_id': '1234567890',
                'account': '账号A',
                'prices': {'DE': 50, 'FR': 55, 'UK': 45, ...},
                'stocks': {'DE': 100, 'FR': 100, 'UK': 100, ...}
            }
        """
        try:
            # 查询记录
            result = feishu_bitable_app_table_record(
                action="list",
                app_token=self.app_token,
                table_id=self.table_id,
                filter={
                    "conjunction": "and",
                    "conditions": [
                        {"field_name": "产品标签", "operator": "is", "value": [sku]}
                    ]
                }
            )
            
            items = result.get("items", [])
            if not items:
                logger.warning(f"未找到产品: {sku}")
                return None
            
            record = items[0]
            fields = record.get("fields", {})
            
            # 提取25国价格和库存
            prices = {}
            stocks = {}
            for country in self.EU_COUNTRIES:
                price_field = f"{country}_价格"
                stock_field = f"{country}_库存"
                prices[country] = fields.get(price_field, 0)
                stocks[country] = fields.get(stock_field, 0)
            
            return {
                'record_id': record.get("record_id"),
                'sku': sku,
                'temu_id': fields.get("Temu商品ID"),
                'account': fields.get("所属账号"),
                'sync_status': fields.get("同步状态"),
                'prices': prices,
                'stocks': stocks
            }
            
        except Exception as e:
            logger.error(f"读取飞书表格失败: {e}")
            raise
    
    def get_pending_products(self, account: Optional[str] = None) -> List[str]:
        """获取待同步产品列表"""
        try:
            conditions = [
                {"field_name": "同步状态", "operator": "is", "value": ["待同步"]}
            ]
            if account:
                conditions.append({
                    "field_name": "所属账号", "operator": "is", "value": [account]
                })
            
            result = feishu_bitable_app_table_record(
                action="list",
                app_token=self.app_token,
                table_id=self.table_id,
                filter={"conjunction": "and", "conditions": conditions}
            )
            
            items = result.get("items", [])
            return [item["fields"]["产品标签"] for item in items if "产品标签" in item["fields"]]
            
        except Exception as e:
            logger.error(f"获取待同步产品失败: {e}")
            return []
    
    def update_status(self, sku: str, status: str, error_msg: str = "") -> bool:
        """更新产品同步状态"""
        try:
            # 先查询record_id
            result = feishu_bitable_app_table_record(
                action="list",
                app_token=self.app_token,
                table_id=self.table_id,
                filter={
                    "conjunction": "and",
                    "conditions": [
                        {"field_name": "产品标签", "operator": "is", "value": [sku]}
                    ]
                }
            )
            
            items = result.get("items", [])
            if not items:
                logger.warning(f"更新状态失败，未找到产品: {sku}")
                return False
            
            record_id = items[0]["record_id"]
            
            # 更新状态
            update_fields = {
                "同步状态": status,
                "最后同步时间": int(datetime.now().timestamp() * 1000)
            }
            if error_msg:
                update_fields["失败原因"] = error_msg
            
            feishu_bitable_app_table_record(
                action="update",
                app_token=self.app_token,
                table_id=self.table_id,
                record_id=record_id,
                fields=update_fields
            )
            
            return True
            
        except Exception as e:
            logger.error(f"更新状态失败: {e}")
            return False
```

### 7.3 Skill主逻辑（skill.py）

```python
#!/usr/bin/env python3
"""
Temu Sync Skill - 主逻辑
"""
import re
import logging
from typing import Dict, List
from .temu_api import TemuAPIClient, TemuAPIError
from .bitable_helper import BitableHelper

logger = logging.getLogger(__name__)

class TemuSyncSkill:
    """Temu同步Skill"""
    
    name = "temu-sync"
    description = "Temu多国家商品同步"
    triggers = ["同步Temu", "查询Temu"]
    
    # 国家代码映射
    COUNTRY_MAP = {
        '德国': 'DE', '法国': 'FR', '英国': 'UK', '意大利': 'IT',
        '西班牙': 'ES', '荷兰': 'NL', '比利时': 'BE', '奥地利': 'AT',
        '波兰': 'PL', '捷克': 'CZ', '瑞典': 'SE', '丹麦': 'DK',
        '芬兰': 'FI', '爱尔兰': 'IE', '葡萄牙': 'PT', '希腊': 'GR',
        '匈牙利': 'HU', '罗马尼亚': 'RO', '保加利亚': 'BG', '克罗地亚': 'HR',
        '斯洛伐克': 'SK', '斯洛文尼亚': 'SI', '立陶宛': 'LT', '拉脱维亚': 'LV',
        '爱沙尼亚': 'EE'
    }
    
    def __init__(self, config: Dict):
        self.config = config
        self.bitable = BitableHelper(
            app_token=config['bitable_app_token'],
            table_id=config['bitable_table_id']
        )
        # Temu客户端延迟初始化（按需创建）
        self._temu_clients = {}
    
    def _get_temu_client(self, account: str) -> TemuAPIClient:
        """获取Temu客户端（按账号缓存）"""
        if account not in self._temu_clients:
            # 从配置中获取账号对应的API密钥
            account_config = self.config.get('accounts', {}).get(account, {})
            self._temu_clients[account] = TemuAPIClient(
                app_key=account_config.get('app_key', self.config['temu_app_key']),
                app_secret=account_config.get('app_secret', self.config['temu_app_secret']),
                access_token=account_config.get('access_token'),
                region='EU'
            )
        return self._temu_clients[account]
    
    def handle(self, message: str, context: Dict) -> str:
        """处理飞书消息"""
        try:
            if "同步Temu" in message:
                return self.handle_sync(message, context)
            elif "查询Temu" in message:
                return self.handle_query(message, context)
            else:
                return self._help_message()
        except Exception as e:
            logger.exception("处理消息失败")
            return f"❌ 处理失败: {str(e)}"
    
    def handle_sync(self, message: str, context: Dict) -> str:
        """处理同步指令"""
        # 解析产品ID
        product_ids = self._extract_product_ids(message)
        if not product_ids:
            return "❌ 未识别到产品ID。\n格式：@小乔 同步Temu SKU-001,SKU-002 到 欧盟25国"
        
        # 解析目标国家
        countries = self._extract_countries(message)
        if not countries:
            countries = ['DE', 'FR', 'IT']  # 默认3国
        
        # 开始同步
        reply_lines = [f"🔄 开始同步 {len(product_ids)} 个产品到 {len(countries)} 个国家..."]
        
        success_count = 0
        fail_count = 0
        
        for product_id in product_ids:
            try:
                result = self._sync_single_product(product_id, countries)
                if result['success']:
                    reply_lines.append(f"✅ {product_id}: 同步成功")
                    success_count += 1
                else:
                    reply_lines.append(f"❌ {product_id}: {result['error']}")
                    fail_count += 1
            except Exception as e:
                reply_lines.append(f"❌ {product_id}: 同步异常 - {str(e)}")
                fail_count += 1
        
        reply_lines.append(f"\n📊 同步完成：成功 {success_count} 个，失败 {fail_count} 个")
        return "\n".join(reply_lines)
    
    def _sync_single_product(self, sku: str, countries: List[str]) -> Dict:
        """同步单个产品"""
        # 1. 从飞书表格读取产品数据
        product_data = self.bitable.get_product(sku)
        if not product_data:
            return {'success': False, 'error': '在飞书表格中未找到该产品'}
        
        # 2. 获取Temu客户端
        account = product_data['account']
        if not account:
            return {'success': False, 'error': '产品未配置所属账号'}
        
        try:
            temu = self._get_temu_client(account)
        except Exception as e:
            return {'success': False, 'error': f'账号配置错误: {e}'}
        
        # 3. 构建目标国家配置
        target_configs = []
        for country in countries:
            price = product_data['prices'].get(country)
            stock = product_data['stocks'].get(country)
            
            if price is None or price <= 0:
                logger.warning(f"{sku} {country} 价格无效，跳过")
                continue
            
            currency = self._get_currency(country)
            target_configs.append({
                "site": country,
                "price": float(price),
                "currency": currency,
                "stock": int(stock) if stock else 0
            })
        
        if not target_configs:
            return {'success': False, 'error': '没有有效的目标国家配置'}
        
        # 4. 调用Temu API同步
        try:
            result = temu.sync_product_to_countries(
                product_id=product_data['temu_id'],
                source_site='DE',
                target_configs=target_configs
            )
            
            # 5. 更新飞书表格状态
            self.bitable.update_status(sku, '已同步')
            
            return {'success': True, 'data': result}
            
        except TemuAPIError as e:
            error_msg = str(e)
            self.bitable.update_status(sku, '失败', error_msg)
            return {'success': False, 'error': error_msg}
    
    def handle_query(self, message: str, context: Dict) -> str:
        """处理查询指令"""
        product_ids = self._extract_product_ids(message)
        if not product_ids:
            return "❌ 请指定要查询的产品ID"
        
        reply_lines = ["📋 产品同步状态查询：\n"]
        
        for sku in product_ids:
            product_data = self.bitable.get_product(sku)
            if not product_data:
                reply_lines.append(f"❌ {sku}: 未找到")
                continue
            
            reply_lines.append(f"\n**{sku}**")
            reply_lines.append(f"所属账号: {product_data['account']}")
            reply_lines.append(f"同步状态: {product_data['sync_status']}")
            reply_lines.append(f"Temu ID: {product_data['temu_id']}")
            
            # 显示有价格的国家
            price_info = []
            for country, price in product_data['prices'].items():
                if price and price > 0:
                    stock = product_data['stocks'].get(country, 0)
                    price_info.append(f"{country}: {price} (库存{stock})")
            
            if price_info:
                reply_lines.append(f"价格配置: {', '.join(price_info[:5])}...")
        
        return "\n".join(reply_lines)
    
    def _extract_product_ids(self, message: str) -> List[str]:
        """提取产品ID"""
        # 检查"全部待同步"
        if "全部待同步" in message:
            # 从消息中提取账号（如果有）
            account = self._extract_account(message)
            return self.bitable.get_pending_products(account)
        
        # 匹配 SKU-XXX 格式
        pattern = r'SKU-[\w-]+'
        return re.findall(pattern, message)
    
    def _extract_countries(self, message: str) -> List[str]:
        """提取目标国家"""
        # 欧盟25国
        if "欧盟25国" in message or "欧盟" in message:
            return list(self.COUNTRY_MAP.values())
        
        # 匹配国家名称
        countries = []
        for name, code in self.COUNTRY_MAP.items():
            if name in message:
                countries.append(code)
        
        # 匹配国家代码
        for code in self.COUNTRY_MAP.values():
            if code in message.upper():
                countries.append(code)
        
        return list(set(countries))  # 去重
    
    def _extract_account(self, message: str) -> str:
        """提取账号信息"""
        # 匹配 账号A/账号B/...
        match = re.search(r'账号([A-Z])', message)
        if match:
            return f"账号{match.group(1)}"
        return None
    
    def _get_currency(self, country: str) -> str:
        """获取国家货币"""
        currency_map = {
            'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
            'BE': 'EUR', 'AT': 'EUR', 'FI': 'EUR', 'IE': 'EUR', 'PT': 'EUR',
            'GR': 'EUR', 'SK': 'EUR', 'SI': 'EUR', 'LT': 'EUR', 'LV': 'EUR',
            'EE': 'EUR', 'HR': 'EUR',
            'UK': 'GBP',
            'PL': 'PLN', 'CZ': 'CZK', 'SE': 'SEK', 'DK': 'DKK',
            'HU': 'HUF', 'RO': 'RON', 'BG': 'BGN'
        }
        return currency_map.get(country, 'EUR')
    
    def _help_message(self) -> str:
        """帮助信息"""
        return """🤖 Temu同步助手

**支持的指令：**
• @小乔 同步Temu SKU-001,SKU-002 到 欧盟25国
• @小乔 同步Temu 全部待同步 到 德国,法国,英国
• @小乔 同步Temu 全部待同步(账号A) 到 欧盟
• @小乔 查询Temu SKU-001 状态

**说明：**
• 产品ID格式：SKU-XXX
• 国家支持：德国/法国/英国/意大利/西班牙/...（25国）
• "欧盟25国" = 全部欧盟国家
• 价格和库存从飞书表格自动读取"""
```

### 7.4 配置文件（config.json）

```json
{
  "skill_name": "temu-sync",
  "version": "1.0.0",
  
  "temu_app_key": "your_app_key_here",
  "temu_app_secret": "your_app_secret_here",
  
  "bitable_app_token": "XVqDbRlKmaW27fszflVcfqMvnof",
  "bitable_table_id": "tblDb2KvnVJDmJNC",
  
  "accounts": {
    "账号A": {
      "access_token": "token_for_account_a",
      "app_key": "optional_different_key",
      "app_secret": "optional_different_secret"
    },
    "账号B": {
      "access_token": "token_for_account_b"
    }
  },
  
  "sync_settings": {
    "max_retries": 3,
    "retry_delay": 5,
    "batch_size": 10,
    "rate_limit_per_minute": 50
  },
  
  "notification": {
    "enabled": true,
    "on_success": false,
    "on_failure": true,
    "on_error": true
  }
}
```

---

## 八、总结

本补充文档完善了以下技术细节：

1. ✅ **Temu API详细接口** - 5个核心接口，完整请求/响应格式
2. ✅ **飞书多维表格设计** - 完整字段、视图、权限设计
3. ✅ **异常处理机制** - 4级异常分类，重试策略，通知机制
4. ✅ **安全与权限** - API密钥管理，数据安全，多账号隔离
5. ✅ **测试方案** - 10个测试用例，性能指标
6. ✅ **部署运维** - 完整部署步骤，监控告警，备份恢复
7. ✅ **完整代码** - 4个核心文件，可直接使用

**方案已完善，可以开始开发实施。**

---

*补充文档版本：v1.3  
*更新时间：2026-03-31


## 附录J：实际落地优化补充

### J.1 核价周期自动化管理

**问题**：德国站上架后需等待24-48小时核价，期间无法同步到其他国家

**解决方案**：

```python
# 核价状态监控定时任务
class PricingMonitor:
    """监控核价状态，自动触发同步"""
    
    def __init__(self):
        self.temu = TemuAPIClient()
        self.bitable = BitableHelper()
    
    def run(self):
        """每小时执行一次"""
        # 1. 查询所有"核价中"的产品
        pending_products = self.bitable.get_by_status('核价中')
        
        for product in pending_products:
            # 2. 查询Temu平台实际状态
            temu_status = self.temu.get_product_status(product['temu_id'])
            
            if temu_status['pricing_status'] == 'approved':
                # 3. 核价通过，更新状态并触发同步
                self.bitable.update_status(product['sku'], '待同步')
                self.bitable.update_field(product['sku'], '最终价格', temu_status['approved_price'])
                
                # 4. 发送通知
                send_notification(f"✅ {product['sku']} 核价通过，已自动标记为待同步")
                
            elif temu_status['pricing_status'] == 'rejected':
                # 5. 核价被拒，记录原因
                self.bitable.update_status(product['sku'], '核价被拒')
                self.bitable.update_field(product['sku'], '失败原因', temu_status['reject_reason'])
                
                send_notification(f"❌ {product['sku']} 核价被拒：{temu_status['reject_reason']}")
```

**飞书表格增加字段**：
| 字段 | 类型 | 说明 |
|------|------|------|
| 核价提交时间 | 日期时间 | 记录提交核价的时间 |
| 核价超时时间 | 日期时间 | 48小时后自动标记超时 |
| 核价结果 | 单选 | 通过/被拒/超时 |

---

### J.2 数据一致性校验机制

**问题**：飞书表格数据与Temu平台可能不一致（人工修改、同步失败等）

**解决方案**：

```python
class DataConsistencyChecker:
    """数据一致性校验器"""
    
    def check_all(self):
        """全量校验（每天凌晨执行）"""
        discrepancies = []
        
        # 1. 获取所有已同步产品
        products = self.bitable.get_by_status('已同步')
        
        for product in products:
            # 2. 查询Temu平台实际数据
            temu_data = self.temu.get_product_details(product['temu_id'])
            
            # 3. 比对每个国家的价格和库存
            for country in EU_COUNTRIES:
                bitable_price = product['prices'].get(country)
                temu_price = temu_data['prices'].get(country)
                
                if bitable_price != temu_price:
                    discrepancies.append({
                        'sku': product['sku'],
                        'country': country,
                        'field': 'price',
                        'bitable_value': bitable_price,
                        'temu_value': temu_price
                    })
        
        # 4. 生成差异报告
        if discrepancies:
            self.generate_report(discrepancies)
            send_alert(f"发现 {len(discrepancies)} 处数据不一致，请查看报告")
    
    def sync_to_bitable(self, discrepancies):
        """以Temu平台为准，同步回飞书表格"""
        for item in discrepancies:
            self.bitable.update_field(
                item['sku'], 
                f"{item['country']}_价格", 
                item['temu_value']
            )
```

**校验报告格式**：
```
数据一致性校验报告
时间：2024-03-31 02:00
发现差异：3处

┌─────────┬────────┬──────────┬─────────────┬─────────────┐
│ SKU     │ 国家   │ 字段     │ 飞书表格    │ Temu平台    │
├─────────┼────────┼──────────┼─────────────┼─────────────┤
│ SKU-001 │ FR     │ 价格     │ 55 EUR      │ 52 EUR      │
│ SKU-002 │ UK     │ 库存     │ 100         │ 95          │
│ SKU-003 │ DE     │ 价格     │ 50 EUR      │ 48 EUR      │
└─────────┴────────┴──────────┴─────────────┴─────────────┘

[一键同步] [忽略差异] [查看详情]
```

---

### J.3 回滚机制

**问题**：同步后发现价格填错，需要批量回滚

**解决方案**：

```python
class RollbackManager:
    """回滚管理器"""
    
    def __init__(self):
        self.history = []  # 操作历史记录
    
    def record_operation(self, operation):
        """记录每次同步操作"""
        self.history.append({
            'timestamp': datetime.now(),
            'sku': operation['sku'],
            'countries': operation['countries'],
            'old_prices': operation['old_prices'],  # 同步前的价格
            'new_prices': operation['new_prices'],
            'operator': operation['operator']
        })
    
    def rollback(self, sku, countries=None, timestamp=None):
        """
        回滚操作
        
        Args:
            sku: 产品SKU
            countries: 指定国家（None表示全部）
            timestamp: 回滚到指定时间点
        """
        # 1. 查找历史记录
        history = self.find_history(sku, timestamp)
        
        if not history:
            return {'success': False, 'error': '未找到历史记录'}
        
        # 2. 构建回滚数据
        rollback_countries = countries or history['countries']
        rollback_prices = {}
        
        for country in rollback_countries:
            rollback_prices[country] = history['old_prices'][country]
        
        # 3. 执行回滚（重新同步旧价格）
        result = self.temu.sync_product(sku, rollback_prices)
        
        # 4. 记录回滚操作
        self.record_rollback(sku, rollback_countries, result)
        
        return result
```

**飞书指令支持**：
```
@小乔 回滚 Temu SKU-001 到 昨天
@小乔 回滚 Temu SKU-002 的 法国,德国 价格
```

---

### J.4 成本估算

#### API方案成本

| 项目 | 单价 | 月均用量 | 月成本 |
|------|------|----------|--------|
| Temu API调用 | 免费（当前） | 10万次 | ¥0 |
| 服务器（ECS） | ¥200/月 | 1台 | ¥200 |
| 飞书多维表格 | 免费版 | - | ¥0 |
| **合计** | | | **¥200/月** |

#### RPA方案成本

| 项目 | 单价 | 月均用量 | 月成本 |
|------|------|----------|--------|
| 影刀RPA企业版 | ¥500/月 | 1账号 | ¥500 |
| 云服务器 | ¥200/月 | 1台 | ¥200 |
| 住宅IP代理 | ¥300/月 | 10个IP | ¥300 |
| **合计** | | | **¥1000/月** |

**结论**：API方案成本仅为RPA方案的20%

---

### J.5 灰度发布策略

**上线阶段**：

```
Phase 1：内部测试（1-3天）
├── 5个测试SKU
├── 3个目标国家
├── 手动验证数据准确性
└── 修复明显bug

Phase 2：小范围灰度（3-7天）
├── 10%的产品（约10-20个SKU）
├── 全量25国
├── 每日检查同步成功率
└── 收集用户反馈

Phase 3：全量上线（1周后）
├── 100%产品接入
├── 监控核心指标
└── 准备回滚方案
```

**回滚标准**：
- 同步成功率 < 90%
- 收到3次以上用户投诉
- 发现数据丢失或错误

---

### J.6 监控大盘设计

**核心指标**：

| 指标 | 正常范围 | 告警阈值 |
|------|----------|----------|
| 日同步成功率 | > 95% | < 90% |
| 平均同步耗时 | < 3秒 | > 10秒 |
| API错误率 | < 1% | > 5% |
| 核价通过率 | > 70% | < 50% |
| 数据一致率 | > 99% | < 95% |

**监控面板**：
```
┌─────────────────────────────────────────────────────────┐
│  Temu同步监控大盘                    2024-03-31 14:30   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  今日同步: 156/160 (97.5%)          平均耗时: 2.3s     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  [████████░░]       │
│                                                         │
│  核价状态分布:                                          │
│  ┌─────────┬─────────┬─────────┬─────────┐             │
│  │ 待同步  │ 核价中  │ 已通过  │ 已拒绝  │             │
│  │   45    │   12    │  156    │    8    │             │
│  └─────────┴─────────┴─────────┴─────────┘             │
│                                                         │
│  最近5次同步:                                           │
│  ✅ SKU-001  14:25  25国  2.1s                          │
│  ✅ SKU-002  14:24  25国  2.3s                          │
│  ❌ SKU-003  14:22  25国  超时                          │
│  ✅ SKU-004  14:20  25国  2.0s                          │
│  ✅ SKU-005  14:18  25国  2.4s                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### J.7 权限管理细节

**角色权限矩阵**：

| 功能 | 管理员 | 运营 | 财务 | 查看员 |
|------|--------|------|------|--------|
| 触发同步 | ✅ | ✅ | ❌ | ❌ |
| 修改价格 | ✅ | ✅ | ❌ | ❌ |
| 查看报表 | ✅ | ✅ | ✅ | ✅ |
| 修改库存 | ✅ | ✅ | ❌ | ❌ |
| 账号配置 | ✅ | ❌ | ❌ | ❌ |
| 查看日志 | ✅ | ✅ | ❌ | ❌ |
| 数据导出 | ✅ | ✅ | ✅ | ❌ |

**多账号隔离**：
- 运营A只能看到/操作账号A的产品
- 运营B只能看到/操作账号B的产品
- 管理员可以看到全部

---

### J.8 数据备份策略

**备份内容**：
1. 飞书多维表格数据（每日自动导出）
2. 同步操作日志（保留90天）
3. 配置文件（加密存储）

**备份频率**：
| 数据类型 | 备份频率 | 保留周期 |
|----------|----------|----------|
| 产品价格数据 | 每日 | 30天 |
| 操作日志 | 实时 | 90天 |
| 配置文件 | 变更时 | 永久 |

**恢复流程**：
```
1. 确认数据丢失范围
2. 从备份中恢复最近的数据
3. 手动补录缺失的数据
4. 执行一致性校验
5. 通知相关人员
```

---

*补充时间：2026-03-31  
*版本：v1.5（实际落地优化）
