import { useState, useEffect, useRef, useCallback } from 'react';
import { translate } from '../lib/i18n';
import type { ExplainResult } from '../types';
import { explainText } from '../lib/tauri';

function mockExplain(text: string, locale: 'zh-CN' | 'en-US'): ExplainResult {
  const trimmed = text.trim();
  return {
    original: trimmed,
    meaning: translate(locale, 'explain.fallbackMeaning', { text: trimmed }),
    context: translate(locale, 'explain.fallbackContext'),
  };
}

export interface UseExplainReturn {
  result: ExplainResult | null;
  loading: boolean;
  error: string | null;
  run: (text: string) => void;
}

export function useExplain(
  sourceLanguage: string,
  targetLanguage: string,
  locale: 'zh-CN' | 'en-US',
): UseExplainReturn {
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(false);

  const run = useCallback(async (text: string) => {
    if (!text.trim()) {
      if (isMounted.current) {
        setResult(null);
        setError(translate(locale, 'common.noTextProvided'));
      }
      return;
    }

    if (isMounted.current) {
      setLoading(true);
      setError(null);
      setResult(null);
    }

    try {
      const data = await explainText(text);
      if (isMounted.current) {
        setResult(data);
        setError(null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const fallback = mockExplain(text, locale);
      if (isMounted.current) {
        setResult(fallback);
        setError(msg);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [sourceLanguage, targetLanguage, locale]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    result,
    loading,
    error,
    run,
  };
}
