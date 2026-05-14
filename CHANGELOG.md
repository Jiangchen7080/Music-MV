# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-14

### Added

- 音频上传 + 歌词解析（LRC/纯文本）
- 三种生成模式：逐句匹配、按主题分段、氛围循环
- MV 时长选项：短版（30-60s）、中版（60-90s）、全曲
- 视频比例：竖屏 9:16、横屏 16:9
- 10 种字幕风格 + 15 种转场风格
- 交互式时间线编辑器（替换素材、分割、裁剪、排序）
- 多源素材搜索：Pixabay、Pexels、Videvo（适配器模式）
- 自动高光检测 + 音频截取（短版/中版）
- 纯音乐模式（无歌词自动分段）
- 音频波形可视化
- 歌曲风格描述（优化素材匹配）
- FFmpeg.wasm 视频渲染引擎（MP4 导出）
- 5 步工作流：上传 → 配置 → 生成 → 编辑 → 输出
- 深色主题 + 蓝紫渐变设计