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
            className="text-sm font-medium text-foreground/90"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-lg border border-border bg-primary px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 transition-colors duration-200",
            "hover:border-foreground/30 hover:bg-primary/80",
            "focus-visible:border-accent focus-visible:bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
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
