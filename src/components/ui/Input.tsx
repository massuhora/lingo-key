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
      <div className="flex flex-col gap-1.5">
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
            "flex h-11 w-full rounded-xl border border-border/70 bg-primary/76 px-3.5 py-2.5 text-sm text-foreground shadow-[inset_0_1px_0_rgb(var(--foreground)/0.04)] transition-all duration-200 placeholder:text-foreground/38",
            "hover:border-border-strong/70 hover:bg-primary/84",
            "focus-visible:border-accent focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive/25",
            className,
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
