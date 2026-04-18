# LingoKey

> 一个面向 AI 编程场景的开发者英语桌面助手。

LingoKey 聚焦两个高频动作：

- 写之前：把中文或中英混合草稿整理成自然、准确、可直接发送给 AI 的英文 prompt
- 读之后：对 AI 输出中的陌生英文表达做轻量解释，尽量不打断当前工作流

它不是通用翻译软件，也不是通用语法纠错工具。它解决的是一个更具体的问题：降低开发者在使用 Codex、Claude Code、Cursor 等 AI 编程助手时的语言摩擦。

## 项目状态

当前版本为 `0.1.0`，仓库处于 MVP 阶段，核心能力已经可用，重点仍放在体验打磨与工作流收敛。

当前范围主要包括：

- Prompt 写前优化
- AI 输出读后解释
- 全局热键唤起
- 多窗口桌面交互
- 自定义 AI Provider、主题、窗口偏好

第一阶段暂不包含：

- 历史记录与云同步
- IDE 深度集成
- OCR / 截图翻译
- 长文全文翻译
- 复杂术语库与学习系统

## 为什么做这个项目

开发者在 AI 编程场景里经常会重复下面这条链路：

1. 先把脑中的中文技术意图整理成英文
2. 把英文 prompt 发给 AI 编程助手
3. 阅读英文输出
4. 遇到不熟悉的词、短语或句子时即时理解

现有工具通常把这两件事拆散了：

- 写前优化用一个工具
- 读后理解用另一个工具
- 频繁切换窗口、复制粘贴、重新聚焦

LingoKey 试图把这条路径压短成一句话：

`一个主热键负责写前优化，一个副热键负责读后解释。`

## 核心特性

- 全局热键唤起主窗口、解释窗口和设置窗口
- 多窗口桌面架构，围绕短时交互设计
- Prompt 优化结果支持 diff 高亮，便于理解改动
- 解释窗口在鼠标附近弹出，降低视线切换成本
- 支持 `conservative` / `enhanced` 两种输出模式
- 支持自定义 AI Provider 的 `Base URL`、`Model`、`API Key`
- 支持主题切换、窗口置顶、开机自启、窗口不透明度
- 提供系统托盘入口，关闭窗口后仍可驻留后台

## 使用场景

### 1. 写前优化

你已经知道自己想让 AI 做什么，但表达是中文，或者英文不够自然：

> 帮我检查这个 hook 为什么会重复请求，并且给出最小修复方案

按下主热键后，LingoKey 会把它整理成更自然的英文 prompt。

输出模式分为两类：

- `conservative`：尽量保留原意，主要修正语法、拼写和不自然表达
- `enhanced`：让表达更顺，但不主动补充超出原意的技术要求

### 2. 读后解释

你在 AI 回复里看到一个不熟悉的表达，选中文本后按下解释热键，LingoKey 会弹出一个轻量解释窗口，给出：

- 中文释义
- 技术语境下的解释
- 必要时的替代表达

## 工作流设计

LingoKey 采用三窗口结构：

| 窗口       | 作用              | 默认尺寸    |
| ---------- | ----------------- | ----------- |
| `main`     | Prompt 优化主窗口 | `520 × 420` |
| `explain`  | 轻量解释弹窗      | `360 × 280` |
| `settings` | 设置窗口          | `480 × 520` |

设计目标不是做成一个“大而全”的工作台，而是把高频动作做成低打断、短停留、可随时关闭的辅助层。

## 技术栈

- React 19
- TypeScript 5.8
- Tailwind CSS 3
- Vite 7
- Tauri 2
- Rust
- Vitest 4 + Testing Library

## 快速开始

### 环境要求

- Node.js `>= 18`
- Rust `>= 1.70`
- Windows / macOS / Linux

### 安装依赖

```bash
npm install
```

### 启动桌面开发模式

```bash
npm run tauri dev
```

该命令会先启动 Vite 开发服务器，再拉起 Tauri 桌面应用。

### 启动纯前端调试

```bash
npm run dev
```

适合做界面调试，但不包含完整的 Tauri 原生能力。

### 构建生产版本

```bash
npm run tauri build
```

构建产物主要位于：

- 可执行文件：`src-tauri/target/release/`
- 安装包与平台打包产物：`src-tauri/target/release/bundle/`
- 前端静态资源：`dist/`

## 默认配置

### 默认快捷键

| 操作         | 默认快捷键             |
| ------------ | ---------------------- |
| 打开主窗口   | `Ctrl/Cmd + Shift + L` |
| 打开解释窗口 | `Ctrl/Cmd + Shift + E` |
| 打开设置窗口 | `Ctrl/Cmd + Shift + S` |
| 关闭当前窗口 | `Esc`                  |

所有快捷键都可以在设置窗口中修改。

### 默认 AI Provider

- Base URL：`https://api.deepseek.com`
- Model：`deepseek-chat`
- API Key：默认留空，需要用户自行配置

### 可配置项

- 主热键 / 解释热键 / 设置页热键
- 输出模式
- 是否开机自启
- 是否始终置顶
- 主题模式
- 窗口不透明度
- AI Provider 相关配置

## 开发命令

```bash
npm run dev
npm run build
npm run preview
npm run tauri dev
npm run tauri build
npm test
npm run test:watch
```

开发细节：

- Vite 开发端口固定为 `1420`
- 项目使用多页面入口：`/`、`/explain`、`/settings`
- TypeScript 采用严格模式

## 测试

当前测试覆盖集中在核心工具逻辑和基础 UI 行为，包括：

- `src/lib/diff.ts`
- `src/lib/settings.ts`
- `src/lib/utils.ts`
- `src/components/ui/Button.tsx`
- `src/components/ui/DiffHighlight.tsx`

运行测试：

```bash
npm test
```

## 项目结构

```text
.
├── src/
│   ├── components/
│   │   ├── ui/                # 基础 UI 组件
│   │   └── windows/           # 窗口级布局
│   ├── hooks/                 # 业务 Hook
│   ├── lib/                   # 前端工具与 Tauri 封装
│   ├── types/                 # 类型定义
│   ├── windows/               # 三个窗口入口页面
│   ├── index.css
│   └── main.tsx
├── src-tauri/
│   ├── src/
│   │   ├── commands/          # Tauri 命令
│   │   ├── cursor.rs          # 鼠标位置获取
│   │   ├── input.rs           # 输入模拟相关逻辑
│   │   ├── lib.rs             # 应用入口与热键注册
│   │   └── main.rs
│   ├── capabilities/          # Tauri 2 capability 权限
│   ├── icons/
│   └── tauri.conf.json
├── docs/
├── index.html
├── explain.html
├── settings.html
└── README.md
```

## 架构说明

### 前端

- React 函数组件 + Hooks
- Tailwind CSS + CSS 变量组织主题
- 三个独立 HTML 入口分别承载主窗口、解释窗口和设置窗口
- 通过 `src/lib/tauri.ts` 统一封装前端对 Tauri Commands 的调用

### 桌面端

- 使用 Tauri Commands 提供窗口控制、剪贴板、设置持久化和 LLM API 调用
- 使用 `tauri-plugin-global-shortcut` 注册全局热键
- 使用 `tauri-plugin-store` 持久化本地设置
- 使用 `tauri-plugin-autostart` 支持开机自启
- 使用系统托盘管理后台驻留与快速唤起

### AI 调用

后端通过 OpenAI-compatible Chat Completions 接口发起请求，默认指向 DeepSeek：

- 优化能力：将中文或混合输入改写为更自然的英文 prompt
- 解释能力：返回结构化 JSON 结果，用于渲染轻量解释窗口

当 API Key 未配置或远端请求失败时，前端/后端会给出降级反馈，避免界面完全无响应。

## 平台与限制

- 项目支持 Windows、macOS、Linux 构建
- 当前“解释热键触发后读取选中文本”的链路对 Windows 支持更完整
- 窗口不透明度的原生实现当前主要依赖 Windows API

如果你计划优先贡献跨平台体验，这部分会是一个很直接的切入点。

## 隐私与安全

- 应用会在用户触发相关操作时读取或写入剪贴板文本
- AI Provider 的 API Key 会保存在本地 `settings.json`
- 当前存储方式为本地明文 JSON，不适合放置高敏感、共享环境下的密钥
- 所有模型请求只会发送到用户配置的 Provider Base URL

## 路线图

欢迎围绕下面几个方向继续扩展：

- 术语偏好记忆
- 修改原因解释
- 历史记录与快速复用
- 针对不同 AI 工具的输出预设
- 更完整的技术语境词库
- 更好的跨平台选中文本获取能力

## 贡献指南

欢迎提交 Issue 和 Pull Request。

建议优先遵循以下约定：

1. 较大的功能改动先开 Issue 讨论方向
2. 保持改动范围聚焦，避免把产品边界扩成通用翻译工具
3. 行为发生变化时，同步补充或更新测试
4. 涉及 Tauri 新能力时，记得同步更新 capability 配置

## 许可证

[MIT](LICENSE)
