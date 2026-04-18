import { BookOpen } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { cn } from "../../lib/utils";
import { TitleBar, WindowResizeHandles } from "../ui";
import type { ExplainResult } from "../../types";

interface ExplainLayoutProps {
  result: ExplainResult;
  learningLanguageLabel: string;
  nativeLanguageLabel: string;
  className?: string;
}

export function ExplainLayout({
  result,
  learningLanguageLabel,
  nativeLanguageLabel,
  className,
}: ExplainLayoutProps) {
  const { t } = useI18n();

  return (
    <div className={cn("window-shell", className)}>
      <WindowResizeHandles />

      <TitleBar
        title={t("explain.title")}
        showMinimize={false}
        showClose
        dragBehavior="manual"
      />

      <div className="flex flex-1 flex-col gap-3 overflow-auto px-4 pb-4 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="status-chip">{t("explain.status")}</span>
            <span className="status-chip">{learningLanguageLabel}</span>
          </div>
          <span className="font-mono text-[11px] text-foreground/42">
            {t("explain.triggerHint")}
          </span>
        </div>

        <section className="panel-surface px-4 py-4">
          <span className="eyebrow-label">
            {t("explain.original")}
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
              {t("explain.meaning", { language: nativeLanguageLabel })}
            </span>
            <p className="text-sm leading-6 text-foreground/90">{result.meaning}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
