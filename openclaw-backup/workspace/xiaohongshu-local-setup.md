# 小红书自动化 - 本地部署指南

## 🚀 一键发布方案

### 步骤 1：设置 Cookie（只需一次）

```bash
# 在你的终端执行
export XIAOHONGSHU_COOKIE='040069b91f9ca926c710a5ad943b4b160d29b0'

# 验证设置成功
echo $XIAOHONGSHU_COOKIE
```

### 步骤 2：生成内容

告诉小乔：
- "帮我生成一篇小红书内容，主题是 XXX"
- 小乔会生成：
  - `output/cover.png` - 封面图
  - `output/content_1~4.png` - 内容图
  - `output/caption.json` - 标题正文话题词

### 步骤 3：一键发布

```bash
# 进入工作目录
cd ~/.openclaw/workspace

# 运行发布脚本
./post-to-xiaohongshu.sh

# 或者直接用 Python
python3 xiaohongshu_poster.py
```

---

## 📁 文件说明

| 文件 | 用途 |
|------|------|
| `xiaohongshu_poster.py` | 发布脚本主体 |
| `post-to-xiaohongshu.sh` | 一键发布入口 |
| `output/caption.json` | 生成的内容 |
| `output/*.png` | 生成的图片 |

---

## ⚠️ 注意事项

1. **Cookie 有效期** - 通常 7-30 天，过期后需要重新设置
2. **发布频率** - 建议间隔 5-10 分钟，避免触发风控
3. **内容审核** - 脚本会先展示内容，确认后再发布
4. **网络环境** - 建议使用与登录时相同的网络

---

## 🔧 进阶配置

### 添加到 ~/.zshrc（永久生效）

```bash
echo 'export XIAOHONGSHU_COOKIE="040069b91f9ca926c710a5ad943b4b160d29b0"' >> ~/.zshrc
source ~/.zshrc
```

### 创建别名（快速发布）

```bash
echo 'alias xhs="cd ~/.openclaw/workspace && ./post-to-xiaohongshu.sh"' >> ~/.zshrc
source ~/.zshrc

# 以后只需输入
xhs
```

---

## ❓ 常见问题

**Q: Cookie 过期了怎么办？**
A: 重新登录小红书网页版，获取新的 Cookie，更新环境变量

**Q: 发布失败怎么办？**
A: 检查网络、Cookie 是否有效、是否触发风控

**Q: 可以定时发布吗？**
A: 可以配合 cron 任务实现定时发布

---

准备好后，告诉小乔"生成小红书内容"即可开始！
