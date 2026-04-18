import { useEffect, useCallback } from 'react';
import { closeCurrentWindow, hideCurrentWindow } from '../lib/tauri';

type WindowType = 'main' | 'explain' | 'settings';

export interface UseWindowOptions {
  type: WindowType;
  hideOnBlur?: boolean;
  shouldHideOnBlur?: () => boolean;
}

export function useWindow(options: UseWindowOptions): void {
  const { type, hideOnBlur = true, shouldHideOnBlur } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeCurrentWindow();
      }
    },
    [],
  );

  const handleBlur = useCallback(() => {
    if (!hideOnBlur) return;
    if (shouldHideOnBlur && !shouldHideOnBlur()) return;
    if (type === 'main' || type === 'explain') {
      hideCurrentWindow();
    }
  }, [type, hideOnBlur, shouldHideOnBlur]);

  useEffect(() => {
    let suppressBlur = false;
    let suppressBlurTimeout: number | undefined;

    const scheduleSuppressBlurReset = (timeoutMs: number) => {
      suppressBlur = true;

      if (suppressBlurTimeout) {
        window.clearTimeout(suppressBlurTimeout);
      }

      suppressBlurTimeout = window.setTimeout(() => {
        suppressBlur = false;
        suppressBlurTimeout = undefined;
      }, timeoutMs);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-window-resize-handle]')) {
        scheduleSuppressBlurReset(2000);
        return;
      }

      if (
        target?.closest('[data-tauri-drag-region]')
        || target?.closest('[data-window-drag-handle]')
      ) {
        scheduleSuppressBlurReset(1000);
      }
    };

    const guardedBlur = () => {
      if (suppressBlur) return;
      handleBlur();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', guardedBlur);
    window.addEventListener('mousedown', handleMouseDown, true);

    return () => {
      if (suppressBlurTimeout) {
        window.clearTimeout(suppressBlurTimeout);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', guardedBlur);
      window.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, [handleKeyDown, handleBlur]);
}
