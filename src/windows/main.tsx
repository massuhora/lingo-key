import { useState, useCallback, useEffect, useRef } from 'react';
import { MainLayout } from '../components/windows/MainLayout';
import { useOptimize } from '../hooks/useOptimize';
import { useSettings } from '../hooks/useSettings';
import { useClipboard } from '../hooks/useClipboard';
import { useWindow } from '../hooks/useWindow';
import { useAppearance } from '../hooks/useAppearance';
import { hideCurrentWindow, showWindow } from '../lib/tauri';

export default function MainWindow() {
  const { settings, loading: settingsLoading } = useSettings();
  const [input, setInput] = useState('');
  const { result, loading, error, retry } = useOptimize(input, settings.outputMode);
  const { write } = useClipboard();
  const isDraggingRef = useRef(false);

  useWindow({
    type: 'main',
    hideOnBlur: true,
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

  const handleSettingsClick = useCallback(() => {
    void showWindow('settings');
  }, []);

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
    <MainLayout
      inputValue={input}
      onInputChange={setInput}
      originalText={input}
      resultText={result}
      isLoading={loading || settingsLoading}
      error={error}
      onSettingsClick={handleSettingsClick}
      onSubmit={retry}
      onDragStateChange={handleDragStateChange}
    />
  );
}
