import { type MouseEvent, useMemo } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { cn } from "../../lib/utils";

interface WindowResizeHandlesProps {
  className?: string;
}

type ResizeDirection =
  | "East"
  | "North"
  | "NorthEast"
  | "NorthWest"
  | "South"
  | "SouthEast"
  | "SouthWest"
  | "West";

const resizeHandles: Array<{
  direction: ResizeDirection;
  className: string;
}> = [
  {
    direction: "North",
    className: "left-4 right-4 top-0 h-2 cursor-n-resize",
  },
  {
    direction: "South",
    className: "bottom-0 left-4 right-4 h-2 cursor-s-resize",
  },
  {
    direction: "West",
    className: "bottom-4 left-0 top-4 w-2 cursor-w-resize",
  },
  {
    direction: "East",
    className: "bottom-4 right-0 top-4 w-2 cursor-e-resize",
  },
  {
    direction: "NorthWest",
    className: "left-0 top-0 h-4 w-4 cursor-nw-resize",
  },
  {
    direction: "NorthEast",
    className: "right-0 top-0 h-4 w-4 cursor-ne-resize",
  },
  {
    direction: "SouthWest",
    className: "bottom-0 left-0 h-4 w-4 cursor-sw-resize",
  },
  {
    direction: "SouthEast",
    className: "bottom-0 right-0 h-4 w-4 cursor-se-resize",
  },
];

export function WindowResizeHandles({
  className,
}: WindowResizeHandlesProps) {
  const windowApi = useMemo(() => getCurrentWebviewWindow(), []);

  const handleResizeStart = (direction: ResizeDirection) => async (
    event: MouseEvent<HTMLDivElement>,
  ) => {
    if (event.button !== 0) return;

    event.preventDefault();

    try {
      await windowApi.startResizeDragging(direction);
    } catch {
      // Tauri may be unavailable in browser preview.
    }
  };

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 z-30", className)}
    >
      {resizeHandles.map(({ direction, className: handleClassName }) => (
        <div
          key={direction}
          data-window-resize-handle="true"
          className={cn("pointer-events-auto absolute", handleClassName)}
          onMouseDown={(event) => {
            void handleResizeStart(direction)(event);
          }}
        />
      ))}
    </div>
  );
}
