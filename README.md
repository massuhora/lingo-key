<p align="center">
  <img src="./logo.jpg" alt="LingoKey Logo" width="240" />
</p>

# LingoKey

> A desktop assistant built to compress the English workflow around AI coding.

LingoKey focuses on two high-frequency actions:

- Before writing: turn Chinese or mixed Chinese-English drafts into natural, accurate English prompts that can be sent directly to AI
- After reading: provide lightweight explanations for unfamiliar English expressions in AI output without disrupting the current workflow too much

It is not a general translation app, and it is not a general grammar correction tool.

More precisely, LingoKey tries to solve a workflow that is often fragmented:

`Chinese technical intent -> English prompt -> Understanding AI output`

Many developers already have their own toolchain, for example:

- Using Pot / Bob for translation, word lookup, and OCR
- Using LanguageTool or similar tools for grammar and phrasing improvements
- Using Raycast, clipboard history, or shortcuts to stitch actions together

The problem is not a lack of tools. The problem is that this chain usually gets split across multiple apps and multiple actions. LingoKey does not aim to replace every tool. Its goal is to compress the most common English friction between developers and AI coding assistants such as Codex, Claude Code, and Cursor into a shorter, lighter system-level entry point.

## Project Status

The current version is `0.2.1`. The repository is still in the MVP stage. The core capabilities are already usable, but the main focus is still on polishing the experience, tightening the workflow, and validating product boundaries.

The current scope mainly includes:

- Prompt optimization before sending
- Lightweight explanation after reading AI output
- Global hotkey invocation
- Multi-window desktop interaction
- Custom AI provider, theme, and window preferences

The first phase does not include:

- History and cloud sync
- Deep IDE integration
- OCR / screenshot translation
- Full-document translation
- Complex terminology databases and learning systems

## Why This Project Exists

This project started from a very concrete real-world workflow:

- Pot for translation and word lookup
- LanguageTool for English grammar and phrasing improvement

That combination works, but they are fundamentally two separate pieces of software and do not connect naturally.

In AI coding scenarios, developers repeatedly go through the same chain:

1. Turn a technical idea in Chinese into English
2. Send the English prompt to an AI coding assistant
3. Read the English output
4. Instantly understand unfamiliar words, phrases, or sentences when they appear

Existing tools usually split these actions apart:

- One tool for pre-write optimization, or manual rewriting back and forth
- Another tool for post-read understanding
- Frequent window switching, copying, pasting, and refocusing
- Tools that understand translation or grammar, but not necessarily the usage context of AI coding prompts

LingoKey does not want to be "yet another translator" or "yet another grammar checker." It wants to compress this path into one sentence:

`One primary hotkey for prompt optimization, one secondary hotkey for explanation after reading.`

For the user, it should feel more like a workflow layer than a large all-in-one language workstation.

## How It Differs From Existing Tools

LingoKey does not operate at exactly the same layer as tools like Pot, Bob, LanguageTool, or Raycast.

- Pot / Bob are strong at translation, OCR, word lookup, and multi-service integration
- LanguageTool is strong at general English grammar, spelling, and phrasing correction
- Raycast is strong at packaging many capabilities into reusable shortcut-based entry points

LingoKey focuses on a narrower but more specific problem:

- Built for AI coding scenarios rather than all language scenarios
- Emphasizes prompt polish without changing technical intent, rather than generic rewriting
- Emphasizes lightweight post-read explanation rather than a full translation panel
- Emphasizes dual hotkeys, short dwell time, and a system-level entry point rather than dependence on a specific IDE or launcher

If summarized in one sentence:

`Pot solves translation problems, LanguageTool solves language quality problems, and LingoKey solves the English workflow problem between developers and AI coding assistants.`

## Core Features

- Global hotkeys to open the main window, explain window, and settings window
- Multi-window desktop architecture designed around short interactions
- Diff highlighting for prompt optimization results so changes are easy to understand
- Explain window appears near the mouse cursor to reduce visual switching cost
- Supports both `conservative` and `enhanced` output modes
- Supports custom `Base URL`, `Model`, and `API Key` for any AI provider
- Supports theme switching, always-on-top, auto-start, and window opacity
- Provides a system tray entry so the app can stay resident in the background after windows are closed

## Usage Scenarios

### 1. Prompt Optimization Before Writing

You already know what you want the AI to do, but the phrasing is in Chinese, or the English is not natural enough:

> Help me check why this hook keeps making duplicate requests and give me the smallest possible fix

After pressing the main hotkey, LingoKey rewrites it into a more natural English prompt while trying to preserve the original technical intent instead of turning a normal request into overdone prompt engineering.

The output modes are:

- `conservative`: preserve the original meaning as much as possible, mainly fixing grammar, spelling, and unnatural phrasing
- `enhanced`: make the wording smoother, but do not add technical requirements beyond the original intent

### 2. Explanation After Reading

You see an unfamiliar expression in an AI response. Select the text and press the explain hotkey. LingoKey will show a lightweight explanation window with:

- A Chinese meaning
- An explanation in technical context
- Alternative phrasing when needed

## Workflow Design

LingoKey uses a three-window structure:

| Window     | Purpose                         | Default Size |
| ---------- | ------------------------------- | ------------ |
| `main`     | Main prompt optimization window | `520 x 420`  |
| `explain`  | Lightweight explanation popup   | `360 x 280`  |
| `settings` | Settings window                 | `480 x 520`  |

The goal is not to become a large all-in-one workspace. The goal is to turn high-frequency actions into a low-interruption, short-dwell support layer that can be closed at any time.

It is closer to an "English friction layer" floating at the system level:

- It appears when needed
- Solves the current step
- Gets out of the way immediately

## Tech Stack

- React 19
- TypeScript 5.8
- Tailwind CSS 3
- Vite 7
- Tauri 2
- Rust
- Vitest 4 + Testing Library

## Quick Start

### Requirements

- Node.js `>= 18`
- Rust `>= 1.70`
- Windows / macOS / Linux

### Install Dependencies

```bash
npm install
```

### Start Desktop Development Mode

```bash
npm run tauri dev
```

This command starts the Vite dev server first and then launches the Tauri desktop app.

### Start Frontend-Only Development

```bash
npm run dev
```

This is useful for UI debugging, but it does not include the full native Tauri capabilities.

### Build the Production Version

```bash
npm run tauri build
```

Build outputs are mainly located in:

- Executables: `src-tauri/target/release/`
- Installers and platform bundles: `src-tauri/target/release/bundle/`
- Frontend static assets: `dist/`

## Default Configuration

### Default Hotkeys

| Action              | Default Hotkey          |
| ------------------- | ----------------------- |
| Open main window    | `Ctrl/Cmd + Shift + L`  |
| Open explain window | `Ctrl/Cmd + Shift + E`  |
| Open settings       | `Ctrl/Cmd + Shift + S`  |
| Close current window| `Esc`                   |

All hotkeys can be changed in the settings window.

### Default AI Provider

- Base URL: `https://api.deepseek.com`
- Model: `deepseek-chat`
- API Key: empty by default and must be configured by the user

### Configurable Options

- Main / explain / settings hotkeys
- Output mode
- Auto-start
- Always on top
- Theme
- Window opacity
- AI provider settings

## Development Commands

```bash
npm run dev
npm run build
npm run preview
npm run tauri dev
npm run tauri build
npm test
npm run test:watch
```

Development details:

- Vite dev server runs on fixed port `1420`
- The project uses multi-page entries: `/`, `/explain`, `/settings`
- TypeScript runs in strict mode

## Testing

Current test coverage is focused on core utility logic and basic UI behavior, including:

- `src/lib/diff.ts`
- `src/lib/settings.ts`
- `src/lib/utils.ts`
- `src/components/ui/Button.tsx`
- `src/components/ui/DiffHighlight.tsx`

Run tests with:

```bash
npm test
```

## Project Structure

```text
.
├── src/
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   └── windows/           # Window-level layouts
│   ├── hooks/                 # Business hooks
│   ├── lib/                   # Frontend utilities and Tauri wrappers
│   ├── types/                 # Type definitions
│   ├── windows/               # Three window entry pages
│   ├── index.css
│   └── main.tsx
├── src-tauri/
│   ├── src/
│   │   ├── commands/          # Tauri commands
│   │   ├── cursor.rs          # Mouse position retrieval
│   │   ├── input.rs           # Input simulation logic
│   │   ├── lib.rs             # App entry and hotkey registration
│   │   └── main.rs
│   ├── capabilities/          # Tauri 2 capability permissions
│   ├── icons/
│   └── tauri.conf.json
├── docs/
├── index.html
├── explain.html
├── settings.html
└── README.md
```

## Architecture Notes

### Frontend

- React function components + Hooks
- Tailwind CSS + CSS variables for theme organization
- Three independent HTML entries for the main, explain, and settings windows
- `src/lib/tauri.ts` provides a unified frontend wrapper over Tauri commands

### Desktop Layer

- Tauri commands provide window control, clipboard access, settings persistence, and LLM API calls
- `tauri-plugin-global-shortcut` registers global hotkeys
- `tauri-plugin-store` persists local settings
- `tauri-plugin-autostart` enables launch at startup
- System tray support keeps the app resident and easy to summon

### AI Calls

The backend sends requests through an OpenAI-compatible Chat Completions API, pointing to DeepSeek by default:

- Optimization: rewrite Chinese or mixed-language input into a more natural English prompt
- Explanation: return structured JSON for rendering the lightweight explanation window

When the API key is missing or the remote request fails, the frontend/backend provides degraded fallback behavior so the UI does not become completely unresponsive.

## Platforms and Limitations

- The project supports builds for Windows, macOS, and Linux
- The current "read selected text after pressing the explain hotkey" flow is more complete on Windows
- Native window opacity support currently depends mainly on Windows APIs

If you want to contribute to cross-platform polish first, this is a very direct place to start.

## Privacy and Security

- The app reads or writes clipboard text only when triggered by the user
- The AI provider API key is stored in local `settings.json`
- The current storage format is plain local JSON, which is not suitable for highly sensitive keys in shared environments
- All model requests are sent only to the provider base URL configured by the user

## Roadmap

Contributions around the following directions are especially welcome:

- Terminology preference memory
- Explanations of why wording changed
- History and quick reuse
- Output presets for different AI tools
- A richer technical-context terminology base
- Better cross-platform selected-text retrieval

## Contributing

Issues and pull requests are welcome.

Recommended conventions:

1. Open an issue first for larger feature changes
2. Keep the scope focused and avoid expanding the product into a general-purpose translation tool
3. Update or add tests when behavior changes
4. When adding new Tauri capabilities, remember to update the capability configuration as well

## License

[MIT](LICENSE)
