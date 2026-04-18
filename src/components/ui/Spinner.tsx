import { cn } from "../../lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Spinner({ className, size = "md" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-5 w-5 border-2",
    lg: "h-7 w-7 border-[3px]",
  };

  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-solid border-current border-b-transparent border-r-transparent",
        sizeClasses[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
