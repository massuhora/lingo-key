import { BookOpen } from "lucide-react";
import { cn } from "../../lib/utils";
import { TitleBar, WindowResizeHandles } from "../ui";
import type { ExplainResult } from "../../types";

interface ExplainLayoutProps {
  result: ExplainResult;
  className?: string;
}

export function ExplainLayout({
  result,
  className,
}: ExplainLayoutProps) {
  return (
    <div
      className={cn(
        "window-shell",
        className,
      )}
    >
      <WindowResizeHandles />

      <TitleBar
        title="解释"
        showMinimize={false}
        showClose
        dragBehavior="manual"
      />

      <div className="flex flex-1 flex-col gap-3 overflow-auto px-4 pb-4 pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="status-chip">Instant Explain</span>
          <span className="font-mono text-[11px] text-foreground/42">
            选中文本后触发
          </span>
        </div>

        <section className="panel-surface px-4 py-4">
          <span className="eyebrow-label">
            Original
          </span>
          <p className="mt-2 text-sm font-medium leading-6 text-foreground">
            {result.original}
          </p>
        </section>

        <section className="panel-surface flex min-h-[128px] flex-1 gap-3 px-4 py-4">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-accent/18 bg-accent/10">
            <BookOpen className="h-4 w-4 text-accent" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="eyebrow-label">
              Meaning
            </span>
            <p className="text-sm leading-6 text-foreground/90">{result.meaning}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
