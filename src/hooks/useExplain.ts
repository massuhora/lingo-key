import { useState, useEffect, useRef, useCallback } from 'react';
import type { ExplainResult } from '../types';
import { explainText } from '../lib/tauri';

function mockExplain(text: string): ExplainResult {
  const trimmed = text.trim();
  return {
    original: trimmed,
    meaning: `一个常见的编程相关表达，意为 "${trimmed}"。`,
    context: 'Typically used in code reviews, documentation, or technical discussions.',
  };
}

export interface UseExplainReturn {
  result: ExplainResult | null;
  loading: boolean;
  error: string | null;
  run: (text: string) => void;
}

export function useExplain(): UseExplainReturn {
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(false);

  const run = useCallback(async (text: string) => {
    if (!text.trim()) {
      if (isMounted.current) {
        setResult(null);
        setError('未提供文本');
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
      const fallback = mockExplain(text);
      if (isMounted.current) {
        setResult(fallback);
        setError(msg);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

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
