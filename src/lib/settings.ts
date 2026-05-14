import type {
  Settings,
  AppSettings,
  Hotkeys,
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
  model: 'deepseek-v4-flash',
};

export const DEFAULT_SETTINGS: Settings = {
  mainHotkey: 'CommandOrControl+Shift+L',
  explainHotkey: 'CommandOrControl+Shift+E',
  settingsHotkey: 'CommandOrControl+Shift+S',
  locale: 'zh-CN',
  nativeLanguage: 'chinese',
  learningLanguage: 'english',
  outputMode: 'enhanced',
  autoStart: false,
  alwaysOnTop: true,
  theme: 'dark',
  opacity: 1.0,
  aiProvider: DEFAULT_AI_PROVIDER,
  windowSizes: {},
};

type LegacySettingsFields = {
  sourceLanguage?: AppLanguage;
  targetLanguage?: AppLanguage;
};

// Normalize common hotkey aliases so the UI and Rust agree on the format.
function normalizeHotkeyPart(part: string): string {
  const lower = part.trim().toLowerCase();
  const namedKeys: Record<string, string> = {
    escape: 'Escape',
    esc: 'Esc',
    tab: 'Tab',
    space: 'Space',
    enter: 'Enter',
    return: 'Return',
    backspace: 'Backspace',
    delete: 'Delete',
    insert: 'Insert',
    home: 'Home',
    end: 'End',
    pageup: 'PageUp',
    pagedown: 'PageDown',
    arrowup: 'Up',
    arrowdown: 'Down',
    arrowleft: 'Left',
    arrowright: 'Right',
    up: 'Up',
    down: 'Down',
    left: 'Left',
    right: 'Right',
    capslock: 'CapsLock',
    numlock: 'NumLock',
    scrolllock: 'ScrollLock',
    printscreen: 'PrintScreen',
    pause: 'Pause',
  };
  if (/^f([1-9]|1[0-2])$/.test(lower)) {
    return lower.toUpperCase();
  }
  if (namedKeys[lower]) {
    return namedKeys[lower];
  }
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
  const parts = normalizeHotkey(hotkey).split('+').map((p) => p.trim()).filter(Boolean);
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

  const hasModifier = parts.some((p) => modifiers.has(p));
  if (!hasModifier) return false;

  const key = parts[parts.length - 1];
  if (!key || modifiers.has(key)) return false;

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

export type HotkeyField = keyof Hotkeys;
export type HotkeyValidationCode = 'invalid' | 'duplicate';

export interface HotkeyValidationIssue {
  code: HotkeyValidationCode;
  duplicateWith?: HotkeyField;
}

export type HotkeyValidationErrors = Partial<Record<HotkeyField, HotkeyValidationIssue>>;

export function validateHotkeys(hotkeys: Hotkeys): HotkeyValidationErrors {
  const errors: HotkeyValidationErrors = {};
  const entries = Object.entries(hotkeys) as Array<[HotkeyField, string]>;
  const seen = new Map<string, HotkeyField>();

  for (const [field, hotkey] of entries) {
    const normalized = normalizeHotkey(hotkey);

    if (!isValidHotkey(normalized)) {
      errors[field] = { code: 'invalid' };
      continue;
    }

    const duplicateKey = normalized.toLowerCase();
    const duplicateWith = seen.get(duplicateKey);
    if (duplicateWith) {
      errors[field] = { code: 'duplicate', duplicateWith };
      if (!errors[duplicateWith]) {
        errors[duplicateWith] = { code: 'duplicate', duplicateWith: field };
      }
      continue;
    }

    seen.set(duplicateKey, field);
  }

  return errors;
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

function normalizeAiModel(baseUrl: string | undefined, model: string | undefined): string {
  if (!model?.trim()) return DEFAULT_AI_PROVIDER.model;
  const normalizedModel = model.trim();
  const normalizedBaseUrl = baseUrl?.trim().toLowerCase() ?? '';

  if (
    normalizedBaseUrl.includes('api.deepseek.com') &&
    normalizedModel === 'deepseek-chat'
  ) {
    return DEFAULT_AI_PROVIDER.model;
  }

  return normalizedModel;
}

export function mergeSettings(partial: Partial<Settings>): Settings {
  const legacy = partial as Partial<Settings> & LegacySettingsFields;
  const nativeLanguage = partial.nativeLanguage ?? legacy.sourceLanguage;
  const learningLanguage = partial.learningLanguage ?? legacy.targetLanguage;
  const aiProvider = {
    ...DEFAULT_SETTINGS.aiProvider,
    ...(partial.aiProvider ?? {}),
  };
  aiProvider.model = normalizeAiModel(aiProvider.baseUrl, aiProvider.model);

  return {
    ...DEFAULT_SETTINGS,
    ...partial,
    locale: normalizeLocale(partial.locale),
    nativeLanguage: normalizeLanguage(
      nativeLanguage,
      DEFAULT_SETTINGS.nativeLanguage,
    ),
    learningLanguage: normalizeLanguage(
      learningLanguage,
      DEFAULT_SETTINGS.learningLanguage,
    ),
    outputMode: normalizeOutputMode(partial.outputMode ?? DEFAULT_SETTINGS.outputMode),
    theme: normalizeTheme(partial.theme ?? DEFAULT_SETTINGS.theme),
    opacity: normalizeOpacity(partial.opacity ?? DEFAULT_SETTINGS.opacity),
    aiProvider,
    windowSizes: partial.windowSizes ?? {},
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
    nativeLanguage: settings.nativeLanguage,
    learningLanguage: settings.learningLanguage,
    outputMode: settings.outputMode,
    autoStart: settings.autoStart,
    alwaysOnTop: settings.alwaysOnTop,
    theme: settings.theme,
    opacity: settings.opacity,
    aiProvider: settings.aiProvider,
    windowSizes: settings.windowSizes,
  };
}

export function toSettings(app: AppSettings): Settings {
  return {
    mainHotkey: normalizeHotkey(app.hotkeys.main),
    explainHotkey: normalizeHotkey(app.hotkeys.explain),
    settingsHotkey: normalizeHotkey(app.hotkeys.settings),
    locale: app.locale,
    nativeLanguage: app.nativeLanguage,
    learningLanguage: app.learningLanguage,
    outputMode: app.outputMode,
    autoStart: app.autoStart,
    alwaysOnTop: app.alwaysOnTop,
    theme: app.theme,
    opacity: app.opacity,
    aiProvider: app.aiProvider,
    windowSizes: app.windowSizes,
  };
}
