export type OutputMode = 'conservative' | 'enhanced';
export type Theme = 'dark' | 'light';
export type AppLanguage =
  | 'chinese'
  | 'english'
  | 'japanese'
  | 'korean'
  | 'spanish'
  | 'french'
  | 'german';

export interface AiProvider {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface Settings {
  mainHotkey: string;
  explainHotkey: string;
  settingsHotkey?: string;
  sourceLanguage: AppLanguage;
  targetLanguage: AppLanguage;
  outputMode: OutputMode;
  autoStart: boolean;
  alwaysOnTop: boolean;
  theme: Theme;
  opacity: number;
  aiProvider: AiProvider;
}

export interface Hotkeys {
  main: string;
  explain: string;
  settings: string;
}

export interface AppSettings {
  hotkeys: Hotkeys;
  sourceLanguage: AppLanguage;
  targetLanguage: AppLanguage;
  outputMode: OutputMode;
  autoStart: boolean;
  alwaysOnTop: boolean;
  theme: Theme;
  opacity: number;
  aiProvider: AiProvider;
}

export interface ExplainResult {
  original: string;
  meaning: string;
  context: string;
}

export interface DiffChunk {
  type: 'equal' | 'insert' | 'delete';
  value: string;
}
