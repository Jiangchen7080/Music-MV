# AI-MV Studio

> 纯浏览器端 AI 音乐 MV 自动生成工具 — 上传音频 + 歌词，自动匹配免费可商用视频素材，一键导出 MV。

[![CI](https://github.com/Jiangchen7080/Music-MV/actions/workflows/ci.yml/badge.svg)](https://github.com/Jiangchen7080/Music-MV/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## 功能特性

### 核心流程

| 步骤 | 功能 |
|------|------|
| 1. 上传 | 上传音频文件 + 粘贴歌词（可选，纯音乐也支持） |
| 2. 配置 | 选择生成模式、MV 时长、视频比例、字幕/转场风格 |
| 3. 生成 | 自动分析歌词、搜索素材、匹配画面、生成时间线 |
| 4. 编辑 | 可视化时间线编辑器，替换/分割/裁剪/排序每个片段 |
| 5. 输出 | FFmpeg.wasm 浏览器端渲染，导出 MP4 视频 |

### 三种生成模式

- **逐句匹配** — 每句歌词匹配一个视频画面，歌词与画面精准同步
- **按主题分段** — 将歌词按主题分组（主歌/副歌/桥段），每组匹配统一视觉风格
- **氛围循环** — 纯音乐或无歌词时，按音乐情绪自动分段，循环匹配氛围画面

### MV 时长选项

- **短版** (30-60s) — 自动检测副歌高光段落，截取精华部分
- **中版** (60-90s) — 主歌 + 副歌精选段落
- **全曲** — 完整歌曲时长

### 视频比例

- **竖屏 9:16** — 适合抖音/小红书/视频号等短视频平台
- **横屏 16:9** — 适合 B站/YouTube 等平台

### 素材来源

| 平台 | 特点 | 配额 |
|------|------|------|
| [Pixabay](https://pixabay.com/) | 免费无限制，素材丰富 | 无限制 |
| [Pexels](https://www.pexels.com/) | 高质量素材 | 200次/小时 |
| [Videvo](https://www.videvo.net/) | 专业级素材 | 免费层 |

采用适配器模式设计，可轻松扩展更多素材源。

### 字幕 & 转场

- **10 种字幕风格**：简洁白、霓虹蓝、渐变紫、卡拉OK、打字机、发光、阴影、描边、迷你、艺术
- **15 种转场风格**：淡入淡出、溶解、推入、滑动、缩放、旋转、闪光、模糊、棋盘、百叶窗、擦除、圆形展开、翻页、随机、无转场

### 编辑功能

- 可视化时间线，每个片段显示视频缩略图
- 一键替换素材（保留 Top N 候选）
- 分割片段、拖拽排序
- 音频波形可视化，精准定位
- 手动调整高光截取范围

### 技术亮点

- **纯浏览器端运行** — 用户文件不上传服务器，隐私安全
- **FFmpeg.wasm 渲染引擎** — 采用 concat protocol 拼接，自动降级策略
- **Web Audio API** — 音频波形可视化 + 浏览器端音频截取
- **适配器模式** — 搜索引擎可无限扩展
- **深色主题** — 蓝紫渐变，现代视觉风格

---

## 快速开始

### 前置条件

- Node.js 18+
- npm 9+

### 安装

```bash
# 克隆仓库
git clone https://github.com/Jiangchen7080/Music-MV.git
cd mv-studio

# 安装依赖
npm install

# 配置 API 密钥
cp .env.example .env
# 编辑 .env 填入你的 API 密钥
```

### 获取 API 密钥

| 平台 | 注册链接 | 说明 |
|------|---------|------|
| Pixabay | https://pixabay.com/api/docs/ | 注册后获取免费 API Key |
| Pexels | https://www.pexels.com/api/ | 注册后获取免费 API Key |
| Videvo | https://www.videvo.net/api/ | 注册后获取免费 API Key（可选） |

### 启动开发服务器

```bash
npm run dev
```

浏览器打开 `http://localhost:5173` 即可使用。

### 构建生产版本

```bash
npm run build
npm run preview
```

---

## 项目结构

```
mv-studio/
├── src/
│   ├── components/        # UI 组件
│   │   ├── ui/            # shadcn 基础组件
│   │   ├── upload/        # 上传相关
│   │   ├── config/        # 配置页面
│   │   ├── generate/      # 生成引擎
│   │   ├── timeline/      # 时间线编辑器
│   │   └── output/        # 输出下载
│   ├── services/          # API 服务 & 渲染引擎
│   ├── stores/            # Zustand 状态管理
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   └── workers/           # Web Workers
├── .github/workflows/     # CI/CD
└── public/                # 静态资源
```

---

## 开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 类型检查 + 构建 |
| `npm run preview` | 预览构建产物 |
| `npm test` | 运行测试 |
| `npm run test:watch` | 监听模式测试 |
| `npm run test:ui` | 浏览器 UI 测试 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run format` | Prettier 代码格式化 |

---

## 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 5 |
| 样式 | Tailwind CSS + shadcn/ui |
| 状态管理 | Zustand |
| 视频处理 | FFmpeg.wasm |
| 音频分析 | Web Audio API |
| 测试 | Vitest |
| 代码规范 | Prettier + EditorConfig |
| CI/CD | GitHub Actions |

---

## 部署

推荐部署到 [Vercel](https://vercel.com/) 或 [Netlify](https://www.netlify.com/)：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Jiangchen7080/Music-MV)

部署时需在平台设置环境变量：
- `VITE_PIXABAY_API_KEY`
- `VITE_PEXELS_API_KEY`
- `VITE_VIDEVO_API_KEY`

---

## 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解开发规范和提交流程。

---

## 开源协议

本项目基于 [MIT License](LICENSE) 开源。

---

## 致谢

- [Pixabay](https://pixabay.com/) — 免费视频素材
- [Pexels](https://www.pexels.com/) — 高质量视频素材
- [Videvo](https://www.videvo.net/) — 专业视频素材
- [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) — 浏览器端视频处理
- [shadcn/ui](https://ui.shadcn.com/) — UI 组件库