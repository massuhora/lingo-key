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
      "inline-flex items-center justify-center font-medium transition-all duration-200 ease-out rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variants = {
      primary:
        "bg-accent text-on-primary hover:bg-accent/90 shadow-sm hover:shadow-md",
      secondary:
        "bg-secondary text-foreground hover:bg-secondary/80 border border-border",
      ghost:
        "bg-transparent text-foreground hover:bg-muted hover:text-foreground",
      destructive:
        "bg-destructive text-on-primary hover:bg-destructive/90",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-9 w-9 p-0",
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
