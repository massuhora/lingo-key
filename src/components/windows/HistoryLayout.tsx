import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  History,
  Pin,
  PinOff,
  Search,
  Settings,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { cn } from "../../lib/utils";
import type { HistoryItem } from "../../types";
import { Button, CopyButton, TitleBar, Tooltip, WindowResizeHandles } from "../ui";

type HistoryFilter = "all" | "optimize" | "favorites";

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
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const favoriteCount = useMemo(
    () => items.filter((item) => item.favorite).length,
    [items],
  );
  const optimizeCount = useMemo(
    () => items.filter((item) => item.kind === "optimize").length,
    [items],
  );
  const visibleItems = useMemo(() => {
    const filteredItems = items.filter((item) => {
      if (filter === "favorites" && !item.favorite) return false;
      if (filter === "optimize" && item.kind !== "optimize") return false;
      if (!normalizedSearch) return true;

      return `${item.input} ${item.output} ${item.context ?? ""}`
        .toLowerCase()
        .includes(normalizedSearch);
    });

    return filteredItems;
  }, [filter, items, normalizedSearch]);
  const hasSearch = normalizedSearch.length > 0;

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
        <div className="panel-surface flex flex-col gap-3 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col">
              <h2 className="text-sm font-semibold text-foreground">{t("history.heading")}</h2>
              <p className="mt-1 text-xs leading-5 text-foreground/52">
                {t("history.description")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-[11px] text-foreground/52">
              <span className="status-chip">{t("history.totalCount", { count: items.length })}</span>
              <span className="status-chip border-accent/22 text-accent">
                <Star className="h-3.5 w-3.5 fill-current" />
                {favoriteCount}
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/38" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("history.searchPlaceholder")}
                aria-label={t("history.searchPlaceholder")}
                className="h-10 w-full rounded-xl border border-border/60 bg-primary/72 pl-9 pr-10 text-sm text-foreground transition-colors placeholder:text-foreground/36 hover:border-border-strong/65 focus-visible:border-accent focus-visible:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/22"
              />
              {searchQuery && (
                <Tooltip content={t("history.clearSearch")}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery("")}
                    aria-label={t("history.clearSearch")}
                    className="absolute right-1 top-1 h-8 w-8 text-foreground/46 hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Tooltip>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-primary/70 p-1">
              <Button
                variant={filter === "all" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilter("all")}
                aria-pressed={filter === "all"}
                className="h-8 flex-1 px-3 text-xs"
              >
                <History className="h-3.5 w-3.5" />
                {t("history.all")}
              </Button>
              <Button
                variant={filter === "optimize" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilter("optimize")}
                aria-pressed={filter === "optimize"}
                className="h-8 flex-1 px-3 text-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t("history.polishFilter", { count: optimizeCount })}
              </Button>
              <Button
                variant={filter === "favorites" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilter("favorites")}
                aria-pressed={filter === "favorites"}
                className="h-8 flex-1 px-3 text-xs"
              >
                <Star className="h-3.5 w-3.5" />
                {t("history.starredFilter", { count: favoriteCount })}
              </Button>
            </div>
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
                        <span className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-accent/18 bg-accent/10 text-accent",
                          item.favorite && "border-accent/34 bg-accent/14",
                        )}>
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
                        {item.favorite && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-accent/24 bg-accent/10 px-2 py-1 text-[11px] font-medium text-accent">
                            <Star className="h-3 w-3 fill-current" />
                            {t("history.savedBadge")}
                          </span>
                        )}
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

                    <div className="rounded-xl border border-border/50 bg-primary/64 px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => onUseItem?.(item)}
                          className="group min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                        >
                          <span className="eyebrow-label">{isOptimize ? t("history.result") : t("history.meaning")}</span>
                          <span className="mt-1 block max-h-20 overflow-hidden text-sm leading-6 text-foreground transition-colors group-hover:text-accent">
                            {item.output}
                          </span>
                        </button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => onUseItem?.(item)}
                          className="h-8 shrink-0 px-2.5 text-xs"
                        >
                          {t("history.useItem")}
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <span className="subtle-divider my-3 block" />
                      <span className="eyebrow-label">{t("history.source")}</span>
                      <span className="mt-1 block max-h-14 overflow-hidden text-xs leading-5 text-foreground/62">
                        {item.input}
                      </span>
                      {item.context && (
                        <span className="mt-2 block max-h-10 overflow-hidden text-xs leading-5 text-foreground/46">
                          {item.context}
                        </span>
                      )}
                      {item.favorite && isOptimize && (
                        <span className="mt-3 inline-flex rounded-full border border-accent/18 bg-accent/8 px-2.5 py-1 text-[11px] font-medium text-accent">
                          {t("history.favoriteReuseNote")}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="panel-inset flex h-full min-h-[260px] flex-col items-center justify-center gap-3 px-8 text-center text-foreground/42">
              <History className="h-8 w-8" />
              <div>
                <p className="text-sm font-medium text-foreground/58">
                  {hasSearch
                    ? t("history.emptySearchTitle")
                    : filter === "favorites"
                      ? t("history.emptyFavoritesTitle")
                      : t("history.emptyTitle")}
                </p>
                <p className="mt-1 text-xs leading-5">
                  {hasSearch
                    ? t("history.emptySearchDescription")
                    : filter === "favorites"
                      ? t("history.emptyFavoritesDescription")
                      : t("history.emptyDescription")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
