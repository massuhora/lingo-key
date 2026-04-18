import type {
  Settings,
  AppSettings,
  OutputMode,
  Theme,
  AppLanguage,
  Locale,
} from '../types';

export const LANGUAGE_VALUES: AppLanguage[] = [
  'chinese',
  'english',
  'japanese',
  'korean',
  'spanish',
  'french',
  'german',
];

export const LOCALE_VALUES: Locale[] = ['zh-CN', 'en-US'];

export const DEFAULT_AI_PROVIDER = {
  baseUrl: 'https://api.deepseek.com',
  apiKey: '',
  model: 'deepseek-chat',
};

export const DEFAULT_SETTINGS: Settings = {
  mainHotkey: 'CommandOrControl+Shift+L',
  explainHotkey: 'CommandOrControl+Shift+E',
  settingsHotkey: 'CommandOrControl+Shift+S',
  locale: 'zh-CN',
  sourceLanguage: 'chinese',
  targetLanguage: 'english',
  outputMode: 'enhanced',
  autoStart: false,
  alwaysOnTop: true,
  theme: 'dark',
  opacity: 1.0,
  aiProvider: DEFAULT_AI_PROVIDER,
};

// Normalize common hotkey aliases so the UI and Rust agree on the format.
function normalizeHotkeyPart(part: string): string {
  const lower = part.trim().toLowerCase();
  if (lower === 'commandorcontrol' || lower === 'cmdorctrl') {
    return 'CommandOrControl';
  }
  if (lower === 'cmd' || lower === 'command') {
    return 'Command';
  }
  if (lower === 'ctrl' || lower === 'control') {
    return 'Ctrl';
  }
  if (lower === 'alt' || lower === 'option') {
    return 'Alt';
  }
  if (lower === 'shift') {
    return 'Shift';
  }
  if (lower === 'super') {
    return 'Super';
  }
  // Named keys and single chars: capitalize first letter for consistency.
  if (part.length > 1) {
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
  }
  return part.toUpperCase();
}

export function normalizeHotkey(hotkey: string): string {
  return hotkey
    .split('+')
    .map((p) => p.trim())
    .filter(Boolean)
    .map(normalizeHotkeyPart)
    .join('+');
}

/**
 * Validates a hotkey string using a rough heuristic.
 * Accepts combinations like "Ctrl+Shift+A", "CommandOrControl+Alt+T", etc.
 */
export function isValidHotkey(hotkey: string): boolean {
  if (!hotkey || typeof hotkey !== 'string') return false;
  const parts = hotkey.split('+').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return false;

  const modifiers = new Set([
    'Command',
    'Control',
    'Cmd',
    'Ctrl',
    'Alt',
    'Option',
    'Shift',
    'Super',
    'CommandOrControl',
    'CmdOrCtrl',
  ]);

  const hasModifier = parts.some((p) =>
    modifiers.has(p),
  );
  if (!hasModifier) return false;

  const key = parts[parts.length - 1];
  if (!key) return false;

  const namedKeys = new Set([
    'Escape', 'Esc', 'Tab', 'Space', 'Enter', 'Return', 'Backspace',
    'Delete', 'Insert', 'Home', 'End', 'PageUp', 'PageDown',
    'Up', 'Down', 'Left', 'Right', 'CapsLock', 'NumLock',
    'ScrollLock', 'PrintScreen', 'Pause',
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  ]);

  const isNamedKey = namedKeys.has(key);
  const isSingleChar = /^[A-Z0-9`\-=[\]\\;',./]$/.test(key);

  return isNamedKey || isSingleChar;
}

export function normalizeOutputMode(mode: string): OutputMode {
  return mode === 'conservative' ? 'conservative' : 'enhanced';
}

export function normalizeLocale(locale: string | undefined): Locale {
  return LOCALE_VALUES.includes(locale as Locale) ? (locale as Locale) : 'zh-CN';
}

export function normalizeLanguage(
  language: string | undefined,
  fallback: AppLanguage,
): AppLanguage {
  return LANGUAGE_VALUES.includes(language as AppLanguage) ? (language as AppLanguage) : fallback;
}

export function normalizeTheme(theme: string): Theme {
  return theme === 'light' ? 'light' : 'dark';
}

export function normalizeOpacity(opacity: number): number {
  if (typeof opacity !== 'number' || Number.isNaN(opacity)) return 1.0;
  return Math.max(0.3, Math.min(1.0, opacity));
}

export function mergeSettings(partial: Partial<Settings>): Settings {
  return {
    ...DEFAULT_SETTINGS,
    ...partial,
    locale: normalizeLocale(partial.locale),
    sourceLanguage: normalizeLanguage(
      partial.sourceLanguage,
      DEFAULT_SETTINGS.sourceLanguage,
    ),
    targetLanguage: normalizeLanguage(
      partial.targetLanguage,
      DEFAULT_SETTINGS.targetLanguage,
    ),
    outputMode: normalizeOutputMode(partial.outputMode ?? DEFAULT_SETTINGS.outputMode),
    theme: normalizeTheme(partial.theme ?? DEFAULT_SETTINGS.theme),
    opacity: normalizeOpacity(partial.opacity ?? DEFAULT_SETTINGS.opacity),
    aiProvider: {
      ...DEFAULT_SETTINGS.aiProvider,
      ...(partial.aiProvider ?? {}),
    },
  };
}

export function toAppSettings(settings: Settings): AppSettings {
  return {
    hotkeys: {
      main: settings.mainHotkey,
      explain: settings.explainHotkey,
      settings: settings.settingsHotkey ?? DEFAULT_SETTINGS.settingsHotkey!,
    },
    locale: settings.locale,
    sourceLanguage: settings.sourceLanguage,
    targetLanguage: settings.targetLanguage,
    outputMode: settings.outputMode,
    autoStart: settings.autoStart,
    alwaysOnTop: settings.alwaysOnTop,
    theme: settings.theme,
    opacity: settings.opacity,
    aiProvider: settings.aiProvider,
  };
}

export function toSettings(app: AppSettings): Settings {
  return {
    mainHotkey: normalizeHotkey(app.hotkeys.main),
    explainHotkey: normalizeHotkey(app.hotkeys.explain),
    settingsHotkey: normalizeHotkey(app.hotkeys.settings),
    locale: app.locale,
    sourceLanguage: app.sourceLanguage,
    targetLanguage: app.targetLanguage,
    outputMode: app.outputMode,
    autoStart: app.autoStart,
    alwaysOnTop: app.alwaysOnTop,
    theme: app.theme,
    opacity: app.opacity,
    aiProvider: app.aiProvider,
  };
}
