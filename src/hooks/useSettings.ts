import { useState, useEffect, useCallback, useRef } from 'react';
import type { Settings } from '../types';
import {
  getSettings,
  listenSettingsChanged,
  setSettings as saveSettings,
} from '../lib/tauri';
import { DEFAULT_SETTINGS, mergeSettings } from '../lib/settings';

export interface UseSettingsReturn {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setLocalSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    let unlisten: (() => void) | undefined;

    getSettings()
      .then((fetched) => {
        if (!isMounted.current) return;
        if (fetched) {
          setLocalSettings(mergeSettings(fetched));
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted.current) return;
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });

    listenSettingsChanged((next) => {
      if (!isMounted.current) return;
      setLocalSettings(mergeSettings(next));
      setError(null);
    })
      .then((dispose) => {
        unlisten = dispose;
      })
      .catch((err) => {
        if (!isMounted.current) return;
        setError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      isMounted.current = false;
      unlisten?.();
    };
  }, []);

  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    const next = mergeSettings({ ...settings, ...updates });
    setLocalSettings(next);
    const ok = await saveSettings(next);
    if (!ok) {
      setError('Failed to save settings');
    } else {
      setError(null);
    }
  }, [settings]);

  return {
    settings,
    updateSettings,
    loading,
    error,
  };
}
