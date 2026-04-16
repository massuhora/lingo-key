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
      {label && (
        <label className="text-sm font-medium text-foreground/90">
          {label}
        </label>
      )}
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
          "flex h-10 w-full rounded-lg border border-border bg-primary px-3 py-2 text-sm text-foreground text-center font-mono tracking-wide placeholder:text-foreground/40 transition-all duration-200 cursor-pointer select-none",
          "hover:border-foreground/30 hover:bg-primary/80",
          "focus-visible:border-accent focus-visible:bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
          isRecording &&
            "border-accent bg-background ring-1 ring-accent animate-pulse",
        )}
      />
      <span className="text-xs text-foreground/40">
        {isRecording ? "按下你想设置的快捷键..." : "点击以录制新快捷键"}
      </span>
    </div>
  );
}
