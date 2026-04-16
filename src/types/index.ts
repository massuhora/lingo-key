export type OutputMode = 'conservative' | 'enhanced';

export interface AiProvider {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface Settings {
  mainHotkey: string;
  explainHotkey: string;
  settingsHotkey?: string;
  outputMode: OutputMode;
  autoStart: boolean;
  alwaysOnTop: boolean;
  aiProvider: AiProvider;
}

export interface Hotkeys {
  main: string;
  explain: string;
  settings: string;
}

export interface AppSettings {
  hotkeys: Hotkeys;
  outputMode: OutputMode;
  autoStart: boolean;
  alwaysOnTop: boolean;
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
