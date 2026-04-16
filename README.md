# LingoKey

LingoKey 是一个面向 AI 编程场景的开发者英语桌面助手。

它聚焦两个高频动作：

- 写之前：将中文或中英混合草稿整理成自然、准确的英文 prompt
- 读之后：对 AI 输出中的陌生英文表达进行轻量解释

LingoKey 不是通用翻译软件，也不是通用语法纠错工具。它的目标很明确：降低开发者在使用 Codex、Claude Code、Cursor 等 AI 编程助手时的语言摩擦。

## 功能特性

- 全局热键唤起主窗口、解释窗口和设置窗口
- 面向低打断工作流的无边框悬浮窗
- Prompt 优化结果支持 diff 高亮展示
- 解释窗口跟随鼠标附近弹出
- 支持自定义 AI Provider 配置
- 支持自定义热键、输出模式、开机自启和窗口置顶

## 使用场景

### 写前优化

通过主热键打开主窗口后，可以将以下内容整理成可直接发送给 AI 的英文 prompt：

- 中文技术意图
- 中英混合草稿
- 语法不稳、表达不自然的英文描述

当前支持两种输出模式：

- `conservative`：尽量保留原意，重点修正语法、拼写和用词
- `enhanced`：使表达更自然，但不主动补充超出原意的技术要求

### 读后解释

在任意应用中选中英文文本后，触发解释热键，会弹出一个轻量解释窗口，提供：

- 中文释义
- 技术语境下的解释
- 必要时的替代表达

## 窗口与工作流

LingoKey 采用多窗口桌面架构：

- `main`：主浮窗，用于 prompt 优化
- `explain`：解释小窗，用于轻量理解
- `settings`：设置窗口，用于应用配置

所有窗口均为无边框、透明背景。主窗口和解释窗口用于短时交互，失焦后自动隐藏；设置窗口用于持续操作，不会因失焦立即关闭。

## 技术栈

- React 19
- TypeScript 5.8
- Tailwind CSS 3
- Vite 7
- Tauri 2
- Rust
- Vitest 4 + Testing Library

## 项目状态

当前仓库聚焦于 MVP 版本。

当前范围包括：

- prompt 优化
- 轻量解释弹窗
- 热键与 Provider 配置

第一版暂不包含：

- 历史记录管理
- 云同步
- IDE 深度集成
- OCR 或截图翻译
- 长文全文翻译

## 环境要求

- Node.js 18 及以上
- Rust 1.70 及以上
- Windows、macOS 或 Linux

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发模式

```bash
npm run tauri dev
```

该命令会启动 Vite 开发服务器，并同时拉起 Tauri 桌面应用壳。

### 构建生产版本

```bash
npm run tauri build
```

构建产物位于：

- 桌面二进制：`src-tauri/target/release/`
- 安装包与打包产物：`src-tauri/target/release/bundle/`
- 前端静态资源：`dist/`

## 配置说明

LingoKey 提供设置窗口，可配置以下内容：

- 主热键
- 解释热键
- 设置页热键
- 输出模式
- 窗口是否始终置顶
- 是否开机自启
- AI Provider Base URL
- AI Provider Model
- AI Provider API Key

默认 AI Provider 配置为：

- Base URL：`https://api.deepseek.com`
- Model：`deepseek-chat`

## 默认快捷键

| 操作 | 默认快捷键 |
| --- | --- |
| 打开主窗口 | `Ctrl/Cmd + Shift + L` |
| 打开解释窗口 | `Ctrl/Cmd + Shift + E` |
| 打开设置窗口 | `Ctrl/Cmd + Shift + S` |
| 关闭当前窗口 | `Esc` |

所有快捷键均可在设置窗口中修改。

## 开发

### 可用命令

```bash
npm run dev
npm run build
npm run tauri dev
npm run tauri build
npm test
npm run test:watch
```

### 开发说明

- Vite 开发服务器固定使用 `1420` 端口
- 项目为多页面 Tauri 应用，包含独立的 `main`、`explain`、`settings` 入口
- 前端代码启用了严格的 TypeScript 配置

## 测试

当前项目已包含部分核心逻辑和基础 UI 行为测试。

当前覆盖内容包括：

- `src/lib/diff.ts` 的差异高亮逻辑
- `src/lib/settings.ts` 的设置验证与转换逻辑
- `src/lib/utils.ts` 的基础工具函数
- `src/components/ui/Button.tsx` 的基础 UI 行为

运行测试：

```bash
npm test
```

## 架构概览

### 前端

- 使用 React 函数组件与 Hooks
- 使用 Tailwind CSS 设计令牌组织暗色 OLED 风格主题
- 为 `main`、`explain`、`settings` 提供独立窗口入口

### 后端

- 通过 Tauri Commands 提供窗口管理、剪贴板访问、设置持久化和 API 请求能力
- 使用 `tauri-plugin-global-shortcut` 实现全局热键
- 使用 `tauri-plugin-store` 持久化应用设置
- 使用 `tauri-plugin-clipboard-manager` 读写剪贴板
- 使用 `tauri-plugin-autostart` 支持开机自启

### 窗口模型

| 窗口 | 用途 | 尺寸 |
| --- | --- | --- |
| `main` | prompt 优化主窗口 | `520 x 420` |
| `explain` | 快速解释弹窗 | `360 x 280` |
| `settings` | 应用设置窗口 | `480 x 520` |

## 项目结构

```text
.
├── src/
│   ├── components/
│   │   ├── ui/
│   │   └── windows/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── windows/
│   ├── main.tsx
│   └── index.css
├── src-tauri/
│   ├── src/
│   │   ├── commands/
│   │   ├── lib.rs
│   │   └── main.rs
│   ├── capabilities/
│   └── tauri.conf.json
├── docs/
├── index.html
├── explain.html
└── settings.html
```

## 隐私与安全说明

- 应用会在用户触发相关流程时读取或写入剪贴板文本
- AI Provider 的 API Key 存储在本地 `settings.json` 中
- 当前实现通过 Tauri Store 以明文形式保存该 Key
- 所有请求仅会发送到用户配置的 Provider Base URL

## 路线图

MVP 之后可考虑的方向包括：

- 术语偏好记忆
- 修改原因解释
- 历史记录与快速复用
- 针对不同 AI 工具的输出预设
- 更丰富的技术语境解释能力

## 贡献

欢迎提交 Issue 和 Pull Request。

如果你准备参与贡献，建议先遵循以下方式：

1. 对较大的改动先开 Issue 讨论方向
2. 保持改动范围清晰，并与产品目标保持一致
3. 当行为发生变化时，补充或更新测试

## 许可证

MIT
