import { type SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-foreground/90"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "flex h-10 w-full appearance-none rounded-lg border border-border bg-primary px-3 py-2 pr-10 text-sm text-foreground transition-colors duration-200",
              "hover:border-foreground/30 hover:bg-primary/80",
              "focus-visible:border-accent focus-visible:bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus-visible:ring-destructive",
              className,
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50 pointer-events-none" />
        </div>
        {error && (
          <span className="text-xs text-destructive animate-fade-in">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
