import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, description, checked, onChange, ...props }, ref) => {
    return (
      <label
        className={cn(
          "group flex cursor-pointer items-center justify-between gap-4 rounded-[24px] border border-border/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-4 py-3.5 transition-all duration-200",
          "hover:border-border-strong/65 hover:bg-surface-elevated/64",
          "focus-within:border-accent/60 focus-within:bg-surface-elevated/74 focus-within:shadow-[0_0_0_1px_rgb(var(--accent)/0.18),0_20px_36px_-30px_rgb(var(--accent)/0.65)]",
          className,
        )}
      >
        <div className="flex flex-col gap-0.5">
          {label && (
            <span className="text-sm font-medium text-foreground transition-colors group-hover:text-foreground/92">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs leading-5 text-foreground/56">{description}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] transition-colors duration-200",
              checked
                ? "border-accent/45 bg-accent/12 text-accent"
                : "border-border/55 bg-primary/65 text-foreground/42",
            )}
          >
            {checked ? "ON" : "OFF"}
          </span>
          <div className="relative inline-flex h-7 w-12 shrink-0">
            <input
              ref={ref}
              type="checkbox"
              className="peer sr-only"
              checked={checked}
              onChange={onChange}
              {...props}
            />
            <span
              className={cn(
                "absolute inset-0 rounded-full border border-border bg-muted transition-all duration-200 ease-out",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
                "peer-checked:border-accent peer-checked:bg-accent",
                "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              )}
            />
            <span
              className={cn(
                "absolute left-1 top-1 h-[18px] w-[18px] rounded-full bg-foreground shadow-sm transition-all duration-200 ease-out",
                "peer-checked:translate-x-5 peer-checked:bg-on-primary",
                "peer-disabled:opacity-50",
              )}
            />
          </div>
        </div>
      </label>
    );
  },
);

Toggle.displayName = "Toggle";
