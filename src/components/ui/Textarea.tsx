import {
  type TextareaHTMLAttributes,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import { cn } from "../../lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      autoResize = true,
      minRows = 3,
      maxRows = 8,
      ...props
    },
    ref,
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (!autoResize) return;
      const textarea = textareaRef.current;
      if (!textarea) return;

      const adjustHeight = () => {
        textarea.style.height = "auto";
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
        const minHeight = minRows * lineHeight;
        const maxHeight = maxRows * lineHeight;
        const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight));
        textarea.style.height = `${newHeight}px`;
      };

      adjustHeight();

      textarea.addEventListener("input", adjustHeight);
      return () => textarea.removeEventListener("input", adjustHeight);
    }, [autoResize, minRows, maxRows]);

    return (
      <textarea
        ref={(node) => {
          textareaRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn(
          "flex w-full rounded-lg border border-border bg-primary px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 transition-colors duration-200 resize-none",
          "hover:border-foreground/30 hover:bg-primary/80",
          "focus-visible:border-accent focus-visible:bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        rows={minRows}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
