import { useState, useEffect, useRef, useCallback } from 'react';
import type { OutputMode } from '../types';
import { optimizeText } from '../lib/tauri';

const DEBOUNCE_MS = 600;

function mockOptimize(text: string, _mode: OutputMode): string {
  if (!text.trim()) return '';
  let result = text.trim();
  result = result.charAt(0).toUpperCase() + result.slice(1);
  if (!/[.!?]$/.test(result)) {
    result += '.';
  }
  return result;
}

export interface UseOptimizeReturn {
  result: string;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useOptimize(
  input: string,
  mode: OutputMode,
  nativeLanguage: string,
  learningLanguage: string,
): UseOptimizeReturn {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(false);

  const performOptimize = useCallback(async (text: string) => {
    if (!text.trim()) {
      setResult('');
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const optimized = await optimizeText(text, mode);
      if (isMounted.current) {
        setResult(optimized);
        setError(null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const fallback = mockOptimize(text, mode);
      if (isMounted.current) {
        setResult(fallback);
        setError(msg);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [mode]);

  useEffect(() => {
    isMounted.current = true;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      performOptimize(input);
    }, DEBOUNCE_MS);

    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [input, mode, nativeLanguage, learningLanguage, retryToken, performOptimize]);

  const retry = useCallback(() => {
    setRetryToken((t) => t + 1);
  }, []);

  return {
    result,
    loading,
    error,
    retry,
  };
}
