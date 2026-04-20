import { useState, useCallback, useEffect, useRef } from 'react';
import { MainLayout } from '../components/windows/MainLayout';
import { useOptimize } from '../hooks/useOptimize';
import { useSettings } from '../hooks/useSettings';
import { useClipboard } from '../hooks/useClipboard';
import { useWindow } from '../hooks/useWindow';
import { useAppearance } from '../hooks/useAppearance';
import { hideCurrentWindow, showWindow } from '../lib/tauri';
import { getLanguageLabel, I18nProvider } from '../lib/i18n';

export default function MainWindow() {
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const [input, setInput] = useState('');
  const { result, loading, error, retry } = useOptimize(
    input,
    settings.outputMode,
    settings.nativeLanguage,
    settings.learningLanguage,
  );
  const { write } = useClipboard();
  const isDraggingRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const learningLanguageLabel = getLanguageLabel(settings.locale, settings.learningLanguage);

  useWindow({
    type: 'main',
    hideOnBlur: !settings.alwaysOnTop,
    shouldHideOnBlur: () => !isDraggingRef.current,
  });

  const handleCopyResult = useCallback(async () => {
    if (result) {
      await write(result);
    }
  }, [result, write]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (result && window.getSelection()?.toString() === '') {
          e.preventDefault();
          void handleCopyResult();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [result, handleCopyResult]);

  useEffect(() => {
    const focusInput = () => {
      window.setTimeout(() => {
        const textarea = inputRef.current;
        if (!textarea) return;
        textarea.focus();
        const cursorPosition = textarea.value.length;
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    };

    focusInput();
    window.addEventListener('focus', focusInput);
    return () => window.removeEventListener('focus', focusInput);
  }, []);

  const handleSettingsClick = useCallback(() => {
    void showWindow('settings');
  }, []);

  const handleAlwaysOnTopToggle = useCallback(() => {
    void updateSettings({ alwaysOnTop: !settings.alwaysOnTop });
  }, [settings.alwaysOnTop, updateSettings]);

  const handleDragStateChange = useCallback((dragging: boolean) => {
    isDraggingRef.current = dragging;

    if (!dragging) {
      window.setTimeout(() => {
        if (!isDraggingRef.current && !document.hasFocus()) {
          void hideCurrentWindow();
        }
      }, 0);
    }
  }, []);

  useAppearance(settings);

  return (
    <I18nProvider locale={settings.locale}>
      <MainLayout
        inputRef={inputRef}
        inputValue={input}
        onInputChange={setInput}
        originalText={input}
        resultText={result}
        learningLanguageLabel={learningLanguageLabel}
        isLoading={loading || settingsLoading}
        error={error}
        alwaysOnTop={settings.alwaysOnTop}
        onAlwaysOnTopToggle={handleAlwaysOnTopToggle}
        onSettingsClick={handleSettingsClick}
        onSubmit={retry}
        onDragStateChange={handleDragStateChange}
      />
    </I18nProvider>
  );
}
