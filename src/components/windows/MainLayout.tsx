import { type RefObject } from "react";
import { Settings, Sparkles, ArrowRight, Command, Pin, PinOff } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { cn } from "../../lib/utils";
import {
  Button,
  CopyButton,
  DiffHighlight,
  Textarea,
  TitleBar,
  Tooltip,
  Spinner,
  WindowResizeHandles,
} from "../ui";

interface MainLayoutProps {
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  inputValue: string;
  onInputChange: (value: string) => void;
  originalText: string;
  resultText: string;
  learningLanguageLabel: string;
  isLoading?: boolean;
  error?: string | null;
  alwaysOnTop?: boolean;
  onAlwaysOnTopToggle?: () => void;
  onSettingsClick?: () => void;
  onSubmit?: () => void;
  onDragStateChange?: (dragging: boolean) => void;
  className?: string;
}

export function MainLayout({
  inputRef,
  inputValue,
  onInputChange,
  originalText,
  resultText,
  learningLanguageLabel,
  isLoading = false,
  error,
  alwaysOnTop = false,
  onAlwaysOnTopToggle,
  onSettingsClick,
  onSubmit,
  onDragStateChange,
  className,
}: MainLayoutProps) {
  const { t } = useI18n();

  return (
    <div className={cn("window-shell", className)}>
      <WindowResizeHandles />

      <TitleBar
        title="LingoKey"
        dragBehavior="manual"
        onDragStateChange={onDragStateChange}
      >
        <div className="ml-auto flex items-center gap-1">
          <span className="status-chip">{t("main.status")}</span>
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
              className="h-8 w-8 text-foreground/54 hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </TitleBar>

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4">
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          <div className="grid gap-4">
            <section className="panel-surface flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{t("main.inputTitle")}</h2>
                  <p className="mt-1 text-xs text-foreground/52">
                    {t("main.inputDescription", { language: learningLanguageLabel })}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-foreground/38">
                  {inputValue.length} chars
                </span>
              </div>
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(event) => onInputChange(event.target.value)}
                placeholder={t("main.inputPlaceholder", { language: learningLanguageLabel })}
                className="min-h-[104px] bg-primary/74"
                autoResize
                minRows={2}
                maxRows={4}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                    onSubmit?.();
                  }
                }}
              />
              <div className="flex items-center justify-between gap-3 text-xs text-foreground/46">
                <span>{t("main.inputHint")}</span>
                <span className="kbd-chip">Ctrl + Enter</span>
              </div>
            </section>

            <section className="panel-surface flex min-h-[196px] flex-col gap-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{t("main.resultTitle")}</h2>
                  <p className="mt-1 text-xs text-foreground/52">
                    {t("main.resultDescription")}
                  </p>
                </div>
                {resultText && (
                  <CopyButton
                    text={resultText}
                    variant="ghost"
                    className="h-9 w-9 text-foreground/54 hover:text-foreground"
                  />
                )}
              </div>

              <div className="panel-inset relative min-h-[132px] flex-1 overflow-y-auto p-4" aria-live="polite">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center gap-3 text-foreground/56">
                    <Spinner size="sm" className="text-accent" />
                    <span className="text-sm">{t("main.loading")}</span>
                  </div>
                ) : resultText ? (
                  <>
                    {error && (
                      <div className="mb-3 rounded-xl border border-destructive/28 bg-destructive/10 px-3 py-2 text-xs leading-5 text-destructive">
                        {error}
                      </div>
                    )}
                    <DiffHighlight original={originalText} optimized={resultText} />
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-foreground/36">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-primary/76">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground/54">{t("main.emptyTitle")}</p>
                      <p className="text-xs leading-5 text-foreground/38">
                        {t("main.emptyDescription")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        <div className="panel-surface mt-4 flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/52">
            <span className="status-chip">
              <Command className="h-3.5 w-3.5" />
              {t("main.quickSubmit")}
            </span>
            <span>{t("main.quickSubmitDescription")}</span>
          </div>
          <Button
            onClick={onSubmit}
            disabled={isLoading || !inputValue.trim()}
            className="min-w-[132px]"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" />
                {t("main.submitting")}
              </>
            ) : (
              <>
                {t("main.submit")}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
