/**
 * 日期格式化工具函数
 * @author @coder - 高级工程师
 * @description 提供灵活的日期格式化功能，支持多种常用格式
 */

/**
 * 格式化日期为指定格式的字符串
 * @param {Date | string | number} date - 要格式化的日期
 * @param {string} format - 格式模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 * 
 * 支持的格式占位符:
 * - YYYY: 四位年份 (2026)
 * - MM: 两位月份 (01-12)
 * - DD: 两位日期 (01-31)
 * - HH: 两位小时 (00-23)
 * - mm: 两位分钟 (00-59)
 * - ss: 两位秒 (00-59)
 * - d: 星期几 (0-6, 0为周日)
 * - SSS: 三位毫秒 (000-999)
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    // 统一转换为 Date 对象
    const d = date instanceof Date ? date : new Date(date);
    
    // 验证日期有效性
    if (isNaN(d.getTime())) {
        throw new Error('Invalid date input');
    }

    // 提取日期组件
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();
    const milliseconds = d.getMilliseconds();
    const weekDay = d.getDay();

    // 补零函数
    const pad = (num, len = 2) => String(num).padStart(len, '0');

    // 替换格式占位符
    return format
        .replace(/YYYY/g, year)
        .replace(/MM/g, pad(month))
        .replace(/DD/g, pad(day))
        .replace(/HH/g, pad(hours))
        .replace(/mm/g, pad(minutes))
        .replace(/ss/g, pad(seconds))
        .replace(/SSS/g, pad(milliseconds, 3))
        .replace(/d/g, weekDay);
}

/**
 * 获取相对时间描述
 * @param {Date | string | number} date - 目标日期
 * @param {Date | string | number} [baseDate] - 基准日期，默认为当前时间
 * @returns {string} 相对时间描述 (如: "3天前", "刚刚")
 */
function relativeTime(date, baseDate = new Date()) {
    const target = date instanceof Date ? date : new Date(date);
    const base = baseDate instanceof Date ? baseDate : new Date(baseDate);
    
    const diffMs = base.getTime() - target.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return '刚刚';
    if (diffMin < 60) return `${diffMin}分钟前`;
    if (diffHour < 24) return `${diffHour}小时前`;
    if (diffDay < 30) return `${diffDay}天前`;
    if (diffDay < 365) return `${Math.floor(diffDay / 30)}个月前`;
    return `${Math.floor(diffDay / 365)}年前`;
}

/**
 * 获取指定日期的开始/结束时间
 * @param {Date | string | number} date - 目标日期
 * @param {'day' | 'week' | 'month' | 'year'} unit - 时间单位
 * @param {'start' | 'end'} position - 开始或结束
 * @returns {Date} 计算后的日期对象
 */
function dateBoundary(date, unit = 'day', position = 'start') {
    const d = date instanceof Date ? new Date(date) : new Date(date);
    const isEnd = position === 'end';

    switch (unit) {
        case 'day':
            d.setHours(isEnd ? 23 : 0, isEnd ? 59 : 0, isEnd ? 59 : 0, isEnd ? 999 : 0);
            break;
        case 'week':
            const dayOfWeek = d.getDay();
            const diff = d.getDate() - dayOfWeek + (isEnd ? 6 : 0);
            d.setDate(diff);
            d.setHours(isEnd ? 23 : 0, isEnd ? 59 : 0, isEnd ? 59 : 0, isEnd ? 999 : 0);
            break;
        case 'month':
            d.setDate(isEnd ? new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() : 1);
            d.setHours(isEnd ? 23 : 0, isEnd ? 59 : 0, isEnd ? 59 : 0, isEnd ? 999 : 0);
            break;
        case 'year':
            d.setMonth(isEnd ? 11 : 0);
            d.setDate(isEnd ? 31 : 1);
            d.setHours(isEnd ? 23 : 0, isEnd ? 59 : 0, isEnd ? 59 : 0, isEnd ? 999 : 0);
            break;
        default:
            throw new Error(`Unsupported unit: ${unit}`);
    }

    return d;
}

// 模块导出 (兼容 CommonJS 和 ES Module)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formatDate, relativeTime, dateBoundary };
}

// 使用示例
if (require.main === module) {
    const now = new Date();
    
    console.log('=== 日期格式化工具测试 ===\n');
    
    console.log('1. 标准格式:', formatDate(now));
    console.log('2. 仅日期:', formatDate(now, 'YYYY-MM-DD'));
    console.log('3. 仅时间:', formatDate(now, 'HH:mm:ss'));
    console.log('4. 自定义格式:', formatDate(now, 'YYYY年MM月DD日 HH时mm分'));
    console.log('5. 带星期:', formatDate(now, 'YYYY-MM-DD 星期d'));
    
    console.log('\n=== 相对时间测试 ===\n');
    
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    console.log('昨天:', relativeTime(yesterday));
    console.log('上周:', relativeTime(lastWeek));
    
    console.log('\n=== 日期边界测试 ===\n');
    
    console.log('今天开始:', formatDate(dateBoundary(now, 'day', 'start')));
    console.log('今天结束:', formatDate(dateBoundary(now, 'day', 'end')));
    console.log('本周开始:', formatDate(dateBoundary(now, 'week', 'start')));
    console.log('本月开始:', formatDate(dateBoundary(now, 'month', 'start')));
}
