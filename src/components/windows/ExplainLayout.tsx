import { ArrowLeft, BookOpen, Pin, PinOff, Settings, Star } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { cn } from "../../lib/utils";
import { Button, CopyButton, TitleBar, Tooltip, WindowResizeHandles } from "../ui";
import type { ExplainResult } from "../../types";

interface ExplainLayoutProps {
  result: ExplainResult;
  learningLanguageLabel: string;
  nativeLanguageLabel: string;
  alwaysOnTop?: boolean;
  onAlwaysOnTopToggle?: () => void;
  onPolishClick?: () => void;
  onSettingsClick?: () => void;
  onResultCopied?: () => void;
  isFavorite?: boolean;
  favoriteDisabled?: boolean;
  onFavoriteToggle?: () => void;
  className?: string;
}

export function ExplainLayout({
  result,
  learningLanguageLabel,
  nativeLanguageLabel,
  alwaysOnTop = false,
  onAlwaysOnTopToggle,
  onPolishClick,
  onSettingsClick,
  onResultCopied,
  isFavorite = false,
  favoriteDisabled = false,
  onFavoriteToggle,
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
      >
        <div className="ml-auto flex items-center gap-1">
          <Tooltip content={t("common.backToPrompt")}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPolishClick}
              aria-label={t("common.backToPrompt")}
              className="h-8 w-8 text-foreground/54 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Tooltip>
          <span className="status-chip">{t("explain.status")}</span>
          <span className="status-chip">{learningLanguageLabel}</span>
          <Tooltip content={alwaysOnTop ? t("main.unpinWindow") : t("main.pinWindow")}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onAlwaysOnTopToggle}
              aria-pressed={alwaysOnTop}
              aria-label={alwaysOnTop ? t("main.unpinWindow") : t("main.pinWindow")}
              className={cn(
                "h-8 w-8 text-foreground/54 hover:text-foreground",
                alwaysOnTop && "bg-accent/12 text-accent hover:bg-accent/16 hover:text-accent",
              )}
            >
              {alwaysOnTop ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
            </Button>
          </Tooltip>
          <Tooltip content={t("common.settings")}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              aria-label={t("common.settings")}
              className="h-8 w-8 text-foreground/54 hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </TitleBar>

      <div className="flex flex-1 flex-col gap-3 overflow-auto px-4 pb-4 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="status-chip">{t("explain.triggerHint")}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Tooltip content={isFavorite ? t("history.unfavorite") : t("history.favorite")} side="bottom">
              <Button
                variant="ghost"
                size="icon"
                onClick={onFavoriteToggle}
                disabled={favoriteDisabled}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? t("history.unfavorite") : t("history.favorite")}
                className={cn(
                  "h-9 w-9 text-foreground/54 hover:text-foreground",
                  isFavorite && "text-accent hover:text-accent",
                )}
              >
                <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
              </Button>
            </Tooltip>
            <CopyButton
              text={`${result.original}\n\n${result.meaning}`}
              variant="ghost"
              onCopied={onResultCopied}
              className="h-9 w-9 text-foreground/54 hover:text-foreground"
            />
          </div>
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
          <div className="flex min-w-0 flex-col gap-1">
            <span className="eyebrow-label">
              {t("explain.meaning", { language: nativeLanguageLabel })}
            </span>
            <p className="text-sm leading-6 text-foreground/90">{result.meaning}</p>
          </div>
        </section>

        {result.context && (
          <section className="panel-inset px-4 py-3">
            <p className="text-xs leading-5 text-foreground/58">{result.context}</p>
          </section>
        )}
      </div>
    </div>
  );
}
