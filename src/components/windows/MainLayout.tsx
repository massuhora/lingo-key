import { type RefObject } from "react";
import { Settings, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  Button,
  CopyButton,
  DiffHighlight,
  Textarea,
  TitleBar,
  Tooltip,
  Spinner,
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
        "flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl",
        className,
      )}
    >
      <TitleBar
        title="LingoKey"
        dragBehavior="manual"
        onDragStateChange={onDragStateChange}
      >
        <div className="ml-auto flex items-center gap-1">
          <Tooltip content="设置">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              className="h-7 w-7 text-foreground/50 hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </TitleBar>

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4">
        {/* Input Area */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground/50">
              输入
            </span>
            <span className="text-[10px] text-foreground/30">
              {inputValue.length} 字符
            </span>
          </div>
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="输入需要润色的中文或混合文本..."
            className="min-h-[80px] bg-muted/50"
            autoResize
            minRows={2}
            maxRows={4}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                onSubmit?.();
              }
            }}
          />
        </div>

        {/* Result Area */}
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground/50">
              润色结果
            </span>
            {resultText && (
              <CopyButton
                text={resultText}
                variant="ghost"
                className="h-7 w-7 text-foreground/50 hover:text-foreground"
              />
            )}
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3">
            {isLoading ? (
              <div className="flex h-full items-center justify-center gap-2 text-foreground/50">
                <Spinner size="sm" />
                <span className="text-sm">润色中...</span>
              </div>
            ) : resultText ? (
              <>
                {error && (
                  <div className="mb-2 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                    {error}
                  </div>
                )}
                <DiffHighlight
                  original={originalText}
                  optimized={resultText}
                />
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-foreground/30">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm">结果将显示在这里</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-xs text-foreground/40">
            按 Ctrl+Enter 开始润色
          </span>
          <Button
            onClick={onSubmit}
            disabled={isLoading || !inputValue.trim()}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" />
                润色中
              </>
            ) : (
              <>
                润色
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
