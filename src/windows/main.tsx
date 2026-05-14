import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { MainLayout } from '../components/windows/MainLayout';
import { ExplainLayout } from '../components/windows/ExplainLayout';
import { SettingsLayout } from '../components/windows/SettingsLayout';
import { HistoryLayout } from '../components/windows/HistoryLayout';
import { useOptimize } from '../hooks/useOptimize';
import { useSettings } from '../hooks/useSettings';
import { useClipboard } from '../hooks/useClipboard';
import { useExplain } from '../hooks/useExplain';
import { useWindow } from '../hooks/useWindow';
import { useAppearance } from '../hooks/useAppearance';
import { useHistory } from '../hooks/useHistory';
import {
  getHotkeyRegistrationError,
  hideCurrentWindow,
  listenClipboardText,
  listenHotkeyRegistrationError,
  listenOpenView,
  readClipboard,
  setSettings,
  setWindowAlwaysOnTop,
} from '../lib/tauri';
import { getLanguageLabel, I18nProvider, translate } from '../lib/i18n';
import { toAppSettings, toSettings } from '../lib/settings';
import { getFavoriteReuseHints } from '../lib/history';
import type { AppSettings, ExplainResult, HistoryItem } from '../types';

type ActiveView = 'optimize' | 'explain' | 'settings' | 'history';

export default function MainWindow() {
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const [activeView, setActiveView] = useState<ActiveView>('optimize');
  const [input, setInput] = useState('');
  const {
    items: historyItems,
    loading: historyLoading,
    addItem: addHistoryItem,
    toggleFavorite: toggleHistoryFavorite,
    removeItem: removeHistoryItem,
  } = useHistory();
  const favoriteReuseHints = useMemo(
    () => getFavoriteReuseHints(historyItems, input),
    [historyItems, input],
  );
  const { result, loading, error, retry } = useOptimize(
    input,
    settings.outputMode,
    settings.nativeLanguage,
    settings.learningLanguage,
    favoriteReuseHints,
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
  const [settingsSaveError, setSettingsSaveError] = useState<string | null>(null);
  const isDraggingRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastSavedOptimizeRef = useRef('');
  const lastSavedExplainRef = useRef('');
  const saveNextOptimizeResultRef = useRef(false);
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
      setSettingsSaveError(null);
    }
  }, [activeView, persistedAppSettings]);

  useEffect(() => {
    let unlistenHotkeyError: (() => void) | undefined;

    getHotkeyRegistrationError()
      .then((message) => {
        if (message) {
          setSettingsSaveError(message);
        }
      })
      .catch((err) => {
        console.error('Failed to load hotkey registration error:', err);
      });

    listenHotkeyRegistrationError((message) => {
      setSettingsSaveError(message);
    })
      .then((dispose) => {
        unlistenHotkeyError = dispose;
      })
      .catch((err) => {
        console.error('Failed to listen hotkey registration errors:', err);
      });

    return () => {
      unlistenHotkeyError?.();
    };
  }, []);

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

  const openHistory = useCallback(() => {
    setActiveView('history');
  }, []);

  const openExplain = useCallback(async (text?: string) => {
    const nextText = text ?? await readClipboard();
    setOriginalExplainText(nextText);
    setActiveView('explain');

    if (nextText.trim()) {
      runExplain(nextText);
    }
  }, [runExplain]);

  const handleUseHistoryItem = useCallback((item: HistoryItem) => {
    if (item.kind === 'optimize') {
      setInput(item.input);
      setActiveView('optimize');
      return;
    }

    void openExplain(item.input);
  }, [openExplain]);

  const saveOptimizeToHistory = useCallback(() => {
    const trimmedInput = input.trim();
    const trimmedResult = result.trim();
    const signature = `${trimmedInput}\n---\n${trimmedResult}`;

    if (!trimmedInput || !trimmedResult || signature === lastSavedOptimizeRef.current) {
      return;
    }

    lastSavedOptimizeRef.current = signature;
    addHistoryItem({
      kind: 'optimize',
      input: trimmedInput,
      output: trimmedResult,
      context: favoriteReuseHints.length > 0
        ? `Favorites: ${favoriteReuseHints.map((hint) => hint.expression).join(', ')}`
        : undefined,
    });
  }, [addHistoryItem, favoriteReuseHints, input, result]);

  const handleCopyResult = useCallback(async () => {
    if (result) {
      await write(result);
      saveOptimizeToHistory();
    }
  }, [result, saveOptimizeToHistory, write]);

  const handlePolishClick = useCallback(() => {
    if (result.trim()) {
      saveOptimizeToHistory();
      retry();
      return;
    }

    saveNextOptimizeResultRef.current = true;
    retry();
  }, [result, retry, saveOptimizeToHistory]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (activeView === 'optimize' && result && !window.getSelection()?.toString()) {
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

  useEffect(() => {
    if (!loading && saveNextOptimizeResultRef.current) {
      saveNextOptimizeResultRef.current = false;
      saveOptimizeToHistory();
    }
  }, [loading, saveOptimizeToHistory]);

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
    try {
      const saved = await setSettings(nextBackend);
      setDraftSettings(toAppSettings(saved));
      setSettingsSaveError(null);
    } catch (err) {
      setSettingsSaveError(err instanceof Error ? err.message : String(err));
    }
  }, [draftSettings]);

  const handleDraftSettingsChange = useCallback((next: AppSettings) => {
    setDraftSettings(next);
    setSettingsSaveError(null);
  }, []);

  const handleSettingsReset = useCallback(() => {
    setDraftSettings(toAppSettings(settings));
    setSettingsSaveError(null);
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

  const saveExplainToHistory = useCallback(() => {
    const original = displayExplainResult.original.trim();
    const meaning = displayExplainResult.meaning.trim();
    const context = displayExplainResult.context.trim();
    const signature = `${original}\n---\n${meaning}`;

    if (!hasExplainText || explainLoading || !original || !meaning || signature === lastSavedExplainRef.current) {
      return;
    }

    lastSavedExplainRef.current = signature;
    addHistoryItem({
      kind: 'explain',
      input: original,
      output: meaning,
      context: context || undefined,
    });
  }, [
    addHistoryItem,
    displayExplainResult.context,
    displayExplainResult.meaning,
    displayExplainResult.original,
    explainLoading,
    hasExplainText,
  ]);

  const currentExplainHistoryItem = useMemo(() => {
    const original = displayExplainResult.original.trim();
    const meaning = displayExplainResult.meaning.trim();

    if (!hasExplainText || explainLoading || !original || !meaning) {
      return undefined;
    }

    return historyItems.find(
      (item) =>
        item.kind === 'explain' &&
        item.input === original &&
        item.output === meaning,
    );
  }, [
    displayExplainResult.meaning,
    displayExplainResult.original,
    explainLoading,
    hasExplainText,
    historyItems,
  ]);

  const handleExplainFavoriteToggle = useCallback(() => {
    const original = displayExplainResult.original.trim();
    const meaning = displayExplainResult.meaning.trim();
    const context = displayExplainResult.context.trim();
    const signature = `${original}\n---\n${meaning}`;

    if (!hasExplainText || explainLoading || !original || !meaning) {
      return;
    }

    if (currentExplainHistoryItem) {
      toggleHistoryFavorite(currentExplainHistoryItem.id);
      return;
    }

    lastSavedExplainRef.current = signature;
    addHistoryItem({
      kind: 'explain',
      input: original,
      output: meaning,
      context: context || undefined,
      favorite: true,
    });
  }, [
    addHistoryItem,
    currentExplainHistoryItem,
    displayExplainResult.context,
    displayExplainResult.meaning,
    displayExplainResult.original,
    explainLoading,
    hasExplainText,
    toggleHistoryFavorite,
  ]);

  const canFavoriteExplain = hasExplainText &&
    !explainLoading &&
    !!displayExplainResult.original.trim() &&
    !!displayExplainResult.meaning.trim();

  return (
    <I18nProvider locale={appearanceSettings.locale}>
      {activeView === 'settings' ? (
        <SettingsLayout
          settings={draftSettings}
          onChange={handleDraftSettingsChange}
          onSave={handleSettingsSave}
          onReset={handleSettingsReset}
          hasChanges={hasSettingsChanges}
          saveError={settingsSaveError}
          onBack={openOptimize}
        />
      ) : activeView === 'history' ? (
        <HistoryLayout
          items={historyItems}
          loading={historyLoading}
          alwaysOnTop={settings.alwaysOnTop}
          onAlwaysOnTopToggle={handleAlwaysOnTopToggle}
          onBack={openOptimize}
          onSettingsClick={openSettings}
          onUseItem={handleUseHistoryItem}
          onToggleFavorite={toggleHistoryFavorite}
          onRemoveItem={removeHistoryItem}
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
          onResultCopied={saveExplainToHistory}
          isFavorite={currentExplainHistoryItem?.favorite ?? false}
          favoriteDisabled={!canFavoriteExplain}
          onFavoriteToggle={handleExplainFavoriteToggle}
        />
      ) : (
        <MainLayout
          inputRef={inputRef}
          inputValue={input}
          onInputChange={setInput}
          originalText={input}
          resultText={result}
          favoriteReuseHints={favoriteReuseHints}
          learningLanguageLabel={learningLanguageLabel}
          isLoading={loading || settingsLoading}
          error={error}
          alwaysOnTop={settings.alwaysOnTop}
          onAlwaysOnTopToggle={handleAlwaysOnTopToggle}
          onSettingsClick={openSettings}
          onExplainClick={() => void openExplain()}
          onHistoryClick={openHistory}
          onSubmit={handlePolishClick}
          onShortcutSubmit={retry}
          onResultCopied={saveOptimizeToHistory}
          onDragStateChange={handleDragStateChange}
        />
      )}
    </I18nProvider>
  );
}
