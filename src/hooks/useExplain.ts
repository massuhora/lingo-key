import { useState, useEffect, useRef, useCallback } from 'react';
import type { ExplainResult } from '../types';
import { explainText } from '../lib/tauri';

const FALLBACK_MEANING: Record<string, (text: string) => string> = {
  chinese: (text) => `暂时无法生成释义，原文是“${text}”。`,
  english: (text) => `A fallback explanation is unavailable right now. Original text: "${text}".`,
  japanese: (text) => `現在は説明を生成できません。原文: 「${text}」`,
  korean: (text) => `지금은 설명을 생성할 수 없습니다. 원문: "${text}".`,
  spanish: (text) => `No se puede generar una explicacion en este momento. Texto original: "${text}".`,
  french: (text) => `Impossible de generer une explication pour le moment. Texte original : "${text}".`,
  german: (text) => `Derzeit kann keine Erklaerung erzeugt werden. Originaltext: "${text}".`,
};

const FALLBACK_CONTEXT: Record<string, string> = {
  chinese: '通常用于代码评审、技术文档或开发讨论。',
  english: 'Typically used in code reviews, documentation, or technical discussions.',
  japanese: '主にコードレビュー、ドキュメント、技術的な議論で使われます。',
  korean: '주로 코드 리뷰, 문서, 기술 논의에서 사용됩니다.',
  spanish: 'Suele usarse en revisiones de codigo, documentacion o conversaciones tecnicas.',
  french: 'Utilise le plus souvent dans les revues de code, la documentation ou les discussions techniques.',
  german: 'Wird meist in Code-Reviews, Dokumentation oder technischen Diskussionen verwendet.',
};

function mockExplain(text: string, targetLanguage: string): ExplainResult {
  const trimmed = text.trim();
  return {
    original: trimmed,
    meaning: (FALLBACK_MEANING[targetLanguage] ?? FALLBACK_MEANING.english)(trimmed),
    context: FALLBACK_CONTEXT[targetLanguage] ?? FALLBACK_CONTEXT.english,
  };
}

export interface UseExplainReturn {
  result: ExplainResult | null;
  loading: boolean;
  error: string | null;
  run: (text: string) => void;
}

export function useExplain(sourceLanguage: string, targetLanguage: string): UseExplainReturn {
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
      const fallback = mockExplain(text, targetLanguage);
      if (isMounted.current) {
        setResult(fallback);
        setError(msg);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [sourceLanguage, targetLanguage]);

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
