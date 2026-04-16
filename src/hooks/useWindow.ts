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

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-tauri-drag-region]')) {
        suppressBlur = true;
        window.setTimeout(() => {
          suppressBlur = false;
        }, 100);
      }
    };

    const guardedBlur = () => {
      if (suppressBlur) return;
      handleBlur();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', guardedBlur);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', guardedBlur);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleKeyDown, handleBlur]);
}
