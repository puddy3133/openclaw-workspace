# 小乔声音样本档案

## 样本信息

| 样本 | 文件名 | 来源 | 日期 | 用途 |
|------|--------|------|------|------|
| 样本1 | xiaoqiao_voice_sample_1.mp4 | 国栋提供 | 2026-03-24 | 默认声音参考 |
| 样本2 | xiaoqiao_voice_sample_2.mp4 | 国栋提供 | 2026-03-24 | 默认声音参考 |

## 说明

- 这两个视频文件包含国栋提供的小乔声音样本
- 当前作为小乔的默认声音参考存档
- 后续如有 TTS 声音克隆功能，可作为训练素材
- 文件保存在 `memory/voice/` 目录

## 技术备注

- 格式：MP4 (视频+音频)
- 如需提取音频，可使用 ffmpeg：
  ```bash
  ffmpeg -i xiaoqiao_voice_sample_1.mp4 -vn -acodec libmp3lame sample1.mp3
  ```

---
*创建时间：2026-03-24*
