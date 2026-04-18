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
          "flex w-full resize-none rounded-2xl border border-border/70 bg-primary/76 px-4 py-3 text-sm leading-6 text-foreground shadow-[inset_0_1px_0_rgb(var(--foreground)/0.04)] transition-all duration-200 placeholder:text-foreground/38",
          "hover:border-border-strong/70 hover:bg-primary/84",
          "focus-visible:border-accent focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25",
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
