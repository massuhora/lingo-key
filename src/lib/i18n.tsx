import { createContext, useContext, useMemo } from 'react';
import type { AppLanguage, Locale } from '../types';

type TranslationValues = Record<string, string | number>;
type TranslationTable = Record<string, string>;

const translations: Record<Locale, TranslationTable> = {
  'zh-CN': {
    'locale.zh-CN': '简体中文',
    'locale.en-US': 'English',
    'language.chinese': '中文',
    'language.english': '英文',
    'language.japanese': '日文',
    'language.korean': '韩文',
    'language.spanish': '西班牙文',
    'language.french': '法文',
    'language.german': '德文',
    'common.close': '关闭',
    'common.minimize': '最小化',
    'common.saveChanges': '保存更改',
    'common.reset': '重置',
    'common.settings': '设置',
    'common.unsavedChanges': '有未保存更改',
    'common.synced': '已与本地配置同步',
    'common.noTextProvided': '未提供文本',
    'copyButton.copy': '复制到剪贴板',
    'copyButton.copied': '已复制',
    'hotkeyInput.placeholder': '点击并按下快捷键...',
    'hotkeyInput.recording': '录制中',
    'hotkeyInput.idle': '待机',
    'hotkeyInput.recordingHint': '按下你想设置的快捷键组合，然后松开最后一个按键。',
    'hotkeyInput.idleHint': '点击后直接录制新的全局快捷键。',
    'main.status': 'Prompt Polish',
    'main.inputTitle': '输入',
    'main.inputDescription': '输入原文，LingoKey 会按当前语言设置整理成 {language}。',
    'main.inputPlaceholder': '输入需要整理成{language}的内容...',
    'main.inputHint': '适合需求描述、问题重述、让 AI 更容易理解的上下文。',
    'main.resultTitle': '润色结果',
    'main.resultDescription': '差异会被高亮，方便快速确认修改点。',
    'main.loading': '正在整理表达...',
    'main.emptyTitle': '结果会显示在这里',
    'main.emptyDescription': '发送前先快速检查语气、术语和细节表达。',
    'main.quickSubmit': '快捷提交',
    'main.quickSubmitDescription': '支持直接复制结果，继续发给 Codex、Claude Code 或 Cursor。',
    'main.submit': '开始润色',
    'main.submitting': '正在润色',
    'explain.title': '解释',
    'explain.status': 'Instant Explain',
    'explain.triggerHint': '选中文本后触发',
    'explain.original': '原文',
    'explain.meaning': '{language}释义',
    'explain.loading': '正在加载解释...',
    'explain.noTextSelected': '请先用鼠标划选一段文字，再按解释热键。如果已划选但仍失败，请尝试手动按 Ctrl+C 复制后再按热键。',
    'explain.notDetected': '未检测到选中文本',
    'explain.noExplanation': '暂无解释。',
    'explain.fallbackMeaning': '暂时无法生成释义，原文是“{text}”。',
    'explain.fallbackContext': '通常用于代码评审、技术文档或开发讨论。',
    'settings.title': '设置',
    'settings.summaryEyebrow': '工作区偏好',
    'settings.heroTitle': '把 LingoKey 调成更顺手的工作状态',
    'settings.heroDescription': '热键、界面语言、主题、透明度和 AI 接口配置都在这里统一管理。重点是更稳的层级、更清楚的焦点反馈，以及更低的视觉噪声。',
    'settings.summaryTheme': '主题',
    'settings.summaryLocale': '界面语言',
    'settings.summaryLanguages': '翻译语言',
    'settings.summaryProfile': '输出模式',
    'settings.summarySync': '同步状态',
    'settings.languageSectionTitle': '语言',
    'settings.languageSectionDescription': '分别控制界面语言、原文语言和输出语言。',
    'settings.uiLanguage': '界面语言',
    'settings.uiLanguageDescription': '切换应用界面的显示语言。',
    'settings.sourceLanguage': '原文语言',
    'settings.sourceLanguageDescription': '将输入和划词内容默认视为{language}。',
    'settings.targetLanguage': '输出语言',
    'settings.targetLanguageDescription': '润色结果和解释释义会输出为{language}。',
    'settings.languageSectionHint': '主窗口会把原文整理为目标语言；解释窗口会把划词内容翻译并说明为目标语言。',
    'settings.outputModeTitle': '输出模式',
    'settings.outputModeDescription': '决定润色结果更贴近原文还是更积极优化。',
    'settings.outputMode': '优化风格',
    'settings.outputModeHint': '保守模式更接近原文；增强模式会进行更积极的改写，更适合直接提交给 AI 编程助手。',
    'settings.outputMode.conservative': '保守',
    'settings.outputMode.conservativeDescription': '更接近原文语义和结构，适合轻量润色。',
    'settings.outputMode.enhanced': '增强',
    'settings.outputMode.enhancedDescription': '会更积极地重写表达，适合直接发给 AI。',
    'settings.appearanceTitle': '外观',
    'settings.appearanceDescription': '调整主题和透明度，让窗口更融入你的桌面环境。',
    'settings.theme': '主题',
    'settings.theme.dark': '深色',
    'settings.theme.darkDescription': '对比更强，适合夜间或深色工作区。',
    'settings.theme.light': '浅色',
    'settings.theme.lightDescription': '界面更轻盈，适合明亮桌面环境。',
    'settings.themeBadge.dark': '深色主题',
    'settings.themeBadge.light': '浅色主题',
    'settings.opacity': '窗口不透明度',
    'settings.hotkeysTitle': '快捷键',
    'settings.hotkeysDescription': '为三个窗口设置更顺手的全局热键组合。',
    'settings.hotkeysBadge': '3 组热键',
    'settings.hotkey.main': '主窗口',
    'settings.hotkey.explain': '解释窗口',
    'settings.hotkey.settings': '设置窗口',
    'settings.hotkeysHint': '尽量避免与系统保留快捷键或 IDE 常用组合冲突，尤其是 Ctrl+Shift 系列。',
    'settings.aiTitle': 'AI 服务商',
    'settings.aiDescription': '接入任何兼容 OpenAI 的接口地址、密钥和模型。',
    'settings.aiConfigured': '已配置密钥',
    'settings.aiFallback': '备用模式',
    'settings.aiBaseUrl': '接口地址',
    'settings.aiApiKey': 'API 密钥',
    'settings.aiModel': '模型',
    'settings.aiHint': '支持任何兼容 OpenAI 的 API。留空 API 密钥时会继续使用本地备用模式，适合先验证界面和流程。',
    'settings.preferencesTitle': '偏好设置',
    'settings.preferencesDescription': '控制窗口行为，保持 LingoKey 与你的工作区节奏一致。',
    'settings.preferencesOnTop': '置顶开启',
    'settings.preferencesOnDemand': '按需显示',
    'settings.alwaysOnTop': '置顶显示',
    'settings.alwaysOnTopDescription': '让 LingoKey 始终显示在其他窗口之上',
    'settings.autoStart': '开机自启',
    'settings.autoStartDescription': '系统启动时自动运行 LingoKey',
    'settings.footerUnsavedDescription': '保存后会立即应用到对应窗口。',
    'settings.footerSavedDescription': '你当前看到的是已生效的本地配置。',
    'settings.saveFailed': '保存设置失败',
    'tray.show': '显示主窗口',
    'tray.quit': '退出',
  },
  'en-US': {
    'locale.zh-CN': 'Simplified Chinese',
    'locale.en-US': 'English',
    'language.chinese': 'Chinese',
    'language.english': 'English',
    'language.japanese': 'Japanese',
    'language.korean': 'Korean',
    'language.spanish': 'Spanish',
    'language.french': 'French',
    'language.german': 'German',
    'common.close': 'Close',
    'common.minimize': 'Minimize',
    'common.saveChanges': 'Save Changes',
    'common.reset': 'Reset',
    'common.settings': 'Settings',
    'common.unsavedChanges': 'Unsaved changes',
    'common.synced': 'Synced with local settings',
    'common.noTextProvided': 'No text provided',
    'copyButton.copy': 'Copy to clipboard',
    'copyButton.copied': 'Copied',
    'hotkeyInput.placeholder': 'Click and press a shortcut...',
    'hotkeyInput.recording': 'LISTEN',
    'hotkeyInput.idle': 'IDLE',
    'hotkeyInput.recordingHint': 'Press the shortcut combination you want, then release the last key.',
    'hotkeyInput.idleHint': 'Click to record a new global shortcut.',
    'main.status': 'Prompt Polish',
    'main.inputTitle': 'Input',
    'main.inputDescription': 'Enter the source text and LingoKey will rewrite it into {language}.',
    'main.inputPlaceholder': 'Enter content to rewrite into {language}...',
    'main.inputHint': 'Useful for prompts, problem restatements, and context you want AI to understand faster.',
    'main.resultTitle': 'Polished Result',
    'main.resultDescription': 'Highlighted diffs make it easy to confirm what changed.',
    'main.loading': 'Polishing the phrasing...',
    'main.emptyTitle': 'The result will appear here',
    'main.emptyDescription': 'Check tone, terminology, and details before sending it on.',
    'main.quickSubmit': 'Quick Submit',
    'main.quickSubmitDescription': 'Copy the result directly and send it to Codex, Claude Code, or Cursor.',
    'main.submit': 'Polish Prompt',
    'main.submitting': 'Polishing',
    'explain.title': 'Explain',
    'explain.status': 'Instant Explain',
    'explain.triggerHint': 'Triggered from selected text',
    'explain.original': 'Original',
    'explain.meaning': '{language} Meaning',
    'explain.loading': 'Loading explanation...',
    'explain.noTextSelected': 'Select some text first, then press the explain hotkey. If selection detection still fails, copy it with Ctrl+C and try again.',
    'explain.notDetected': 'No selected text detected',
    'explain.noExplanation': 'No explanation available.',
    'explain.fallbackMeaning': 'An explanation is unavailable right now. Original text: "{text}".',
    'explain.fallbackContext': 'Typically used in code reviews, documentation, or technical discussions.',
    'settings.title': 'Settings',
    'settings.summaryEyebrow': 'Workspace Preferences',
    'settings.heroTitle': 'Tune LingoKey to fit your workflow',
    'settings.heroDescription': 'Manage hotkeys, UI language, theme, opacity, and AI provider settings in one place with clearer focus states and lower visual noise.',
    'settings.summaryTheme': 'Theme',
    'settings.summaryLocale': 'UI Language',
    'settings.summaryLanguages': 'Translation Languages',
    'settings.summaryProfile': 'Output Style',
    'settings.summarySync': 'Sync',
    'settings.languageSectionTitle': 'Language',
    'settings.languageSectionDescription': 'Control the UI language, source language, and target language separately.',
    'settings.uiLanguage': 'Interface Language',
    'settings.uiLanguageDescription': 'Switch the language used by the app interface.',
    'settings.sourceLanguage': 'Source Language',
    'settings.sourceLanguageDescription': 'Treat typed and selected text as {language} by default.',
    'settings.targetLanguage': 'Target Language',
    'settings.targetLanguageDescription': 'Output polished text and explanations in {language}.',
    'settings.languageSectionHint': 'The main window rewrites into the target language. The explain window translates and explains selected text in the target language.',
    'settings.outputModeTitle': 'Output Mode',
    'settings.outputModeDescription': 'Choose whether the rewrite stays closer to the source or improves phrasing more aggressively.',
    'settings.outputMode': 'Rewrite Style',
    'settings.outputModeHint': 'Conservative mode stays closer to the original. Enhanced mode rewrites more aggressively for direct use with AI coding assistants.',
    'settings.outputMode.conservative': 'Conservative',
    'settings.outputMode.conservativeDescription': 'Stay closer to the original meaning and structure.',
    'settings.outputMode.enhanced': 'Enhanced',
    'settings.outputMode.enhancedDescription': 'Rewrite more assertively for ready-to-send prompts.',
    'settings.appearanceTitle': 'Appearance',
    'settings.appearanceDescription': 'Adjust theme and opacity so the windows fit your desktop.',
    'settings.theme': 'Theme',
    'settings.theme.dark': 'Dark',
    'settings.theme.darkDescription': 'Higher contrast for dark workspaces and late-night use.',
    'settings.theme.light': 'Light',
    'settings.theme.lightDescription': 'A lighter interface for bright desktop environments.',
    'settings.themeBadge.dark': 'Dark Theme',
    'settings.themeBadge.light': 'Light Theme',
    'settings.opacity': 'Window Opacity',
    'settings.hotkeysTitle': 'Hotkeys',
    'settings.hotkeysDescription': 'Set a convenient global shortcut for each window.',
    'settings.hotkeysBadge': '3 Hotkeys',
    'settings.hotkey.main': 'Main Window',
    'settings.hotkey.explain': 'Explain Window',
    'settings.hotkey.settings': 'Settings Window',
    'settings.hotkeysHint': 'Avoid conflicts with system shortcuts or common IDE bindings, especially Ctrl+Shift combinations.',
    'settings.aiTitle': 'AI Provider',
    'settings.aiDescription': 'Connect any OpenAI-compatible base URL, API key, and model.',
    'settings.aiConfigured': 'API Key Set',
    'settings.aiFallback': 'Fallback Mode',
    'settings.aiBaseUrl': 'Base URL',
    'settings.aiApiKey': 'API Key',
    'settings.aiModel': 'Model',
    'settings.aiHint': 'Any OpenAI-compatible API works. Leave the API key empty to keep using local fallback behavior while validating the UI flow.',
    'settings.preferencesTitle': 'Preferences',
    'settings.preferencesDescription': 'Keep window behavior aligned with how you work.',
    'settings.preferencesOnTop': 'Always on top',
    'settings.preferencesOnDemand': 'Show on demand',
    'settings.alwaysOnTop': 'Always on Top',
    'settings.alwaysOnTopDescription': 'Keep LingoKey above other windows',
    'settings.autoStart': 'Launch at Startup',
    'settings.autoStartDescription': 'Start LingoKey automatically with the system',
    'settings.footerUnsavedDescription': 'Saving applies the changes to the relevant windows immediately.',
    'settings.footerSavedDescription': 'You are looking at the active local configuration.',
    'settings.saveFailed': 'Failed to save settings',
    'tray.show': 'Show Main Window',
    'tray.quit': 'Quit',
  },
};

const languageKeyMap: Record<AppLanguage, string> = {
  chinese: 'language.chinese',
  english: 'language.english',
  japanese: 'language.japanese',
  korean: 'language.korean',
  spanish: 'language.spanish',
  french: 'language.french',
  german: 'language.german',
};

function format(template: string, values?: TranslationValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

export function translate(locale: Locale, key: string, values?: TranslationValues): string {
  const table = translations[locale] ?? translations['zh-CN'];
  const fallback = translations['en-US'][key] ?? key;
  return format(table[key] ?? fallback, values);
}

export function getLanguageLabel(locale: Locale, language: AppLanguage): string {
  return translate(locale, languageKeyMap[language]);
}

export function getLanguageOptions(locale: Locale) {
  return Object.keys(languageKeyMap).map((language) => ({
    value: language as AppLanguage,
    label: getLanguageLabel(locale, language as AppLanguage),
  }));
}

export function getLocaleOptions(locale: Locale) {
  return (['zh-CN', 'en-US'] as const).map((value) => ({
    value,
    label: translate(locale, `locale.${value}`),
  }));
}

interface I18nContextValue {
  locale: Locale;
  t: (key: string, values?: TranslationValues) => string;
  getLanguageLabel: (language: AppLanguage) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'zh-CN',
  t: (key, values) => translate('zh-CN', key, values),
  getLanguageLabel: (language) => getLanguageLabel('zh-CN', language),
});

interface I18nProviderProps {
  locale: Locale;
  children: React.ReactNode;
}

export function I18nProvider({ locale, children }: I18nProviderProps) {
  const value = useMemo<I18nContextValue>(() => ({
    locale,
    t: (key, values) => translate(locale, key, values),
    getLanguageLabel: (language) => getLanguageLabel(locale, language),
  }), [locale]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
