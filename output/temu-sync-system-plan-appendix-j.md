

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
