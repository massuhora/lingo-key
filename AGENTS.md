# LingoKey — Agent 开发指南

> 本文档面向 AI 编程助手。如果你刚接触这个项目，请先阅读本文件再修改代码。

---

## 项目概述

**LingoKey** 是一个面向 AI 编程场景的桌面轻助手，核心定位是：
- **写之前**：通过全局热键弹出悬浮窗，把中文或中英混合输入整理成自然、准确的英文 prompt。
- **读之后**：在任意应用中选中陌生英文表达，通过副热键弹出小窗给出轻量解释（中文释义、技术语境、替代表达）。

它不是通用翻译软件，也不是通用语法纠错工具，而是专门减少开发者与 Codex、Claude Code、Cursor 等 AI 编程助手协作时的英语摩擦。

### 技术栈

| 层级     | 技术                                      |
| -------- | ----------------------------------------- |
| 前端框架 | React 19 + TypeScript 5.8                 |
| 样式方案 | TailwindCSS 3（Dark OLED + Light 双主题） |
| 构建工具 | Vite 7                                    |
| 桌面框架 | Tauri 2（Rust）                           |
| 测试框架 | Vitest 4 + jsdom + @testing-library/react |

### 多窗口架构

应用包含 3 个独立的 HTML 入口（Vite 多页配置）：

- `index.html` → `src/main.tsx` → 主浮窗（`main` 窗口，520×420）
- `explain.html` → `src/windows/explain.tsx` → 解释小窗（`explain` 窗口，360×280）
- `settings.html` → `src/windows/settings.tsx` → 设置页（`settings` 窗口，480×520）

所有窗口均为无边框（`decorations: false`）、透明背景（`transparent: true`）、默认置顶（`alwaysOnTop: true`）。主窗口和解释窗口在失焦时自动隐藏；设置窗口不失焦隐藏，方便用户操作。

---

## 目录结构

```
lingokey/
├── index.html                # 主窗口入口
├── explain.html              # 解释窗口入口
├── settings.html             # 设置窗口入口
├── package.json              # Node 依赖与脚本
├── vite.config.ts            # Vite 配置（多页输入、Tauri 开发端口 1420）
├── vitest.config.ts          # 测试配置（jsdom、@ alias）
├── tailwind.config.js        # Tailwind + 设计令牌
├── postcss.config.js         # PostCSS（tailwindcss + autoprefixer）
├── tsconfig.json             # TypeScript（strict、ES2020、react-jsx）
├── design-system.md          # 设计系统文档
├── docs/PRD.md               # 产品需求文档
├── src/
│   ├── components/
│   │   ├── ui/               # 基础 UI 组件（Button、Input、Card、HotkeyInput、Slider 等）
│   │   └── windows/          # 窗口级布局组件（MainLayout、ExplainLayout、SettingsLayout）
│   ├── hooks/                # React Hooks（useOptimize、useExplain、useSettings、useWindow、useClipboard、useAppearance）
│   ├── lib/                  # 工具函数与 Tauri API 封装
│   │   ├── tauri.ts          # Tauri 命令封装（optimizeText、explainText、窗口操作等）
│   │   ├── diff.ts           # 词级 diff 算法（用于高亮修改）
│   │   ├── settings.ts       # 设置验证、转换、归一化
│   │   └── utils.ts          # 轻量工具（cn 类名合并）
│   ├── types/
│   │   └── index.ts          # TypeScript 类型定义
│   ├── windows/              # 窗口页面组件（explain.tsx、main.tsx、settings.tsx）
│   ├── test/
│   │   └── setup.ts          # Vitest 全局初始化（import '@testing-library/jest-dom'）
│   ├── main.tsx              # 主窗口 React 根入口
│   └── index.css             # 全局样式（Inter 字体、滚动条、focus-visible）
└── src-tauri/
    ├── Cargo.toml            # Rust 包配置
    ├── tauri.conf.json       # Tauri 应用配置（窗口定义、权限、构建命令）
    ├── capabilities/
    │   └── default.json      # 权限能力清单
    ├── icons/                # 应用图标资源
    └── src/
        ├── main.rs             # 程序入口（调用 lingokey_lib::run）
        ├── lib.rs              # 应用主逻辑、热键注册、状态管理
        ├── cursor.rs           # 获取鼠标光标位置（Windows 原生 API）
        └── commands/
            ├── mod.rs          # 命令模块聚合
            ├── api.rs          # LLM API 调用（optimize_text / explain_text）
            ├── clipboard.rs    # 剪贴板读写命令
            ├── hotkey.rs       # 热键更新命令
            ├── settings.rs     # 设置读写与持久化
            └── window.rs       # 窗口显示/隐藏/拖拽命令
```

---

## 构建与开发命令

### 环境要求

- Node.js >= 18
- Rust >= 1.70
- Windows / macOS / Linux

### 安装依赖

```bash
npm install
```

### 开发模式（带 Tauri 桌面壳）

```bash
npm run tauri dev
```

> Vite 开发服务器固定端口 `1420`（`strictPort: true`）。Tauri `beforeDevCommand` 会自动执行 `npm run dev`。

### 纯前端开发（浏览器预览，无 Tauri API）

```bash
npm run dev
```

### 构建生产包

```bash
npm run tauri build
```

构建产物：
- 可执行文件：`src-tauri/target/release/lingokey.exe`
- 安装包：`src-tauri/target/release/bundle/`
- 前端静态资源：`dist/`（Vite 输出）

---

## 测试指令

```bash
# 运行所有单元测试（单次）
npm test

# 监听模式
npm run test:watch
```

### 已覆盖的测试文件

- `src/lib/diff.test.ts` — 文本差异算法
- `src/lib/settings.test.ts` — 设置验证与转换
- `src/lib/utils.test.ts` — `cn` 工具函数
- `src/components/ui/Button.test.tsx` — UI 组件基础行为

### 测试配置要点

- 环境：`jsdom`
- `globals: true`（可直接使用 `describe`、`it`、`expect` 而无需导入）
- 初始化文件：`src/test/setup.ts`
- Path alias：`@/` 映射到 `./src`

---

## 代码风格与约定

### TypeScript

- `strict: true` 已启用，不要关闭。
- `noUnusedLocals: true`、`noUnusedParameters: true`：未使用的变量/参数会报错，请清理或以下划线命名。
- 使用 `type` 还是 `interface`：项目两种都有，跟随所在文件现有风格即可。
- 前端代码使用 ES Module（`"type": "module"`）。

### React

- 全部为函数组件 + Hooks。
- 副作用清理：监听事件、定时器等需要在 `useEffect` return 中清理。
- 挂载标志：网络请求较多的 Hook 使用 `isMounted` ref 防止状态更新到已卸载组件。

### 样式

- **必须使用 TailwindCSS**，不要在组件里写大量内联 CSS。
- 主题色通过 `tailwind.config.js` 自定义令牌使用，例如 `bg-background`、`text-foreground`、`border-border`。
- 设计系统支持 **Dark OLED** 和 **Light Mode**，通过 `theme` 设置切换，CSS 变量定义在 `src/index.css`。
- 动画时长 150–300ms，优先使用 `transform` / `opacity`。
- 图标统一使用 `lucide-react`，**不要用 emoji 代替图标**。
- 类名合并使用项目内建的 `cn(...)`（`src/lib/utils.ts`）。

### 命名与文件组织

- 组件文件：PascalCase（如 `Button.tsx`）
- 工具/hook 文件：camelCase（如 `useOptimize.ts`）
- 测试文件：与被测文件同名 + `.test.ts(x)` 后缀，放在同一目录。
- Tauri 命令文件：Rust 侧使用 `snake_case`，前端封装使用 `camelCase`。

---

## Tauri 后端开发须知

### 权限模型

Tauri 2 使用 Capability 权限系统。新增命令后，如果涉及窗口、剪贴板、存储等能力，需要同步更新：

- `src-tauri/capabilities/default.json`
- `src-tauri/tauri.conf.json` 中 `app.security.capabilities` 数组

当前已声明的关键权限包括：
- 窗口操作：`allow-show`、`allow-hide`、`allow-set-focus`、`allow-set-position`、`allow-start-dragging`、`allow-set-always-on-top`
- 全局热键：`allow-register`、`allow-unregister`
- 剪贴板：`allow-read-text`、`allow-write-text`
- 存储：`allow-get`、`allow-set`、`allow-save`、`allow-load`
- 开机自启：`allow-enable`、`allow-disable`、`allow-is-enabled`

### 添加新命令的流程

1. 在 `src-tauri/src/commands/` 下新建或修改 `.rs` 文件。
2. 在 `src-tauri/src/commands/mod.rs` 中 `pub mod` 导出。
3. 在 `src-tauri/src/lib.rs` 的 `invoke_handler!` 宏中注册命令。
4. 在 `src/lib/tauri.ts` 中封装前端调用函数。
5. 如需要新权限，更新 `capabilities/default.json` 和 `tauri.conf.json`。

### 状态管理

Rust 侧使用 Tauri 的 `Managed State`：

```rust
pub struct AppState {
    pub settings: Mutex<AppSettings>,
    pub registered_main_hotkey: Mutex<Option<String>>,
    pub registered_explain_hotkey: Mutex<Option<String>>,
    pub registered_settings_hotkey: Mutex<Option<String>>,
}
```

设置保存在 `settings.json`（通过 `tauri-plugin-store`），启动时加载并回写默认值。

### API 调用

`src-tauri/src/commands/api.rs` 封装了对 OpenAI-compatible Chat Completion API 的请求：
- 默认服务商：`https://api.deepseek.com`，模型 `deepseek-chat`
- 请求超时：30 秒
- `explain_text` 使用 `json_object` 响应格式并要求返回指定 JSON 字段
- 若 API 失败，前端 Hook 会回退到 `mockOptimize` / `mockExplain` 并显示错误提示

---

## 安全与隐私注意事项

- **API Key 存储**：用户的 API Key 通过 `tauri-plugin-store` 以明文 JSON 形式保存在本地 `settings.json` 中。不要将其发送到除用户配置 base URL 以外的任何地址。
- **CSP**：当前 `tauri.conf.json` 中 `csp` 设为 `null`。如果后续引入外部脚本或 iframe，需要重新配置 CSP。
- **剪贴板读取**：解释窗口触发时会自动读取系统剪贴板。确保只在用户明确按下热键时执行，避免后台静默读取。
- **Windows 原生 API**：`cursor.rs` 使用 `winapi::um::winuser::GetCursorPos`，仅在 Windows 编译时生效；其他平台有安全 fallback。

---

## 常见改动指引

### 修改默认热键

同时修改两处：
- 前端：`src/lib/settings.ts` 中的 `DEFAULT_SETTINGS`
- 后端：`src-tauri/src/commands/settings.rs` 中的 `default_*_hotkey()` 函数

### 修改默认主题或不透明度

同时修改两处：
- 前端：`src/lib/settings.ts` 中的 `DEFAULT_SETTINGS`（`theme`、`opacity`）
- 后端：`src-tauri/src/commands/settings.rs` 中的 `default_theme()` 和 `default_opacity()`

### 新增 UI 组件

1. 在 `src/components/ui/` 创建组件。
2. 在 `src/components/ui/index.ts` 导出。
3. 如需测试，创建同名 `.test.tsx`。

### 调整窗口尺寸或行为

修改 `src-tauri/tauri.conf.json` 中 `app.windows` 数组对应条目，然后重启 `tauri dev` 生效。

### 修改 diff 高亮逻辑

核心算法在 `src/lib/diff.ts`，测试在 `src/lib/diff.test.ts`。diff 结果类型为 `DiffChunk`（`equal` | `insert` | `delete`）。

---

## 参考文档

- `README.md` — 项目简介、快速开始、默认快捷键表
- `docs/PRD.md` — 产品需求与 MVP 范围
- `design-system.md` — 颜色、字体、动效规范
