import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

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
          <label
            htmlFor={inputId}
            className="eyebrow-label"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "flex h-12 w-full rounded-[18px] border border-border/70 bg-surface-soft/92 px-4 py-3 text-sm text-foreground shadow-[inset_0_1px_0_rgb(var(--foreground)/0.04)] transition-all duration-200 placeholder:text-foreground/36",
            "hover:border-border-strong/75 hover:bg-surface-soft",
            "focus-visible:border-accent focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/22",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive/25",
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-destructive animate-fade-in">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
