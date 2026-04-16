import { useMemo } from "react";
import { cn } from "../../lib/utils";
import { diffText } from "../../lib/diff";

interface DiffHighlightProps {
  original: string;
  optimized: string;
  className?: string;
}

export function DiffHighlight({
  original,
  optimized,
  className,
}: DiffHighlightProps) {
  const chunks = useMemo(() => diffText(original, optimized), [original, optimized]);

  return (
    <div
      className={cn(
        "text-sm leading-relaxed text-foreground whitespace-pre-wrap",
        className,
      )}
    >
      {chunks.map((chunk, index) => {
        if (chunk.type === "equal") {
          return <span key={index}>{chunk.value}</span>;
        }
        if (chunk.type === "insert") {
          return (
            <ins
              key={index}
              className="rounded px-0.5 font-medium text-accent no-underline"
              style={{ backgroundColor: "rgba(34, 197, 94, 0.15)" }}
            >
              {chunk.value}
            </ins>
          );
        }
        return (
          <del
            key={index}
            className="rounded px-0.5 text-foreground/40 line-through decoration-foreground/30 no-underline"
            style={{ backgroundColor: "rgba(71, 85, 105, 0.25)" }}
          >
            {chunk.value}
          </del>
        );
      })}
    </div>
  );
}
