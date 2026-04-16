import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  valueDisplay?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, min = 0, max = 1, step = 0.05, value, valueDisplay, ...props }, ref) => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;

    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {label && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground/90">{label}</span>
            <span className="text-xs font-medium text-foreground/60 tabular-nums">
              {valueDisplay ?? `${Math.round(numericValue * 100)}%`}
            </span>
          </div>
        )}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted",
            "accent-accent",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          style={{
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((numericValue - min) / (max - min)) * 100}%, var(--muted) ${((numericValue - min) / (max - min)) * 100}%, var(--muted) 100%)`,
          }}
          {...props}
        />
      </div>
    );
  },
);

Slider.displayName = "Slider";
