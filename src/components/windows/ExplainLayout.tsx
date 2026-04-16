import { BookOpen } from "lucide-react";
import { cn } from "../../lib/utils";
import { TitleBar } from "../ui";
import type { ExplainResult } from "../../types";

interface ExplainLayoutProps {
  result: ExplainResult;
  className?: string;
  onDragStateChange?: (dragging: boolean) => void;
}

export function ExplainLayout({
  result,
  className,
  onDragStateChange,
}: ExplainLayoutProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl",
        className,
      )}
    >
      <TitleBar
        title="解释"
        showMinimize={false}
        showClose={false}
        dragBehavior="manual"
        onDragStateChange={onDragStateChange}
      />

      <div className="flex flex-1 flex-col gap-3 overflow-auto px-4 pb-4">
        {/* 原文 Text */}
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-foreground/40">
            Original
          </span>
          <p className="mt-1 text-sm font-medium text-foreground">
            {result.original}
          </p>
        </div>

        {/* 含义 */}
        <div className="flex gap-2">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent/10">
            <BookOpen className="h-3 w-3 text-accent" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-foreground/40">
              Meaning
            </span>
            <p className="text-sm text-foreground/90">{result.meaning}</p>
          </div>
        </div>


      </div>
    </div>
  );
}
