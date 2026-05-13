import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  History,
  Pin,
  PinOff,
  Settings,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { cn } from "../../lib/utils";
import type { HistoryItem } from "../../types";
import { Button, CopyButton, TitleBar, Tooltip, WindowResizeHandles } from "../ui";

type HistoryFilter = "all" | "favorites";

interface HistoryLayoutProps {
  items: HistoryItem[];
  loading?: boolean;
  alwaysOnTop?: boolean;
  onAlwaysOnTopToggle?: () => void;
  onBack?: () => void;
  onSettingsClick?: () => void;
  onUseItem?: (item: HistoryItem) => void;
  onToggleFavorite?: (id: string) => void;
  onRemoveItem?: (id: string) => void;
  className?: string;
}

function formatTimestamp(value: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function HistoryLayout({
  items,
  loading = false,
  alwaysOnTop = false,
  onAlwaysOnTopToggle,
  onBack,
  onSettingsClick,
  onUseItem,
  onToggleFavorite,
  onRemoveItem,
  className,
}: HistoryLayoutProps) {
  const { locale, t } = useI18n();
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const favoriteCount = useMemo(
    () => items.filter((item) => item.favorite).length,
    [items],
  );
  const visibleItems = filter === "favorites"
    ? items.filter((item) => item.favorite)
    : items;

  return (
    <div className={cn("window-shell", className)}>
      <WindowResizeHandles />

      <TitleBar
        title={t("history.title")}
        showMinimize={false}
        showClose
        dragBehavior="manual"
      >
        <div className="ml-auto flex items-center gap-1">
          <Tooltip content={t("common.backToPrompt")}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              aria-label={t("common.backToPrompt")}
              className="h-8 w-8 text-foreground/54 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Tooltip>
          <span className="status-chip">{items.length}</span>
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

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4 pt-4">
        <div className="panel-surface flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-col">
            <h2 className="text-sm font-semibold text-foreground">{t("history.heading")}</h2>
            <p className="mt-1 text-xs leading-5 text-foreground/52">
              {t("history.description")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-border/60 bg-primary/70 p-1">
            <Button
              variant={filter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              aria-pressed={filter === "all"}
              className="h-8 px-3 text-xs"
            >
              <History className="h-3.5 w-3.5" />
              {t("history.all")}
            </Button>
            <Button
              variant={filter === "favorites" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("favorites")}
              aria-pressed={filter === "favorites"}
              className="h-8 px-3 text-xs"
            >
              <Star className="h-3.5 w-3.5" />
              {favoriteCount}
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="panel-inset flex h-full min-h-[260px] items-center justify-center text-sm text-foreground/52">
              {t("history.loading")}
            </div>
          ) : visibleItems.length > 0 ? (
            <div className="flex flex-col gap-3">
              {visibleItems.map((item) => {
                const isOptimize = item.kind === "optimize";

                return (
                  <article key={item.id} className="panel-surface flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-accent/18 bg-accent/10 text-accent">
                          {isOptimize ? (
                            <Sparkles className="h-4 w-4" />
                          ) : (
                            <BookOpen className="h-4 w-4" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {isOptimize ? t("history.optimizeKind") : t("history.explainKind")}
                          </p>
                          <p className="mt-0.5 text-xs text-foreground/44">
                            {formatTimestamp(item.createdAt, locale)}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Tooltip content={item.favorite ? t("history.unfavorite") : t("history.favorite")}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onToggleFavorite?.(item.id)}
                            aria-pressed={item.favorite}
                            aria-label={item.favorite ? t("history.unfavorite") : t("history.favorite")}
                            className={cn(
                              "h-8 w-8 text-foreground/54 hover:text-foreground",
                              item.favorite && "text-accent hover:text-accent",
                            )}
                          >
                            <Star className={cn("h-4 w-4", item.favorite && "fill-current")} />
                          </Button>
                        </Tooltip>
                        <CopyButton
                          text={item.kind === "optimize" ? item.output : `${item.input}\n\n${item.output}`}
                          variant="ghost"
                          className="h-8 w-8 text-foreground/54 hover:text-foreground"
                        />
                        <Tooltip content={t("history.delete")}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveItem?.(item.id)}
                            aria-label={t("history.delete")}
                            className="h-8 w-8 text-foreground/46 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onUseItem?.(item)}
                      className="group rounded-xl border border-border/50 bg-primary/64 px-3 py-3 text-left transition-colors hover:border-border-strong/70 hover:bg-primary/86 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                    >
                      <span className="eyebrow-label">{t("history.source")}</span>
                      <span className="mt-1 block max-h-16 overflow-hidden text-xs leading-5 text-foreground/62">
                        {item.input}
                      </span>
                      <span className="subtle-divider my-3 block" />
                      <span className="eyebrow-label">{isOptimize ? t("history.result") : t("history.meaning")}</span>
                      <span className="mt-1 block max-h-20 overflow-hidden text-sm leading-6 text-foreground group-hover:text-foreground">
                        {item.output}
                      </span>
                      {item.context && (
                        <span className="mt-2 block max-h-10 overflow-hidden text-xs leading-5 text-foreground/46">
                          {item.context}
                        </span>
                      )}
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="panel-inset flex h-full min-h-[260px] flex-col items-center justify-center gap-3 px-8 text-center text-foreground/42">
              <History className="h-8 w-8" />
              <div>
                <p className="text-sm font-medium text-foreground/58">
                  {filter === "favorites" ? t("history.emptyFavoritesTitle") : t("history.emptyTitle")}
                </p>
                <p className="mt-1 text-xs leading-5">
                  {filter === "favorites" ? t("history.emptyFavoritesDescription") : t("history.emptyDescription")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
