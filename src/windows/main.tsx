import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { MainLayout } from '../components/windows/MainLayout';
import { ExplainLayout } from '../components/windows/ExplainLayout';
import { SettingsLayout } from '../components/windows/SettingsLayout';
import { useOptimize } from '../hooks/useOptimize';
import { useSettings } from '../hooks/useSettings';
import { useClipboard } from '../hooks/useClipboard';
import { useExplain } from '../hooks/useExplain';
import { useWindow } from '../hooks/useWindow';
import { useAppearance } from '../hooks/useAppearance';
import {
  hideCurrentWindow,
  listenClipboardText,
  listenOpenView,
  readClipboard,
  setSettings,
  setWindowAlwaysOnTop,
} from '../lib/tauri';
import { getLanguageLabel, I18nProvider, translate } from '../lib/i18n';
import { toAppSettings, toSettings } from '../lib/settings';
import type { AppSettings, ExplainResult } from '../types';

type ActiveView = 'optimize' | 'explain' | 'settings';

export default function MainWindow() {
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const [activeView, setActiveView] = useState<ActiveView>('optimize');
  const [input, setInput] = useState('');
  const { result, loading, error, retry } = useOptimize(
    input,
    settings.outputMode,
    settings.nativeLanguage,
    settings.learningLanguage,
  );
  const {
    result: explainResult,
    loading: explainLoading,
    error: explainError,
    run: runExplain,
  } = useExplain(settings.nativeLanguage, settings.learningLanguage, settings.locale);
  const { write } = useClipboard();
  const [originalExplainText, setOriginalExplainText] = useState('');
  const persistedAppSettings = useMemo(() => toAppSettings(settings), [settings]);
  const [draftSettings, setDraftSettings] = useState<AppSettings>(persistedAppSettings);
  const isDraggingRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const learningLanguageLabel = getLanguageLabel(settings.locale, settings.learningLanguage);
  const nativeLanguageLabel = getLanguageLabel(settings.locale, settings.nativeLanguage);
  const hasSettingsChanges = useMemo(
    () => JSON.stringify(draftSettings) !== JSON.stringify(persistedAppSettings),
    [draftSettings, persistedAppSettings],
  );

  useWindow({
    type: 'main',
    hideOnBlur: !settings.alwaysOnTop && activeView !== 'settings',
    shouldHideOnBlur: () => !isDraggingRef.current,
  });

  useEffect(() => {
    if (activeView !== 'settings') {
      setDraftSettings(persistedAppSettings);
    }
  }, [activeView, persistedAppSettings]);

  useEffect(() => {
    const shouldBeAlwaysOnTop = activeView === 'settings'
      ? draftSettings.alwaysOnTop
      : settings.alwaysOnTop;

    void setWindowAlwaysOnTop('main', shouldBeAlwaysOnTop);
  }, [activeView, draftSettings.alwaysOnTop, settings.alwaysOnTop]);

  const appearanceSettings = activeView === 'settings' ? draftSettings : settings;
  useAppearance(appearanceSettings);

  const openOptimize = useCallback(() => {
    setActiveView('optimize');
  }, []);

  const openSettings = useCallback(() => {
    setDraftSettings(toAppSettings(settings));
    setActiveView('settings');
  }, [settings]);

  const openExplain = useCallback(async (text?: string) => {
    const nextText = text ?? await readClipboard();
    setOriginalExplainText(nextText);
    setActiveView('explain');

    if (nextText.trim()) {
      runExplain(nextText);
    }
  }, [runExplain]);

  const handleCopyResult = useCallback(async () => {
    if (result) {
      await write(result);
    }
  }, [result, write]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (activeView === 'optimize' && result && window.getSelection()?.toString() === '') {
          e.preventDefault();
          void handleCopyResult();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeView, result, handleCopyResult]);

  useEffect(() => {
    let unlistenClipboard: (() => void) | undefined;
    let unlistenView: (() => void) | undefined;

    listenClipboardText((text) => {
      void openExplain(text);
    })
      .then((dispose) => {
        unlistenClipboard = dispose;
      })
      .catch((err) => {
        console.error('Failed to listen clipboard text:', err);
      });

    listenOpenView((view) => {
      if (view === 'settings') {
        openSettings();
      } else if (view === 'explain') {
        void openExplain();
      } else {
        openOptimize();
      }
    })
      .then((dispose) => {
        unlistenView = dispose;
      })
      .catch((err) => {
        console.error('Failed to listen app view:', err);
      });

    return () => {
      unlistenClipboard?.();
      unlistenView?.();
    };
  }, [openExplain, openOptimize, openSettings]);

  useEffect(() => {
    if (activeView !== 'optimize') return;

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
  }, [activeView]);

  const handleAlwaysOnTopToggle = useCallback(() => {
    const alwaysOnTop = !settings.alwaysOnTop;

    void setWindowAlwaysOnTop('main', alwaysOnTop);
    void updateSettings({ alwaysOnTop });
  }, [settings.alwaysOnTop, updateSettings]);


  const handleDragStateChange = useCallback((dragging: boolean) => {
    isDraggingRef.current = dragging;

    if (!dragging) {
      window.setTimeout(() => {
        if (!isDraggingRef.current && !document.hasFocus() && activeView !== 'settings') {
          void hideCurrentWindow();
        }
      }, 0);
    }
  }, [activeView]);

  const handleSettingsSave = useCallback(async () => {
    const nextBackend = toSettings(draftSettings);
    const ok = await setSettings(nextBackend);
    if (ok) {
      setDraftSettings(toAppSettings(nextBackend));
    }
  }, [draftSettings]);

  const handleSettingsReset = useCallback(() => {
    setDraftSettings(toAppSettings(settings));
  }, [settings]);

  const hasExplainText = !!originalExplainText.trim();
  const displayExplainResult: ExplainResult = explainResult ?? {
    original: originalExplainText || translate(settings.locale, 'explain.notDetected'),
    meaning: explainLoading
      ? translate(settings.locale, 'explain.loading')
      : (hasExplainText
          ? (explainError ?? translate(settings.locale, 'explain.noExplanation'))
          : translate(settings.locale, 'explain.noTextSelected')),
    context: '',
  };

  return (
    <I18nProvider locale={appearanceSettings.locale}>
      {activeView === 'settings' ? (
        <SettingsLayout
          settings={draftSettings}
          onChange={setDraftSettings}
          onSave={handleSettingsSave}
          onReset={handleSettingsReset}
          hasChanges={hasSettingsChanges}
          onBack={openOptimize}
        />
      ) : activeView === 'explain' ? (
        <ExplainLayout
          result={displayExplainResult}
          learningLanguageLabel={learningLanguageLabel}
          nativeLanguageLabel={nativeLanguageLabel}
          alwaysOnTop={settings.alwaysOnTop}
          onAlwaysOnTopToggle={handleAlwaysOnTopToggle}
          onPolishClick={openOptimize}
          onSettingsClick={openSettings}
        />
      ) : (
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
          onSettingsClick={openSettings}
          onExplainClick={() => void openExplain()}
          onSubmit={retry}
          onDragStateChange={handleDragStateChange}
        />
      )}
    </I18nProvider>
  );
}
