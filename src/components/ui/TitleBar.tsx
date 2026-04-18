import { useState, useEffect } from "react";
import { X, Minus } from "lucide-react";
import { cn } from "../../lib/utils";

interface TitleBarProps {
  title?: string;
  showMinimize?: boolean;
  showClose?: boolean;
  className?: string;
  children?: React.ReactNode;
  dragBehavior?: 'native' | 'manual';
  onDragStateChange?: (dragging: boolean) => void;
}

export function TitleBar({
  title,
  showMinimize = true,
  showClose = true,
  className,
  children,
  dragBehavior = 'native',
  onDragStateChange,
}: TitleBarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [windowApi, setWindowApi] = useState<{
    minimize: () => Promise<void>;
    close: () => Promise<void>;
    startDragging: () => Promise<void>;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    import("@tauri-apps/api/webviewWindow")
      .then(({ getCurrentWebviewWindow }) => {
        if (!mounted) return;
        const win = getCurrentWebviewWindow();
        setWindowApi({
          minimize: () => win.minimize(),
          close: () => win.close(),
          startDragging: () => win.startDragging(),
        });
      })
      .catch(() => {
        // Tauri not available (e.g. browser dev)
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleMinimize = async () => {
    await windowApi?.minimize();
  };

  const handleClose = async () => {
    await windowApi?.close();
  };

  const handleDragStart = async (event: React.MouseEvent<HTMLDivElement>) => {
    if (dragBehavior !== 'manual') return;
    if (event.button !== 0) return;
    if ((event.target as HTMLElement | null)?.closest("button")) return;

    event.preventDefault();
    onDragStateChange?.(true);

    try {
      await windowApi?.startDragging();
    } finally {
      onDragStateChange?.(false);
    }
  };

  return (
    <div
      className={cn(
        "flex h-12 items-center justify-between border-b border-border/55 bg-surface-soft/72 select-none backdrop-blur-xl",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="flex flex-1 items-center gap-3 px-4"
        data-window-drag-handle={dragBehavior === 'manual' ? 'true' : undefined}
        data-tauri-drag-region={dragBehavior === 'native' ? true : undefined}
        onMouseDown={(e) => {
          if (dragBehavior === 'manual') {
            void handleDragStart(e);
          }
        }}
      >
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent shadow-[0_0_0_4px_rgb(var(--accent)/0.14)]"
        />
        {title && (
          <span
            data-window-drag-handle={dragBehavior === 'manual' ? 'true' : undefined}
            data-tauri-drag-region={dragBehavior === 'native' ? true : undefined}
            className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/72"
          >
            {title}
          </span>
        )}
        {children}
      </div>

      <div className="flex items-center pr-2">
        {showMinimize && (
          <button
            onClick={handleMinimize}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl text-foreground/58 transition-all duration-200",
              "hover:bg-primary/90 hover:text-foreground",
              "focus-visible:outline-none focus-visible:bg-primary/90",
              !isHovered && "opacity-60",
            )}
            aria-label="最小化"
          >
            <Minus className="h-4 w-4" />
          </button>
        )}
        {showClose && (
          <button
            onClick={handleClose}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl text-foreground/58 transition-all duration-200",
              "hover:bg-destructive hover:text-on-primary",
              "focus-visible:outline-none focus-visible:bg-destructive focus-visible:text-on-primary",
              !isHovered && "opacity-60",
            )}
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
