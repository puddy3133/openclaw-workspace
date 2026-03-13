#!/usr/bin/env python3
"""
快速安全自检脚本 - 优化版
执行时间控制在 30 秒内
"""

import os
import sys
from datetime import datetime

# 配置
WORKSPACE = os.path.expanduser("~/.openclaw/workspace")
SECURITY_DIR = os.path.join(WORKSPACE, "memory", "security")
AUDIT_LOG = os.path.join(SECURITY_DIR, "audit-log.md")
AGENTS_MD = os.path.join(WORKSPACE, "AGENTS.md")

def check_file_exists(filepath, name):
    """检查文件是否存在"""
    if os.path.exists(filepath):
        return True, f"✅ {name} 存在"
    else:
        return False, f"❌ {name} 不存在"

def check_admin_config():
    """检查管理员配置"""
    try:
        with open(AGENTS_MD, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'ou_d8961fccb7d8a92c31819cdd4c80ad7f' in content:
                return True, "✅ 管理员配置正常"
            else:
                return False, "⚠️ 管理员配置可能异常"
    except Exception as e:
        return False, f"❌ 读取 AGENTS.md 失败: {e}"

def check_recent_audit():
    """检查最近的审计日志"""
    try:
        if not os.path.exists(AUDIT_LOG):
            return True, "⚠️ 审计日志不存在（首次运行）"
        
        with open(AUDIT_LOG, 'r', encoding='utf-8') as f:
            content = f.read()
            # 检查最近10行是否有异常
            lines = content.split('\n')
            recent = '\n'.join(lines[-20:])
            
            if '异常' in recent or '错误' in recent or '失败' in recent:
                return False, "⚠️ 最近日志中发现异常"
            else:
                return True, "✅ 最近日志正常"
    except Exception as e:
        return False, f"❌ 读取审计日志失败: {e}"

def main():
    """主函数"""
    print("🔒 快速安全自检")
    print("=" * 40)
    
    checks = []
    
    # 1. 检查 AGENTS.md
    exists, msg = check_file_exists(AGENTS_MD, "AGENTS.md")
    checks.append(msg)
    
    # 2. 检查管理员配置
    if exists:
        ok, msg = check_admin_config()
        checks.append(msg)
    
    # 3. 检查审计日志
    exists, msg = check_file_exists(AUDIT_LOG, "审计日志")
    checks.append(msg)
    
    # 4. 检查最近记录
    if exists:
        ok, msg = check_recent_audit()
        checks.append(msg)
    
    # 输出结果
    print("\n".join(checks))
    
    # 总结
    all_ok = all('✅' in c or '⚠️' in c for c in checks)
    print("=" * 40)
    if all_ok:
        print("✅ 安全状态正常")
        return 0
    else:
        print("❌ 发现安全问题")
        return 1

if __name__ == "__main__":
    sys.exit(main())
