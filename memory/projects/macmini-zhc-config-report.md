# Mac mini (zhc) 完整配置报告

**生成时间**: 2026-04-04 22:21 CST  
**设备**: Mac mini (zhc)  
**序列号**: F9Q9LTLQHF

---

## 一、硬件配置

| 项目 | 规格 |
|------|------|
| **型号** | Mac mini (M4, 2024) |
| **型号标识** | Mac16,10 |
| **型号编号** | MU9D3CH/A |
| **芯片** | Apple M4 (ARM64 T8132) |
| **内存** | 16 GB |
| **存储** | 256 GB SSD (228Gi 总容量) |
| **已用存储** | 11Gi (6%) |
| **可用存储** | 192Gi |

---

## 二、系统配置

| 项目 | 版本/状态 |
|------|----------|
| **操作系统** | macOS 26.2 |
| **构建版本** | 25C56 |
| **Darwin 内核** | 25.2.0 |
| **Shell** | zsh (/bin/zsh) |
| **防火墙** | ❌ 已禁用 |
| **系统启动时间** | 6小时29分钟 |
| **当前负载** | 1.64 1.81 2.16 |

---

## 三、用户配置

| 项目 | 值 |
|------|-----|
| **当前用户** | zhc |
| **用户 ID** | 501 |
| **主组** | staff (20) |
| **管理员权限** | ✅ 是 (admin 组) |
| **附加组** | everyone, localaccounts, _appserverusr, _appserveradm, _developer, _analyticsusers 等 |
| **特殊权限** | SSH 访问、屏幕共享、远程 AE |

---

## 四、网络配置

### 网络接口
- **Ethernet** (有线)
- **Wi-Fi** (无线)
- **Thunderbolt Bridge**

### IP 配置
- **内网 IP**: 192.168.1.213
- **子网掩码**: 255.255.254.0 (/23)
- **广播地址**: 192.168.1.255

### 远程访问
| 服务 | 协议 | 本地端口 | 远程端口 | 状态 |
|------|------|---------|---------|------|
| **SSH** | TCP | 22 | 6000 (via frp) | ✅ 可用 |
| **VNC** | TCP | 5900 | 5900 (via frp) | ✅ 可用 |
| **OpenClaw Gateway** | TCP | 18789 | localhost only | ✅ 运行中 |

---

## 五、已安装应用

| 应用 | 路径 | 说明 |
|------|------|------|
| **AweSun** | /Applications/AweSun.app | 远程桌面软件 |
| **Safari** | /Applications/Safari.app | 系统浏览器 |
| **Tabbit Browser** | /Applications/Tabbit Browser.app | 第三方浏览器 |
| **Visual Studio Code** | /Applications/Visual Studio Code.app | 代码编辑器 |
| **Utilities** | /Applications/Utilities/ | 系统工具文件夹 |

**总计**: 5 个应用

---

## 六、OpenClaw 配置

### 运行状态
| 项目 | 状态 |
|------|------|
| **Gateway** | ✅ 运行中 (PID: 13274) |
| **TUI** | ✅ 运行中 (PID: 13351, 13352) |
| **版本** | 2026.3.2 |
| **最后配置** | 2026-04-04 12:11:15 UTC |

### Gateway 端口
- **HTTP API**: 127.0.0.1:18789
- **WebSocket**: 127.0.0.1:18791
- **内部通信**: 127.0.0.1:18792
- **mDNS**: UDP *:mdns

### 已配置模型 (火山方舟)
- **模型**: kimi-k2.5
- **API 地址**: https://ark.cn-beijing.volces.com/api/coding/v3
- **API Key**: `2f4c7b2d-e630-4329-bf32-75c88e8ecba8`

### 配置文件位置
```
~/.openclaw/
├── openclaw.json          # 主配置
├── openclaw.json.bak      # 备份
├── workspace/             # 工作空间
├── skills/                # 技能目录
├── agents/                # Agent 配置
├── extensions/            # 扩展
├── cron/                  # 定时任务
├── logs/                  # 日志
└── credentials/           # 凭证
```

---

## 七、后台服务

| 服务 | PID | 状态 | 说明 |
|------|-----|------|------|
| **openclaw-gateway** | 13274 | 运行中 | OpenClaw 网关 |
| **openclaw-tui** | 13352 | 运行中 | TUI 界面 |
| **openclaw** | 13351 | 运行中 | 主进程 |
| **VS Code** | 9164 | 运行中 | 代码编辑器 |
| **AweSun Agent** | 9076 | 运行中 | 远程桌面 |
| **Tabbit Browser** | 1741 | 运行中 | 浏览器 |
| **ssh-agent** | - | 运行中 | SSH 密钥代理 |

---

## 八、frp 内网穿透配置

### 服务端 (frps)
- **位置**: 大乔 (腾讯云 1.12.62.15)
- **端口**: 7000
- **Token**: zhc2024macmini

### 客户端 (frpc)
- **位置**: Mac mini
- **路径**: ~/frp_0.60.0_darwin_arm64/frpc
- **配置**: ~/frpc.ini
- **PID**: 15486
- **状态**: ✅ 运行中

### 端口映射
```ini
[macmini_ssh]  本地:22   → 远程:6000
[macmini_vnc]  本地:5900 → 远程:5900
```

---

## 九、监听端口汇总

| 端口 | 协议 | 服务 | 绑定地址 |
|------|------|------|---------|
| 22 | TCP | SSH | * |
| 5900 | TCP | VNC/屏幕共享 | * |
| 18789 | TCP | OpenClaw Gateway | 127.0.0.1 |
| 18791 | TCP | OpenClaw WebSocket | 127.0.0.1 |
| 18792 | TCP | OpenClaw 内部 | 127.0.0.1 |

---

## 十、快速参考

### SSH 连接
```bash
ssh -p 6000 zhc@1.12.62.15
# 密码: zhc135!
```

### 检查 OpenClaw 状态
```bash
ps aux | grep openclaw
lsof -i :18789
```

### 重启 frpc
```bash
kill 15486  # 停止旧进程
~/frp_0.60.0_darwin_arm64/frpc -c ~/frpc.ini
```

### 检查系统状态
```bash
# 系统信息
system_profiler SPHardwareDataType

# 磁盘使用
df -h /

# 内存使用
vm_stat

# 网络状态
ifconfig
```

---

## 十一、注意事项

1. **防火墙已禁用** - 建议在生产环境启用
2. **OpenClaw Gateway 仅监听 localhost** - 如需远程访问需配置反向代理
3. **frpc 已后台运行** - 重启后需手动启动或配置开机启动
4. **AweSun 也在运行** - 可能有端口冲突风险
5. **Homebrew 未安装** - 如需安装软件建议先安装 Homebrew

---

*报告生成完成*
