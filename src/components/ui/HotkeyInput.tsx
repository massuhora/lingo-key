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
    <div
      className={cn(
        "group flex flex-col gap-3 rounded-[24px] border border-border/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-3.5 transition-all duration-200",
        "hover:border-border-strong/60 hover:bg-surface-elevated/60",
        "focus-within:border-accent/60 focus-within:bg-surface-elevated/74 focus-within:shadow-[0_0_0_1px_rgb(var(--accent)/0.18),0_20px_36px_-30px_rgb(var(--accent)/0.65)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {label && <label className="eyebrow-label">{label}</label>}
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] transition-all duration-200",
            isRecording
              ? "border-accent/45 bg-accent/12 text-accent shadow-[0_12px_22px_-18px_rgb(var(--accent)/0.8)]"
              : "border-border/55 bg-primary/65 text-foreground/45",
          )}
        >
          {isRecording ? "LISTEN" : "IDLE"}
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
          "flex h-14 w-full cursor-pointer select-none rounded-[18px] border border-border/70 bg-surface-soft/92 px-4 py-3 text-center font-mono text-[15px] tracking-[0.2em] text-foreground shadow-[inset_0_1px_0_rgb(var(--foreground)/0.04)] transition-all duration-200 placeholder:text-foreground/34",
          "hover:border-border-strong/75 hover:bg-surface-soft",
          "focus-visible:border-accent focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/22",
          isRecording &&
            "animate-pulse-soft border-accent bg-surface ring-2 ring-accent/20 shadow-[0_0_0_1px_rgb(var(--accent)/0.12),0_20px_40px_-30px_rgb(var(--accent)/0.65)]",
        )}
      />
      <span className="text-xs leading-5 text-foreground/50">
        {isRecording ? "按下你想设置的快捷键组合，然后松开最后一个按键。" : "点击后直接录制新的全局快捷键。"}
      </span>
    </div>
  );
}
