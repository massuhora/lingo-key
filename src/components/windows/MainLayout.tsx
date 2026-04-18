import { type RefObject } from "react";
import { Settings, Sparkles, ArrowRight, Command } from "lucide-react";
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
  isLoading?: boolean;
  error?: string | null;
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
  isLoading = false,
  error,
  onSettingsClick,
  onSubmit,
  onDragStateChange,
  className,
}: MainLayoutProps) {
  return (
    <div
      className={cn(
        "window-shell",
        className,
      )}
    >
      <WindowResizeHandles />

      <TitleBar
        title="LingoKey"
        dragBehavior="manual"
        onDragStateChange={onDragStateChange}
      >
        <div className="ml-auto flex items-center gap-1">
          <span className="status-chip">Prompt Polish</span>
          <Tooltip content="设置">
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
                  <h2 className="text-sm font-semibold text-foreground">输入</h2>
                  <p className="mt-1 text-xs text-foreground/52">
                    输入需要润色的中文或中英混合文本。
                  </p>
                </div>
                <span className="font-mono text-[11px] text-foreground/38">
                  {inputValue.length} chars
                </span>
              </div>
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="输入需要润色的中文或混合文本..."
                className="min-h-[104px] bg-primary/74"
                autoResize
                minRows={2}
                maxRows={4}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    onSubmit?.();
                  }
                }}
              />
              <div className="flex items-center justify-between gap-3 text-xs text-foreground/46">
                <span>适合需求描述、问题重述、让 AI 更容易理解的上下文。</span>
                <span className="kbd-chip">Ctrl + Enter</span>
              </div>
            </section>

            <section className="panel-surface flex min-h-[196px] flex-col gap-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">润色结果</h2>
                  <p className="mt-1 text-xs text-foreground/52">
                    差异会被高亮，方便快速确认修改点。
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
                    <span className="text-sm">正在整理表达...</span>
                  </div>
                ) : resultText ? (
                  <>
                    {error && (
                      <div className="mb-3 rounded-xl border border-destructive/28 bg-destructive/10 px-3 py-2 text-xs leading-5 text-destructive">
                        {error}
                      </div>
                    )}
                    <DiffHighlight
                      original={originalText}
                      optimized={resultText}
                    />
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-foreground/36">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-primary/76">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground/54">结果会显示在这里</p>
                      <p className="text-xs leading-5 text-foreground/38">
                        发送前先快速检查语气、术语和细节表达。
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
              快捷提交
            </span>
            <span>支持直接复制结果，继续发给 Codex、Claude Code 或 Cursor。</span>
          </div>
          <Button
            onClick={onSubmit}
            disabled={isLoading || !inputValue.trim()}
            className="min-w-[132px]"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" />
                正在润色
              </>
            ) : (
              <>
                开始润色
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
