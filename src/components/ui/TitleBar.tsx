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
        "flex h-10 items-center justify-between select-none",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="flex flex-1 items-center gap-2 px-3"
        data-window-drag-handle={dragBehavior === 'manual' ? 'true' : undefined}
        data-tauri-drag-region={dragBehavior === 'native' ? true : undefined}
        onMouseDown={(e) => {
          if (dragBehavior === 'manual') {
            void handleDragStart(e);
          }
        }}
      >
        {title && (
          <span
            data-window-drag-handle={dragBehavior === 'manual' ? 'true' : undefined}
            data-tauri-drag-region={dragBehavior === 'native' ? true : undefined}
            className="text-xs font-medium text-foreground/70"
          >
            {title}
          </span>
        )}
        {children}
      </div>

      <div className="flex items-center">
        {showMinimize && (
          <button
            onClick={handleMinimize}
            className={cn(
              "flex h-10 w-10 items-center justify-center text-foreground/60 transition-all duration-200",
              "hover:bg-secondary hover:text-foreground",
              "focus-visible:outline-none focus-visible:bg-secondary",
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
              "flex h-10 w-10 items-center justify-center text-foreground/60 transition-all duration-200",
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
