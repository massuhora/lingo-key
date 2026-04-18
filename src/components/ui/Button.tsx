import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";
import { Spinner } from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-transparent font-medium tracking-[0.01em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 active:translate-y-px";

    const variants = {
      primary:
        "bg-accent text-on-primary shadow-glow hover:bg-accent/92 hover:shadow-[0_18px_38px_-18px_rgb(var(--accent)/0.78)]",
      secondary:
        "border-border/70 bg-secondary/82 text-foreground shadow-[inset_0_1px_0_rgb(var(--foreground)/0.04)] hover:border-border-strong/70 hover:bg-secondary",
      ghost:
        "text-foreground/72 hover:bg-foreground/6 hover:text-foreground",
      destructive:
        "bg-destructive text-on-primary shadow-[0_12px_28px_-18px_rgb(var(--destructive)/0.75)] hover:bg-destructive/92",
    };

    const sizes = {
      sm: "h-9 px-3.5 text-sm",
      md: "h-11 px-4.5 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Spinner className="mr-2" size={size === "icon" ? "sm" : "sm"} />
        )}
        {!loading && children}
      </button>
    );
  },
);

Button.displayName = "Button";
