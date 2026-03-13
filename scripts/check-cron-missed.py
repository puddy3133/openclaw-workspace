#!/usr/bin/env python3
"""
启动时检查遗漏的 Cron 任务
在 AGENTS.md 启动流程中调用
"""

import os
import glob
from datetime import datetime, timedelta

def check_daily_log():
    """检查昨日记忆日志是否存在"""
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    log_path = f"{os.path.expanduser('~')}/.openclaw/workspace/memory/{yesterday}.md"
    
    if os.path.exists(log_path):
        return None  # 正常
    else:
        return f"昨日记忆日志 ({yesterday}.md) 未创建"

def check_weekly_review():
    """检查上周回顾是否存在（如果是周一）"""
    today = datetime.now()
    if today.weekday() != 0:  # 0=周一
        return None  # 不是周一，不检查
    
    # 获取上周的周数
    last_week = today - timedelta(days=7)
    week_str = last_week.strftime("%Y-W%W")
    review_path = f"{os.path.expanduser('~')}/.openclaw/workspace/memory/weekly/{week_str}.md"
    
    if os.path.exists(review_path):
        return None  # 正常
    else:
        return f"上周回顾 ({week_str}.md) 未生成"

def check_monthly_cleanup():
    """检查上月清理记录（如果是每月1日）"""
    today = datetime.now()
    if today.day != 1:
        return None  # 不是1日，不检查
    
    # 检查 security 目录下是否有上月的清理记录
    last_month = today - timedelta(days=1)
    month_str = last_month.strftime("%Y-%m")
    
    # 简化检查：检查是否有本月的任何日志文件
    security_dir = f"{os.path.expanduser('~')}/.openclaw/workspace/memory/security/"
    if os.path.exists(security_dir):
        files = glob.glob(f"{security_dir}*.md")
        # 检查是否有本月的文件
        for f in files:
            if month_str in f:
                return None  # 找到本月记录
    
    return "上月日志清理可能未执行"

def main():
    """主函数"""
    issues = []
    
    # 检查昨日日志
    result = check_daily_log()
    if result:
        issues.append(result)
    
    # 检查上周回顾（如果是周一）
    result = check_weekly_review()
    if result:
        issues.append(result)
    
    # 检查上月清理（如果是1日）
    result = check_monthly_cleanup()
    if result:
        issues.append(result)
    
    # 输出结果
    if issues:
        print("⚠️  发现遗漏的定时任务：")
        for issue in issues:
            print(f"  - {issue}")
        print("\n💡 可手动执行补救：")
        print("  openclaw cron run <job-id>")
        return 1
    else:
        print("✅ 所有定时任务正常")
        return 0

if __name__ == "__main__":
    exit(main())
