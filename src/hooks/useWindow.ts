import { useEffect, useCallback } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
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
    const currentWindow = getCurrentWindow();
    let suppressBlur = false;
    let suppressBlurTimeout: number | undefined;
    let hideTimeout: number | undefined;
    let interactionTimeout: number | undefined;
    let nativeInteractionActive = false;
    let removeNativeListeners: Array<() => void> = [];

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

    const clearHideTimeout = () => {
      if (hideTimeout) {
        window.clearTimeout(hideTimeout);
        hideTimeout = undefined;
      }
    };

    const clearInteractionTimeout = () => {
      if (interactionTimeout) {
        window.clearTimeout(interactionTimeout);
        interactionTimeout = undefined;
      }
    };

    const maybeHideWindow = async () => {
      if (!hideOnBlur) return;
      if (nativeInteractionActive || suppressBlur) return;
      if (shouldHideOnBlur && !shouldHideOnBlur()) return;

      if (type === 'main' || type === 'explain') {
        try {
          const focused = await currentWindow.isFocused();
          if (!focused) {
            await hideCurrentWindow();
          }
        } catch {
          if (!document.hasFocus()) {
            void hideCurrentWindow();
          }
        }
      }
    };

    const scheduleNativeHideCheck = (timeoutMs: number) => {
      clearHideTimeout();
      hideTimeout = window.setTimeout(() => {
        void maybeHideWindow();
      }, timeoutMs);
    };

    const markNativeInteraction = () => {
      nativeInteractionActive = true;
      clearHideTimeout();
      clearInteractionTimeout();
      interactionTimeout = window.setTimeout(() => {
        nativeInteractionActive = false;
        void maybeHideWindow();
      }, 180);
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
      scheduleNativeHideCheck(120);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', guardedBlur);
    window.addEventListener('mousedown', handleMouseDown, true);

    Promise.all([
      currentWindow.onFocusChanged(({ payload: focused }) => {
        if (focused) {
          nativeInteractionActive = false;
          clearHideTimeout();
          clearInteractionTimeout();
          return;
        }

        scheduleNativeHideCheck(120);
      }),
      currentWindow.onResized(() => {
        markNativeInteraction();
      }),
      currentWindow.onMoved(() => {
        markNativeInteraction();
      }),
    ])
      .then((listeners) => {
        removeNativeListeners = listeners;
      })
      .catch(() => {
        // Tauri window events are unavailable in browser preview.
      });

    return () => {
      clearHideTimeout();
      clearInteractionTimeout();
      removeNativeListeners.forEach((unlisten) => unlisten());
      if (suppressBlurTimeout) {
        window.clearTimeout(suppressBlurTimeout);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', guardedBlur);
      window.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, [handleKeyDown, handleBlur]);
}
