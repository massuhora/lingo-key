# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

LingoKey is a Tauri 2 desktop app that reduces English friction for developers using AI coding tools. Two core actions via global hotkeys: (1) optimize Chinese/mixed input into natural English prompts, (2) explain unfamiliar English expressions from AI output. It is NOT a general translator or grammar checker.

## Commands

```bash
npm install              # Install frontend dependencies
npm run dev              # Frontend-only dev server (port 1420, no Tauri APIs)
npm run tauri dev        # Full desktop dev mode (Vite + Tauri)
npm run tauri build      # Production build
npm test                 # Run all Vitest tests (jsdom)
npm run test:watch       # Vitest watch mode
```

## Architecture

**Three independent browser windows** via Vite multi-page config (`vite.config.ts`):

| HTML entry | React mount | Tauri label | Size | Behavior |
|---|---|---|---|---|
| `index.html` | `src/main.tsx` | `main` | 520×420 | Auto-hides on blur |
| `explain.html` | `src/windows/explain.tsx` | `explain` | 360×280 | Auto-hides on blur |
| `settings.html` | `src/windows/settings.tsx` | `settings` | 480×520 | Stays open on blur |

All windows are borderless, transparent, always-on-top. Window management lives in `src-tauri/src/commands/window.rs` + `src/lib/tauri.ts`.

**Backend (Rust/Tauri 2):**
- `src-tauri/src/lib.rs` — app setup, hotkey registration, managed state (`AppState` with Mutex-wrapped settings and hotkey strings)
- `src-tauri/src/commands/api.rs` — OpenAI-compatible Chat Completions calls (DeepSeek by default, 30s timeout, `explain_text` uses `json_object` response format)
- `src-tauri/src/commands/settings.rs` — settings CRUD persisted via `tauri-plugin-store` to `settings.json`
- `src-tauri/src/commands/clipboard.rs` — clipboard read/write
- `src-tauri/src/commands/hotkey.rs` — hotkey re-registration at runtime
- `src-tauri/src/cursor.rs` — Windows-only `GetCursorPos` for positioning the explain popup near the mouse

**Frontend communication**: all Tauri `invoke()` calls and event listeners are wrapped in `src/lib/tauri.ts`. Frontend hooks (`src/hooks/`) call these wrappers, never `invoke()` directly.

**Fallback behavior**: when the API key is missing or the LLM call fails, hooks in `src/hooks/useOptimize.ts` and `src/hooks/useExplain.ts` fall back to mock functions and surface errors in the UI.

## Adding a Tauri command

1. Create/modify a file in `src-tauri/src/commands/`
2. Export it in `src-tauri/src/commands/mod.rs`
3. Register it in `src-tauri/src/lib.rs` via the `invoke_handler!` macro
4. Add the frontend wrapper in `src/lib/tauri.ts`
5. If the command uses a new capability (window, clipboard, store, etc.), update both:
   - `src-tauri/capabilities/default.json`
   - `src-tauri/tauri.conf.json` → `app.security.capabilities`

## Settings: dual-location gotcha

Default values for settings (hotkeys, theme, opacity) are defined in **two places** that must stay in sync:
- Frontend: `src/lib/settings.ts` (`DEFAULT_SETTINGS`)
- Backend: `src-tauri/src/commands/settings.rs` (`default_*_hotkey()`, `default_theme()`, `default_opacity()`)

When changing a default, update both files.

## Conventions

- **TypeScript strict mode** — `noUnusedLocals` and `noUnusedParameters` are on; clean up unused code
- **TailwindCSS only** — no inline CSS; use design tokens from `tailwind.config.js` (e.g. `bg-background`, `text-foreground`, `border-border`)
- **Icons**: `lucide-react` only, no emoji as icons
- **Class name merging**: use the project's `cn()` from `src/lib/utils.ts`
- **Components**: PascalCase files, function components + hooks only
- **Tests**: co-locate `.test.ts(x)` files alongside source; Vitest globals enabled (`describe`/`it`/`expect` available without imports)
- **Dark/light themes**: `class`-based toggle on `<html>`; CSS variables defined in `src/index.css`
- **Animations**: 150–300ms, prefer `transform`/`opacity`
- **Rust naming**: `snake_case` in commands, `camelCase` in frontend wrappers
