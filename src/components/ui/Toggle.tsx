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
          "flex items-center justify-between gap-4 cursor-pointer group",
          className,
        )}
      >
        <div className="flex flex-col gap-0.5">
          {label && (
            <span className="text-sm font-medium text-foreground group-hover:text-foreground/90 transition-colors">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-foreground/50">{description}</span>
          )}
        </div>
        <div className="relative inline-flex h-6 w-11 shrink-0">
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
              "absolute inset-0 rounded-full border-2 border-border bg-muted transition-all duration-200 ease-out",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
              "peer-checked:border-accent peer-checked:bg-accent",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            )}
          />
          <span
            className={cn(
              "absolute left-0.5 top-0.5 h-4.5 w-4.5 rounded-full bg-foreground shadow-sm transition-all duration-200 ease-out",
              "peer-checked:translate-x-5 peer-checked:bg-on-primary",
              "peer-disabled:opacity-50",
            )}
            style={{ width: "18px", height: "18px" }}
          />
        </div>
      </label>
    );
  },
);

Toggle.displayName = "Toggle";
