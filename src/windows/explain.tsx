import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import { ExplainLayout } from '../components/windows/ExplainLayout';
import { useExplain } from '../hooks/useExplain';
import { useSettings } from '../hooks/useSettings';
import { useClipboard } from '../hooks/useClipboard';
import { useWindow } from '../hooks/useWindow';
import { useAppearance } from '../hooks/useAppearance';
import { listenClipboardText, readClipboard } from '../lib/tauri';
import { getLanguageLabel, I18nProvider, translate } from '../lib/i18n';
import type { ExplainResult } from '../types';

function ExplainWindow() {
  const { settings } = useSettings();
  const { result, loading, error, run } = useExplain(
    settings.sourceLanguage,
    settings.targetLanguage,
    settings.locale,
  );
  const { text: clipboardText, read } = useClipboard();
  const [originalText, setOriginalText] = useState('');
  const targetLanguageLabel = getLanguageLabel(settings.locale, settings.targetLanguage);
  const languagePairLabel = `${getLanguageLabel(settings.locale, settings.sourceLanguage)} -> ${targetLanguageLabel}`;

  useWindow({
    type: 'explain',
    hideOnBlur: true,
  });

  useAppearance(settings);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const init = async () => {
      const text = await readClipboard();
      if (text.trim()) {
        setOriginalText(text);
        run(text);
      } else {
        const pluginText = await read();
        if (pluginText.trim()) {
          setOriginalText(pluginText);
          run(pluginText);
        } else {
          setOriginalText('');
        }
      }

      try {
        unlisten = await listenClipboardText((text) => {
          setOriginalText(text);
          run(text);
        });
      } catch (e) {
        console.error('Failed to listen clipboard text:', e);
      }
    };

    void init();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [run, read]);

  // Fallback: re-read clipboard when window regains focus (handles missed events).
  useEffect(() => {
    const handleFocus = async () => {
      const text = await readClipboard();
      if (text.trim() && text !== originalText) {
        setOriginalText(text);
        run(text);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [originalText, run]);

  const hasText = !!(originalText || clipboardText).trim();

  const displayResult: ExplainResult = result ?? {
    original: originalText || clipboardText || translate(settings.locale, 'explain.notDetected'),
    meaning: loading
      ? translate(settings.locale, 'explain.loading')
      : (hasText
          ? (error ?? translate(settings.locale, 'explain.noExplanation'))
          : translate(settings.locale, 'explain.noTextSelected')),
    context: '',
  };

  return (
    <I18nProvider locale={settings.locale}>
      <ExplainLayout
        result={displayResult}
        languagePairLabel={languagePairLabel}
        targetLanguageLabel={targetLanguageLabel}
      />
    </I18nProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ExplainWindow />
  </React.StrictMode>,
);
