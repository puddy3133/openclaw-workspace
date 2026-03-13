# GitHub 文件上传助手

> 创建时间: 2026-02-27
> 用途: 协助他人上传文件到 GitHub

---

## 目录结构

```
github-upload-helper/
├── incoming/          # 放置待上传的文件
├── scripts/           # 上传脚本
├── logs/              # 操作日志
└── README.md          # 本文件
```

---

## 使用步骤

### 1. 获取 GitHub Token

**你需要自行创建 Token：**

1. 登录 GitHub → 点击头像 → Settings
2. 左侧菜单最下方 → Developer settings
3. Personal access tokens → Fine-grained tokens
4. Generate new token
5. 填写信息：
   - **Token name**: `upload-helper-$(date +%Y%m%d)`
   - **Expiration**: 选择 Custom → 设置为 1 小时后
   - **Description**: 临时文件上传助手
   - **Repository access**: 选择你的目标仓库
   - **Permissions**: 
     - Contents: **Read and Write**
6. 点击 Generate token
7. **复制 Token**（只显示一次！）

### 2. 发送给对方

将以下信息发给协助者：

```
GitHub Token: ghp_xxxxxxxxxxxx (1小时有效)
目标仓库: your-username/your-repo
目标分支: main
上传目录: incoming/
```

### 3. 对方上传文件

对方使用以下脚本上传：

```bash
# 设置变量
TOKEN="ghp_xxxxxxxxxxxx"
REPO="your-username/your-repo"
BRANCH="main"
FILE_PATH="要上传的文件路径"
TARGET_PATH="incoming/文件名"

# 上传文件
curl -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d "{\"message\":\"Upload file\",\"content\":\"$(base64 -i $FILE_PATH)\",\"branch\":\"$BRANCH\"}" \
  "https://api.github.com/repos/$REPO/contents/$TARGET_PATH"
```

---

## 安全提醒

⚠️ **Token 安全**
- Token 相当于你的账号密码
- 只给信任的人
- 设置最短的有效期（1小时）
- 用完立即在 GitHub 上撤销

⚠️ **撤销 Token**
- GitHub → Settings → Developer settings → Personal access tokens
- 找到对应的 token → Delete

---

## 快捷脚本

### 创建 Token 脚本（保存到 scripts/）

```bash
#!/bin/bash
# create-token.sh - 辅助创建 Token 的提示

echo "=== GitHub Token 创建助手 ==="
echo ""
echo "请按以下步骤操作："
echo ""
echo "1. 打开: https://github.com/settings/tokens?type=beta"
echo "2. 点击 'Generate new token'"
echo "3. 填写:"
echo "   - Token name: upload-helper-$(date +%Y%m%d)"
echo "   - Expiration: Custom → $(date -v+1H '+%Y-%m-%d %H:%M')"
echo "   - Repository: 选择你的仓库"
echo "   - Permissions: Contents (Read and Write)"
echo "4. 点击 Generate"
echo "5. 复制 Token（只显示一次！）"
echo ""
echo "Token 格式: ghp_xxxxxxxxxxxxxxxxxxxx"
```

### 上传文件脚本（给对方使用）

```bash
#!/bin/bash
# upload-file.sh - 上传文件到 GitHub

TOKEN="$1"
REPO="$2"
FILE="$3"
TARGET="${4:-incoming/$(basename $FILE)}"

if [ -z "$TOKEN" ] || [ -z "$REPO" ] || [ -z "$FILE" ]; then
    echo "用法: ./upload-file.sh <TOKEN> <REPO> <FILE> [TARGET_PATH]"
    exit 1
fi

if [ ! -f "$FILE" ]; then
    echo "错误: 文件不存在: $FILE"
    exit 1
fi

CONTENT=$(base64 -i "$FILE")
FILENAME=$(basename "$FILE")

echo "上传 $FILENAME 到 $REPO/$TARGET ..."

RESPONSE=$(curl -s -X PUT \
    -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    -d "{\"message\":\"Upload $FILENAME\",\"content\":\"$CONTENT\",\"branch\":\"main\"}" \
    "https://api.github.com/repos/$REPO/contents/$TARGET")

if echo "$RESPONSE" | grep -q '"sha"'; then
    echo "✅ 上传成功!"
    echo "URL: $(echo $RESPONSE | grep -o '"html_url":"[^"]*"' | cut -d'"' -f4)"
else
    echo "❌ 上传失败"
    echo "$RESPONSE" | grep -o '"message":"[^"]*"' | head -1
fi
```

---

## 日志记录

每次上传后记录到 `logs/upload.log`：

```
[2026-02-27 10:00:00] 上传: file.txt → incoming/file.txt (成功)
[2026-02-27 10:30:00] 上传: data.json → incoming/data.json (成功)
```
