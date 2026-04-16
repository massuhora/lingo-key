import { useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = "top",
  delay = 300,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  const show = () => {
    const t = window.setTimeout(() => setVisible(true), delay);
    setTimer(t);
  };

  const hide = () => {
    if (timer !== null) {
      window.clearTimeout(timer);
      setTimer(null);
    }
    setVisible(false);
  };

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-border",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-border",
    left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-border",
    right:
      "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-border",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          className={cn(
            "absolute z-50 px-2.5 py-1.5 rounded-md border border-border bg-secondary text-xs text-foreground shadow-lg whitespace-nowrap pointer-events-none",
            "animate-fade-in transition-opacity duration-150",
            sideClasses[side],
            className,
          )}
        >
          {content}
          <span
            className={cn(
              "absolute w-0 h-0 border-4",
              arrowClasses[side],
            )}
          />
        </div>
      )}
    </div>
  );
}
