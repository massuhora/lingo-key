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
    const progress = ((numericValue - min) / (max - min)) * 100;

    return (
      <div
        className={cn(
          "group flex flex-col gap-3 rounded-[24px] border border-border/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-3.5 transition-all duration-200",
          "hover:border-border-strong/60 hover:bg-surface-elevated/60",
          "focus-within:border-accent/60 focus-within:bg-surface-elevated/74 focus-within:shadow-[0_0_0_1px_rgb(var(--accent)/0.18),0_20px_36px_-30px_rgb(var(--accent)/0.65)]",
          className,
        )}
      >
        {label && (
          <div className="flex items-center justify-between">
            <span className="eyebrow-label">{label}</span>
            <span className="rounded-full border border-border/55 bg-primary/70 px-2.5 py-1 font-mono text-[11px] font-medium text-foreground/60 tabular-nums">
              {valueDisplay ?? `${Math.round(numericValue * 100)}%`}
            </span>
          </div>
        )}
        <div className="rounded-[20px] border border-border/60 bg-surface-soft/88 px-3 py-4 shadow-[inset_0_1px_0_rgb(var(--foreground)/0.04)]">
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            className={cn(
              "h-2.5 w-full cursor-pointer appearance-none rounded-full border border-border/45 bg-muted/85",
              "accent-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
            style={{
              background: `linear-gradient(to right, rgb(var(--accent)) 0%, rgb(var(--accent)) ${progress}%, rgb(var(--muted)) ${progress}%, rgb(var(--muted)) 100%)`,
            }}
            {...props}
          />
          <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/40">
            <span>{Math.round(min * 100)}%</span>
            <span>{Math.round(max * 100)}%</span>
          </div>
        </div>
      </div>
    );
  },
);

Slider.displayName = "Slider";
