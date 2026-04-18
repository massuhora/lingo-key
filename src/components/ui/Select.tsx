import { type SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const currentValue = String(props.value ?? props.defaultValue ?? "");
    const selectedOption =
      options.find((option) => option.value === currentValue) ?? options[0];

    return (
      <div
        className={cn(
          "group flex flex-col gap-3 rounded-[24px] border border-border/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-3.5 transition-all duration-200",
          "hover:border-border-strong/60 hover:bg-surface-elevated/60",
          "focus-within:border-accent/60 focus-within:bg-surface-elevated/74 focus-within:shadow-[0_0_0_1px_rgb(var(--accent)/0.18),0_20px_36px_-30px_rgb(var(--accent)/0.65)]",
          className,
        )}
      >
        {(label || selectedOption) && (
          <div className="flex items-center justify-between gap-3">
            {label && (
              <label
                htmlFor={selectId}
                className="eyebrow-label"
              >
                {label}
              </label>
            )}
            {selectedOption && (
              <span className="rounded-full border border-border/55 bg-primary/70 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/56">
                {selectedOption.label}
              </span>
            )}
          </div>
        )}
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1.5 right-1.5 w-11 rounded-[16px] border border-border/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] bg-surface/92"
          />
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "flex h-12 w-full cursor-pointer appearance-none rounded-[18px] border border-border/70 bg-surface-soft/92 px-4 py-3 pr-14 text-sm font-medium text-foreground shadow-[inset_0_1px_0_rgb(var(--foreground)/0.05)] transition-all duration-200",
              "hover:border-border-strong/75 hover:bg-surface-soft",
              "focus-visible:border-accent focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/22",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus-visible:ring-destructive/25",
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
          <ChevronDown className="pointer-events-none absolute right-[18px] top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/56" />
        </div>
        {selectedOption?.description && !error && (
          <p className="text-xs leading-5 text-foreground/52">
            {selectedOption.description}
          </p>
        )}
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
