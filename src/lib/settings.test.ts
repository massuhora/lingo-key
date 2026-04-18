import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SETTINGS,
  isValidHotkey,
  normalizeLocale,
  normalizeOutputMode,
  normalizeLanguage,
  mergeSettings,
  toAppSettings,
  toSettings,
} from './settings';

describe('isValidHotkey', () => {
  it('accepts Ctrl+Shift+A', () => {
    expect(isValidHotkey('Ctrl+Shift+A')).toBe(true);
  });

  it('accepts CommandOrControl+Shift+L', () => {
    expect(isValidHotkey('CommandOrControl+Shift+L')).toBe(true);
  });

  it('accepts CmdOrCtrl+Shift+E', () => {
    expect(isValidHotkey('CmdOrCtrl+Shift+E')).toBe(true);
  });

  it('accepts function keys with modifiers', () => {
    expect(isValidHotkey('Ctrl+F12')).toBe(true);
  });

  it('rejects single key without modifier', () => {
    expect(isValidHotkey('A')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidHotkey('')).toBe(false);
  });

  it('rejects plain modifier combination without key', () => {
    expect(isValidHotkey('Ctrl+Shift')).toBe(false);
  });
});

describe('normalizeOutputMode', () => {
  it('returns conservative when passed conservative', () => {
    expect(normalizeOutputMode('conservative')).toBe('conservative');
  });

  it('returns enhanced for any other value', () => {
    expect(normalizeOutputMode('enhanced')).toBe('enhanced');
    expect(normalizeOutputMode('')).toBe('enhanced');
    expect(normalizeOutputMode('unknown')).toBe('enhanced');
  });
});

describe('normalizeLocale', () => {
  it('accepts supported locales', () => {
    expect(normalizeLocale('en-US')).toBe('en-US');
  });

  it('falls back to zh-CN for unsupported values', () => {
    expect(normalizeLocale('fr-FR')).toBe('zh-CN');
    expect(normalizeLocale(undefined)).toBe('zh-CN');
  });
});

describe('normalizeLanguage', () => {
  it('accepts supported languages', () => {
    expect(normalizeLanguage('japanese', 'english')).toBe('japanese');
  });

  it('falls back for unsupported values', () => {
    expect(normalizeLanguage('unknown', 'english')).toBe('english');
    expect(normalizeLanguage(undefined, 'chinese')).toBe('chinese');
  });
});

describe('mergeSettings', () => {
  it('returns defaults when called with empty object', () => {
    expect(mergeSettings({})).toEqual(DEFAULT_SETTINGS);
  });

  it('overrides specific fields while keeping defaults for others', () => {
    const merged = mergeSettings({ autoStart: true });
    expect(merged.autoStart).toBe(true);
    expect(merged.outputMode).toBe(DEFAULT_SETTINGS.outputMode);
    expect(merged.mainHotkey).toBe(DEFAULT_SETTINGS.mainHotkey);
  });

  it('normalizes outputMode to enhanced for invalid values', () => {
    const merged = mergeSettings({ outputMode: 'invalid' as any });
    expect(merged.outputMode).toBe('enhanced');
  });

  it('preserves conservative outputMode when explicitly set', () => {
    const merged = mergeSettings({ outputMode: 'conservative' });
    expect(merged.outputMode).toBe('conservative');
  });

  it('fills missing language pair with defaults', () => {
    const merged = mergeSettings({ nativeLanguage: 'japanese' });
    expect(merged.locale).toBe(DEFAULT_SETTINGS.locale);
    expect(merged.nativeLanguage).toBe('japanese');
    expect(merged.learningLanguage).toBe(DEFAULT_SETTINGS.learningLanguage);
  });

  it('maps legacy source and target language fields', () => {
    const merged = mergeSettings({
      sourceLanguage: 'korean',
      targetLanguage: 'english',
    } as any);
    expect(merged.nativeLanguage).toBe('korean');
    expect(merged.learningLanguage).toBe('english');
  });
});

describe('toAppSettings / toSettings round-trip', () => {
  it('converts Settings to AppSettings and back', () => {
    const app = toAppSettings(DEFAULT_SETTINGS);
    expect(app.hotkeys.main).toBe(DEFAULT_SETTINGS.mainHotkey);
    expect(app.hotkeys.explain).toBe(DEFAULT_SETTINGS.explainHotkey);
    expect(app.hotkeys.settings).toBe(DEFAULT_SETTINGS.settingsHotkey);
    expect(app.locale).toBe(DEFAULT_SETTINGS.locale);
    expect(app.nativeLanguage).toBe(DEFAULT_SETTINGS.nativeLanguage);
    expect(app.learningLanguage).toBe(DEFAULT_SETTINGS.learningLanguage);
    expect(app.outputMode).toBe(DEFAULT_SETTINGS.outputMode);
    expect(app.autoStart).toBe(DEFAULT_SETTINGS.autoStart);
    expect(app.alwaysOnTop).toBe(DEFAULT_SETTINGS.alwaysOnTop);

    const back = toSettings(app);
    expect(back).toEqual(DEFAULT_SETTINGS);
  });

  it('preserves custom values through round-trip', () => {
    const custom = {
      ...DEFAULT_SETTINGS,
      mainHotkey: 'Ctrl+Alt+L',
      locale: 'en-US' as const,
      nativeLanguage: 'japanese' as const,
      learningLanguage: 'english' as const,
      outputMode: 'conservative' as const,
      alwaysOnTop: false,
    };
    const back = toSettings(toAppSettings(custom));
    expect(back).toEqual(custom);
  });
});
