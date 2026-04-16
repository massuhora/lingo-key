import { invoke } from '@tauri-apps/api/core';
import { listen, type Event, type UnlistenFn } from '@tauri-apps/api/event';
import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import type { Settings, ExplainResult } from '../types';

// Backend command wrappers

export async function showWindow(label: string): Promise<void> {
  try {
    if (label === 'main') {
      await invoke('show_main_window');
    } else if (label === 'explain') {
      await invoke('show_explain_window');
    } else if (label === 'settings') {
      await invoke('show_settings_window');
    } else {
      console.error('Unknown window label:', label);
    }
  } catch (error) {
    console.error('Failed to show window:', error);
  }
}

export async function hideWindow(label: string): Promise<void> {
  try {
    await invoke('hide_window', { label });
  } catch (error) {
    console.error('Failed to hide window:', error);
  }
}

export async function getSettings(): Promise<Settings | null> {
  try {
    return await invoke<Settings>('get_settings');
  } catch (error) {
    console.error('Failed to get settings:', error);
    return null;
  }
}

export async function setSettings(settings: Settings): Promise<boolean> {
  try {
    await invoke('set_settings', { settings });
    return true;
  } catch (error) {
    console.error('Failed to set settings:', error);
    return false;
  }
}

export async function readClipboard(): Promise<string> {
  try {
    const text = await readText();
    return text ?? '';
  } catch (error) {
    console.error('Failed to read clipboard:', error);
    return '';
  }
}

export async function writeClipboard(text: string): Promise<boolean> {
  try {
    await writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to write clipboard:', error);
    return false;
  }
}

export async function optimizeText(text: string, mode: string): Promise<string> {
  try {
    return await invoke<string>('optimize_text', { text, mode });
  } catch (error) {
    console.error('Failed to optimize text:', error);
    throw error;
  }
}

export async function explainText(text: string): Promise<ExplainResult> {
  try {
    return await invoke<ExplainResult>('explain_text', { text });
  } catch (error) {
    console.error('Failed to explain text:', error);
    throw error;
  }
}

export async function hideCurrentWindow(): Promise<void> {
  try {
    const win = getCurrentWebviewWindow();
    await win.hide();
  } catch (error) {
    console.error('Failed to hide current window:', error);
  }
}

export async function closeCurrentWindow(): Promise<void> {
  try {
    const win = getCurrentWebviewWindow();
    await win.close();
  } catch (error) {
    console.error('Failed to close current window:', error);
  }
}

// Event listeners

export function listenClipboardText(
  callback: (text: string) => void,
): Promise<UnlistenFn> {
  return listen('clipboard-text', (event: Event<string>) => {
    callback(event.payload);
  });
}

export function listenShowExplain(
  callback: (text: string) => void,
): Promise<UnlistenFn> {
  return listen('show-explain', (event: Event<string>) => {
    callback(event.payload);
  });
}
