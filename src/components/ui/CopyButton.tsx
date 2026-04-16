import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}

export function CopyButton({
  text,
  className,
  variant = "ghost",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      const { writeText } = await import("@tauri-apps/plugin-clipboard-manager");
      await writeText(text);
    } catch {
      // Fallback to browser clipboard API
      await navigator.clipboard.writeText(text);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleCopy}
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        copied && "text-accent",
        className,
      )}
      aria-label={copied ? "已复制" : "复制到剪贴板"}
    >
      <Copy
        className={cn(
          "absolute h-4 w-4 transition-all duration-200",
          copied ? "opacity-0 rotate-12 scale-75" : "opacity-100 rotate-0 scale-100",
        )}
      />
      <Check
        className={cn(
          "absolute h-4 w-4 transition-all duration-200",
          copied ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-12 scale-75",
        )}
      />
    </Button>
  );
}
