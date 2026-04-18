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
          "group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border/55 bg-primary/58 px-4 py-3 transition-all duration-200 hover:border-border-strong/65 hover:bg-primary/70",
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
      </label>
    );
  },
);

Toggle.displayName = "Toggle";
