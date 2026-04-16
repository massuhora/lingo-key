import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import { SettingsLayout } from '../components/windows/SettingsLayout';
import { useWindow } from '../hooks/useWindow';
import { getSettings, setSettings } from '../lib/tauri';
import { DEFAULT_SETTINGS, toAppSettings, toSettings, mergeSettings } from '../lib/settings';
import type { AppSettings, Settings } from '../types';

function SettingsWindow() {
  const [backendSettings, setBackendSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [uiSettings, setUiSettings] = useState<AppSettings>(toAppSettings(DEFAULT_SETTINGS));
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useWindow({ type: 'settings', hideOnBlur: false });

  useEffect(() => {
    getSettings()
      .then((fetched) => {
        const settings = mergeSettings(fetched ?? {});
        setBackendSettings(settings);
        setUiSettings(toAppSettings(settings));
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
  }, []);

  const hasChanges = useMemo(() => {
    return JSON.stringify(uiSettings) !== JSON.stringify(toAppSettings(backendSettings));
  }, [uiSettings, backendSettings]);

  const handleChange = useCallback((next: AppSettings) => {
    setUiSettings(next);
  }, []);

  const handleSave = useCallback(async () => {
    const nextBackend = toSettings(uiSettings);
    const ok = await setSettings(nextBackend);
    if (ok) {
      setBackendSettings(nextBackend);
    } else {
      setError('保存设置失败');
    }
  }, [uiSettings]);

  const handleReset = useCallback(() => {
    setUiSettings(toAppSettings(backendSettings));
    setError(null);
  }, [backendSettings]);

  return (
    <SettingsLayout
      settings={uiSettings}
      onChange={handleChange}
      onSave={handleSave}
      onReset={handleReset}
      hasChanges={hasChanges}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SettingsWindow />
  </React.StrictMode>,
);
