import { useEffect } from 'react';
import type { Settings } from '../types';
import { setCurrentWindowOpacity } from '../lib/tauri';

export function useAppearance(settings: Pick<Settings, 'theme' | 'opacity'> | null | undefined): void {
  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(settings.theme);
  }, [settings?.theme, settings?.opacity]);

  useEffect(() => {
    if (!settings) return;

    let cancelled = false;

    void setCurrentWindowOpacity(settings.opacity).then((appliedNatively) => {
      if (cancelled) return;
      document.body.style.opacity = appliedNatively ? '1' : String(settings.opacity);
    });

    return () => {
      cancelled = true;
    };
  }, [settings?.opacity]);
}
