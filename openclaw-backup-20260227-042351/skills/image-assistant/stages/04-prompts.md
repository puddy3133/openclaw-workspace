# 阶段4：提示词封装（Prompt Pack：可执行生成包）

**目标：** 把阶段3的 Copy Spec 原样封装成"可复制/可调用"的提示词包（Prompt Pack），并通过浏览器调用用户账号的 Gemini 出图，最终将图片回传到对话中展示。阶段4不负责改文案，只负责：模板拼装、风格一致、参数/约束齐全、避免模型乱加字、最终直接生图。

## 封装原则（避免和阶段3混淆）

- **Copy Spec 是唯一真值**：提示词中"必须逐字放入"的文字，直接来自阶段3，不在这里重写。
- **提示词负责"怎么画"**：画幅、版式、留白、对齐、图标隐喻、风格块、强制约束、负面提示、参数。
- **封面类默认"禁额外小字"**：明确写"除指定文字外不要生成任何额外文字"。

## 生成步骤（按顺序）

1. 选定结构模板（与 Copy Spec 的版式一致）
2. 粘贴通用风格块：`templates/style-block.md`
   - **风格基准锁定**：每张图都必须以 `templates/style-block.md` 定义的风格作为**唯一允许的基础风格**来生成（奶油纸 + 彩铅线稿 + 淡水彩 + 轻涂鸦、少字高可读）。
   - **不得换风格**：不要让模型自行切换成扁平矢量海报风/3D/摄影写实等"更像信息图默认风格"的路线。
   - 允许你用自己的话描述该风格，但不能删掉关键要素与负面约束（否则风格会被模型先验带偏）。
3. 写清楚画幅/用途（PPT远看 vs 手机近看）与排版硬约束（对齐、留白、字号）
4. 粘贴 Copy Spec 的"必须逐字放入的文字"
5. 加强制约束 + 负面提示（无乱码/不加字/不密集小字/不背景杂乱）
6. **用户确认提示词后，通过浏览器 Gemini 出图（见下方详细流程）**

## 模板使用

- 通用风格块：`templates/style-block.md`
- 结构模板：
  - 封面路线图（目录/5步）：`templates/16x9-cover-roadmap.md`
  - 对比两卡：`templates/16x9-contrast-2cards.md`
  - 三卡洞察：`templates/16x9-3cards-insights.md`
  - 五格漫画：`templates/16x9-5panel-comic.md`
  - 通用信息图：`templates/16x9-infographic.md`

## 本阶段输出物

- **Prompt Pack**：按"图1/图2/…"编号输出；每张图一个独立代码块（便于复制）；代码块外最多 1–2 句说明
- **执行方式**：用户确认提示词后，**通过浏览器 Gemini 逐张出图，回传图片到对话中展示**

## 为什么"阶段4"容易风格跑偏（解释逻辑）

阶段4本质是"用文字去约束一个带强默认审美的出图模型"，风格会被多方力量拉扯：

1. **模型先验（Style Prior）**：很多模型看到 "infographic/信息图" 会自动偏向"干净的扁平矢量/海报风"，即使你写了彩铅水彩，也可能只被当作弱建议。
2. **可读性约束会压过质感**：当你同时要求"中文大字号、严格对齐、少字、清晰"，模型会优先保证字清楚与版式稳定，牺牲纸纹、彩铅笔触等"质感细节"。
3. **风格基准不够"排他"会降权**：如果不强调"这是唯一允许风格，不能换"，模型会把它当成"可选项"，然后自动回到信息图的默认风格（常见是扁平矢量/海报风）。
4. **风格词太短/太抽象**：仅写"彩铅水彩"不足以锁定细节，需要补"纸纹可见、笔触可见、轻晕染"等可观察特征，并配合负面约束（已在风格块中补强）。

实操上要提升稳定性：在每张图的 prompt 里都明确"以该风格为唯一基础，不得换风格"，并加入"不要扁平矢量/不要3D/不要摄影"等负面约束来对冲模型的默认风格。

---

## 通过浏览器 Gemini 出图（用户账号直接生成）

> 规则：**先封装 Prompt Pack 并展示给用户 → 用户确认后通过浏览器打开 `gemini.google.com` 逐张出图 → 提取图片回传到对话中展示**。不需要任何 API 配置或脚本，使用用户已登录的 Gemini 账号。

### 前提条件

- 用户已在浏览器中登录 `gemini.google.com`（Gemini Pro 账号）
- 确认浏览器页面处于可用状态（能看到 Gemini 对话界面）

### 出图流程

1. **展示提示词**：将每张图的 Prompt Pack 以独立代码块展示给用户
2. **用户确认**：等用户确认提示词 OK
3. **翻译 Prompt**：由于浏览器工具不支持直接输入中文字符，需要将中文 Prompt 翻译为**英文版**，但必须加上以下强制指令：
   - `"ALL text on the image MUST be in Chinese (简体中文). Do NOT use English for any labels, titles, or descriptions on the image."`
   - 将 Copy Spec 中的中文文案用引号原样保留（如 `Chinese text: "思考拍档"` ），确保 Gemini 知道图上该写什么中文
4. **打开 Gemini**：用 `browser_subagent` 打开 `https://gemini.google.com/`（用户已登录的页面）
5. **输入并提交**：在 Gemini 输入框中键入翻译后的英文 Prompt，点击发送
6. **等待生成**：等待 30–45 秒让 Gemini 完成图片生成
7. **提取并保存图片**：Gemini 生成图片后，获取纯净的图片文件（不含 Gemini UI）：
   - 从 Gemini 页面 DOM 中找到生成图片的 `<img>` 标签，提取 `src` 属性中的 `lh3.googleusercontent.com` URL
   - **直接在浏览器中打开该 URL**（导航到图片直链），页面上只会显示纯净的图片
   - 对该页面**截图并保存**到项目的 `out/` 目录（如 `out/图1_封面.png`）
   - ⚠️ 不要截图 Gemini 的展开视图，那样会包含返回箭头、分享/复制/下载等 UI 图标
8. **在对话中展示图片**：使用 `notify_user` 工具，将保存的图片以内嵌方式展示给用户预览：
   - 用 `![图片描述](file:///绝对路径/out/图1_封面.png)` 格式嵌入图片
   - 同时输出图片的本地文件路径，方便用户在 Finder 中查找
9. **用户选择下一步**：展示图片后，提供以下选项让用户选择：
   - **✅ 满意** → 继续生成下一张图（如有多张），或进入阶段5（迭代润色）
   - **🔄 调整** → 在 Gemini 同一对话中追加修改指令，重新生成
   - **❌ 重做** → 修改 Prompt 后重新开始一轮生图

### Prompt 翻译示例

**原始中文 Prompt（阶段4 输出）：**

```
16:9横版信息图，奶油色纸张底，彩铅线稿+淡水彩，暖色调。
标题大字："Puddy SkillsHub 技能全景图"
下方3行4列排列12个技能卡片...
```

**翻译后的英文 Prompt（用于浏览器输入）：**

```
Generate a 16:9 horizontal infographic on cream-colored textured paper,
colored pencil line art with light watercolor washes, warm tones.
Title in large bold text: "Puddy SkillsHub 技能全景图"
Below, arrange 12 skill cards in 3 rows of 4...

CRITICAL: ALL text on the image MUST be in Chinese (简体中文).
Do NOT use English for any labels, titles, or descriptions on the image.
```

### 图片保存规范

- **截图保存路径**：`image-assistant/out/` 目录下，命名格式 `图{编号}_{简短描述}.png`
  - 例如：`out/图1_封面路线图.png`、`out/图2_对比两卡.png`
- **高清下载**：通过 Gemini 页面的下载按钮下载到 `~/Downloads`，分辨率更高
- **用户可选**：截图版用于快速预览，高清版用于正式使用

### 注意事项

- **每张图单独提交一次**。如果有多张图，在 Gemini 中开新对话避免上下文干扰
- **如果用户对某张图不满意**，可以在 Gemini 同一对话中追加修改指令（如 "make the text bigger" / "change the icon for card 3"）
- **如果浏览器未登录**，提醒用户先手动登录 `gemini.google.com` 后再试

