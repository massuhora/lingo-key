import { useState, useCallback } from 'react';
import { readClipboard, writeClipboard } from '../lib/tauri';

export interface UseClipboardReturn {
  text: string;
  read: () => Promise<string>;
  write: (text: string) => Promise<boolean>;
  copying: boolean;
}

export function useClipboard(): UseClipboardReturn {
  const [text, setText] = useState('');
  const [copying, setCopying] = useState(false);

  const read = useCallback(async (): Promise<string> => {
    const content = await readClipboard();
    setText(content);
    return content;
  }, []);

  const write = useCallback(async (content: string): Promise<boolean> => {
    setCopying(true);
    const ok = await writeClipboard(content);
    if (ok) {
      setText(content);
    }
    setCopying(false);
    return ok;
  }, []);

  return {
    text,
    read,
    write,
    copying,
  };
}
