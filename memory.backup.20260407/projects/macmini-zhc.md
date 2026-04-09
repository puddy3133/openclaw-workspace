# Mac mini (zhc) 设备信息

**更新时间**: 2026-04-06 07:18 CST

---

## 基本信息

| 项目 | 值 |
|------|-----|
| **设备名称** | Mac mini (zhc) |
| **系统** | macOS Darwin 25.2.0 (ARM64 T8132) |
| **主机名** | 192.168.1.213 |
| **用户名** | zhc |
| **内网 IP** | 192.168.1.213 |
| **位置** | 公司局域网 |
| **当前状态** | ✅ 在线（已运行 2天3小时） |

---

## 远程访问配置

### frp 内网穿透

**服务端 (frps)**:
- 地址: `1.12.62.15:7000` (大乔/腾讯云)
- Token: `zhc2024macmini`

**客户端 (frpc)**:
- 路径: `/Users/zhc/frp_0.60.0_darwin_arm64/frpc`
- 配置: `/Users/zhc/frpc.ini`
- **PID**: `26917` (2026-04-06 更新)
- **状态**: ✅ 运行中
- **自启动**: ✅ 已配置 LaunchAgent

**自启动配置** (2026-04-06 添加):
```bash
# LaunchAgent 配置文件
~/Library/LaunchAgents/com.frpc.zhc.plist

# 查看服务状态
launchctl list | grep frpc

# 手动重启
launchctl unload ~/Library/LaunchAgents/com.frpc.zhc.plist
launchctl load ~/Library/LaunchAgents/com.frpc.zhc.plist
```

### 访问方式

| 服务 | 连接地址 | 本地端口 | 远程端口 | 认证 |
|------|---------|---------|---------|------|
| **SSH** | `ssh -p 6000 zhc@1.12.62.15` | 22 | 6000 | 密码: zhc135! |
| **VNC** | `vnc://1.12.62.15:5900` | 5900 | 5900 | 系统密码 |

---

## OpenClaw 状态

| 项目 | 状态 |
|------|------|
| **配置版本** | 2026.3.2 |
| **最后配置时间** | 2026-04-04 12:11:15 UTC |
| **可执行文件** | ❌ 未安装 |
| **Node.js** | ❌ 未安装 |
| **Gateway** | ❌ 未运行 |

**配置路径**: `~/.openclaw/`

### 已配置的模型
- **火山方舟 (ark)**: kimi-k2.5
- API Key: `2f4c7b2d-e630-4329-bf32-75c88e8ecba8`

---

## 文件位置

```
/Users/zhc/
├── frp_0.60.0_darwin_arm64/
│   ├── frpc              # frp 客户端
│   ├── frpc.toml
│   ├── frps
│   └── ...
├── frpc.ini              # frp 配置文件
├── start_frpc.sh         # 启动脚本
└── .openclaw/            # OpenClaw 配置目录
    ├── openclaw.json
    ├── workspace/
    ├── skills/
    └── ...
```

---

## 注意事项

1. **✅ frpc 已配置开机自启动** (2026-04-06 配置)
   - 使用 LaunchAgent 实现开机自动启动
   - 崩溃自动重启 (KeepAlive)
2. **✅ 休眠已完全关闭** (2026-04-06 配置)
   - 系统会保持在线，不会自动休眠
3. **内网 IP 变化不影响远程访问**，frp 会自动重连
4. **大乔 (1.12.62.15) 为固定 IP**，作为 frps 服务端

---

## 快速操作

### 重启 frpc
```bash
# 如果 frpc 停止，在 Mac mini 上执行
~/frp_0.60.0_darwin_arm64/frpc -c ~/frpc.ini

# 或后台运行
nohup ~/frp_0.60.0_darwin_arm64/frpc -c ~/frpc.ini > /dev/null 2>&1 &
```

### 检查 frpc 状态
```bash
ps aux | grep frpc
```

### SSH 连接
```bash
ssh -p 6000 zhc@1.12.62.15
# 密码: zhc135!
```

---

## 连接方式（小乔/OpenClaw 使用）

### 命令行 SSH
```bash
ssh -p 6000 -o ConnectTimeout=15 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null zhc@1.12.62.15
# 密码: zhc135!
```

### 自动化脚本连接
```bash
# 交互式（需要输入密码）
ssh -p 6000 -o ConnectTimeout=15 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null zhc@1.12.62.15 "uptime"

# 或使用 expect 自动输入密码
```

---

## frpc 自启动配置

### 方法一：LaunchAgent（推荐）

创建启动配置文件：
```bash
mkdir -p ~/Library/LaunchAgents
cat > ~/Library/LaunchAgents/com.frcp.zhc.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.frpc.zhc</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/zhc/frp_0.60.0_darwin_arm64/frpc</string>
        <string>-c</string>
        <string>/Users/zhc/frpc.ini</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/zhc/frpc.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/zhc/frpc_error.log</string>
</dict>
</plist>
EOF
```

加载并启动：
```bash
launchctl load ~/Library/LaunchAgents/com.frpc.zhc.plist
launchctl start com.frpc.zhc
```

### 方法二：启动脚本（已存在）

使用现有的启动脚本：
```bash
~/start_frpc.sh
```

---

## 休眠设置（已配置）

**状态**: ✅ 已全部关闭（2026-04-06 由 zhc 配置）

```bash
# 验证设置
pmset -g | grep -E 'sleep|hibernate|disksleep|womp|standby'

# 预期输出
 standby              0
 sleep                0 (sleep prevented by AweSun)
 hibernatemode        0
 disksleep            0
 womp                 1
```

**说明**: Mac mini 现在会保持在线，不会自动休眠。

- [2026-04-06] 远程连接配置完成，文档已更新至 ~/.openclaw/workspace/memory/projects/macmini-zhc.md，运行时间 2天3小时+
