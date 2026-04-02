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
