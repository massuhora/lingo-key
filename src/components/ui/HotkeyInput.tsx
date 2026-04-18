import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { cn } from "../../lib/utils";

interface HotkeyInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

function formatHotkey(e: KeyboardEvent<HTMLInputElement>): string {
  const keys: string[] = [];
  if (e.ctrlKey) keys.push("Ctrl");
  if (e.metaKey) keys.push("Cmd");
  if (e.altKey) keys.push("Alt");
  if (e.shiftKey) keys.push("Shift");

  const key = e.key;
  if (
    key !== "Control" &&
    key !== "Meta" &&
    key !== "Alt" &&
    key !== "Shift" &&
    key !== "Tab"
  ) {
    keys.push(key.length === 1 ? key.toUpperCase() : key);
  }

  return keys.join("+");
}

export function HotkeyInput({
  value,
  onChange,
  label,
  placeholder = "点击并按下快捷键...",
  className,
}: HotkeyInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  useEffect(() => {
    if (!isRecording) return;

    const handleBlur = () => {
      setIsRecording(false);
      setDisplayValue(value);
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener("blur", handleBlur);
      return () => input.removeEventListener("blur", handleBlur);
    }
  }, [isRecording, value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isRecording) return;

    e.preventDefault();
    e.stopPropagation();

    const hotkey = formatHotkey(e);
    if (hotkey) {
      setDisplayValue(hotkey);
      onChange(hotkey);
    }
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isRecording) return;

    e.preventDefault();
    e.stopPropagation();

    const hotkey = formatHotkey(e);
    if (hotkey && !["Ctrl", "Cmd", "Alt", "Shift"].includes(e.key)) {
      setIsRecording(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-3">
        {label && <label className="eyebrow-label">{label}</label>}
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] transition-all duration-200",
            isRecording
              ? "border-accent/45 bg-accent/12 text-accent"
              : "border-border/55 bg-primary/65 text-foreground/45",
          )}
        >
          {isRecording ? "Recording" : "Idle"}
        </span>
      </div>
      <input
        ref={inputRef}
        type="text"
        readOnly
        value={displayValue}
        placeholder={placeholder}
        onFocus={() => setIsRecording(true)}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        className={cn(
          "flex h-12 w-full cursor-pointer select-none rounded-2xl border border-border/70 bg-primary/76 px-4 py-3 text-center font-mono text-sm tracking-[0.18em] text-foreground shadow-[inset_0_1px_0_rgb(var(--foreground)/0.04)] transition-all duration-200 placeholder:text-foreground/34",
          "hover:border-border-strong/70 hover:bg-primary/84",
          "focus-visible:border-accent focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25",
          isRecording &&
            "animate-pulse-soft border-accent bg-surface ring-2 ring-accent/20",
        )}
      />
      <span className="text-xs leading-5 text-foreground/46">
        {isRecording ? "按下你想设置的快捷键..." : "点击以录制新快捷键"}
      </span>
    </div>
  );
}
