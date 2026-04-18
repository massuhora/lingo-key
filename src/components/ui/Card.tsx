import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "ghost";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-200",
          variant === "default" &&
            "panel-surface hover:border-border-strong/60",
          variant === "ghost" && "border-transparent bg-transparent",
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1.5 px-5 py-5", className)}
      {...props}
    />
  ),
);

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-base font-semibold tracking-[0.01em] text-foreground", className)}
      {...props}
    />
  ),
);

CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("supporting-text", className)}
      {...props}
    />
  ),
);

CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-5 pb-5", className)} {...props} />
  ),
);

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-2 px-5 pb-5", className)}
      {...props}
    />
  ),
);

CardFooter.displayName = "CardFooter";
