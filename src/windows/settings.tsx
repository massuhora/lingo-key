import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import { SettingsLayout } from '../components/windows/SettingsLayout';
import { useWindow } from '../hooks/useWindow';
import { useAppearance } from '../hooks/useAppearance';
import { I18nProvider, translate } from '../lib/i18n';
import {
  getSettings,
  setSettings,
  setWindowAlwaysOnTop,
  setWindowOpacity,
} from '../lib/tauri';
import { DEFAULT_SETTINGS, toAppSettings, toSettings, mergeSettings } from '../lib/settings';
import type { AppSettings, Settings } from '../types';

function SettingsWindow() {
  const [backendSettings, setBackendSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [uiSettings, setUiSettings] = useState<AppSettings>(toAppSettings(DEFAULT_SETTINGS));
  const [loading, setLoading] = useState(true);
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

  useAppearance(uiSettings);

  useEffect(() => {
    if (loading) return;

    void Promise.all([
      setWindowOpacity('main', uiSettings.opacity),
      setWindowOpacity('explain', uiSettings.opacity),
    ]);
  }, [loading, uiSettings.opacity]);

  useEffect(() => {
    if (loading) return;

    void Promise.all([
      setWindowAlwaysOnTop('main', uiSettings.alwaysOnTop),
      setWindowAlwaysOnTop('explain', uiSettings.alwaysOnTop),
      setWindowAlwaysOnTop('settings', uiSettings.alwaysOnTop),
    ]);
  }, [loading, uiSettings.alwaysOnTop]);

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
      setError(translate(uiSettings.locale, 'settings.saveFailed'));
    }
  }, [uiSettings]);

  const handleReset = useCallback(() => {
    setUiSettings(toAppSettings(backendSettings));
    setError(null);
  }, [backendSettings]);

  return (
    <I18nProvider locale={uiSettings.locale}>
      <SettingsLayout
        settings={uiSettings}
        onChange={handleChange}
        onSave={handleSave}
        onReset={handleReset}
        hasChanges={hasChanges}
      />
    </I18nProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SettingsWindow />
  </React.StrictMode>,
);
