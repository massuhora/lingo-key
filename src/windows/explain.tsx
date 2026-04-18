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
import { LANGUAGE_LABELS } from '../lib/settings';
import type { ExplainResult } from '../types';

const EMPTY_RESULT: ExplainResult = {
  original: '',
  meaning: '正在加载解释...',
  context: '',
};

function ExplainWindow() {
  const { settings } = useSettings();
  const { result, loading, error, run } = useExplain(
    settings.sourceLanguage,
    settings.targetLanguage,
  );
  const { text: clipboardText, read } = useClipboard();
  const [originalText, setOriginalText] = useState('');
  const targetLanguageLabel = LANGUAGE_LABELS[settings.targetLanguage];
  const languagePairLabel = `${LANGUAGE_LABELS[settings.sourceLanguage]} -> ${targetLanguageLabel}`;

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
    ...EMPTY_RESULT,
    original: originalText || clipboardText || '未检测到选中文本',
    meaning: loading
      ? '正在加载解释...'
      : (hasText
          ? (error ?? '暂无解释。')
          : '请先用鼠标划选一段文字，再按解释热键。如果已划选但仍失败，请尝试手动按 Ctrl+C 复制后再按热键。'),
  };

  return (
    <ExplainLayout
      result={displayResult}
      languagePairLabel={languagePairLabel}
      targetLanguageLabel={targetLanguageLabel}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ExplainWindow />
  </React.StrictMode>,
);
