import type { FavoriteReuseHint, HistoryItem, HistoryKind } from '../types';

const STORE_FILE = 'history.json';
const STORE_KEY = 'items';
const LOCAL_STORAGE_KEY = 'lingokey.history.items';
const MAX_HISTORY_ITEMS = 80;
const MAX_REUSE_HINTS = 3;

type StoreLike = {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  save(): Promise<void>;
};

let storePromise: Promise<StoreLike | null> | null = null;

function isHistoryKind(value: unknown): value is HistoryKind {
  return value === 'optimize' || value === 'explain';
}

function isHistoryItem(value: unknown): value is HistoryItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.id === 'string' &&
    isHistoryKind(item.kind) &&
    typeof item.input === 'string' &&
    typeof item.output === 'string' &&
    typeof item.createdAt === 'number' &&
    typeof item.favorite === 'boolean' &&
    (item.context === undefined || typeof item.context === 'string')
  );
}

function normalizeItems(items: unknown): HistoryItem[] {
  if (!Array.isArray(items)) return [];

  return items
    .filter(isHistoryItem)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_HISTORY_ITEMS);
}

function createId(kind: HistoryKind, input: string, output: string): string {
  const seed = `${kind}:${input}:${output}:${Date.now()}:${Math.random()}`;
  let hash = 0;

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  return `${kind}-${Date.now().toString(36)}-${hash.toString(36)}`;
}

async function getHistoryStore(): Promise<StoreLike | null> {
  if (!storePromise) {
    storePromise = import('@tauri-apps/plugin-store')
      .then(({ load }) => load(STORE_FILE, { defaults: { [STORE_KEY]: [] } }))
      .catch((error) => {
        console.warn('History store is unavailable, falling back to localStorage:', error);
        return null;
      });
  }

  return storePromise;
}

function readFallbackItems(): HistoryItem[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return normalizeItems(raw ? JSON.parse(raw) : []);
  } catch (error) {
    console.warn('Failed to read fallback history:', error);
    return [];
  }
}

function writeFallbackItems(items: HistoryItem[]) {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Failed to write fallback history:', error);
  }
}

export async function loadHistoryItems(): Promise<HistoryItem[]> {
  const store = await getHistoryStore();
  if (!store) return readFallbackItems();

  return normalizeItems(await store.get<HistoryItem[]>(STORE_KEY));
}

export async function saveHistoryItems(items: HistoryItem[]): Promise<void> {
  const normalized = normalizeItems(items);
  const store = await getHistoryStore();

  if (!store) {
    writeFallbackItems(normalized);
    return;
  }

  await store.set(STORE_KEY, normalized);
  await store.save();
}

export function upsertHistoryItem(
  items: HistoryItem[],
  next: Pick<HistoryItem, 'kind' | 'input' | 'output' | 'context'> & Partial<Pick<HistoryItem, 'favorite'>>,
): HistoryItem[] {
  const input = next.input.trim();
  const output = next.output.trim();
  const context = next.context?.trim();

  if (!input || !output) {
    return normalizeItems(items);
  }

  const existing = items.find(
    (item) => item.kind === next.kind && item.input === input && item.output === output,
  );

  const historyItem: HistoryItem = {
    id: existing?.id ?? createId(next.kind, input, output),
    kind: next.kind,
    input,
    output,
    context: context || undefined,
    createdAt: Date.now(),
    favorite: next.favorite ?? existing?.favorite ?? false,
  };

  return normalizeItems([
    historyItem,
    ...items.filter((item) => item.id !== historyItem.id),
  ]);
}

export function toggleHistoryFavorite(items: HistoryItem[], id: string): HistoryItem[] {
  return normalizeItems(
    items.map((item) =>
      item.id === id ? { ...item, favorite: !item.favorite } : item,
    ),
  );
}

export function removeHistoryItem(items: HistoryItem[], id: string): HistoryItem[] {
  return normalizeItems(items.filter((item) => item.id !== id));
}

function normalizeForMatching(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function tokenize(value: string): Set<string> {
  const normalized = normalizeForMatching(value);
  const tokens = new Set<string>();

  for (const token of normalized.split(/\s+/).filter(Boolean)) {
    if (/^[\p{Script=Han}]+$/u.test(token)) {
      for (const char of token) {
        tokens.add(char);
      }

      for (let i = 0; i < token.length - 1; i += 1) {
        tokens.add(token.slice(i, i + 2));
      }
    } else if (token.length >= 3) {
      tokens.add(token);
    }
  }

  return tokens;
}

function createFavoriteHint(item: HistoryItem, score: number): FavoriteReuseHint {
  return {
    id: item.id,
    kind: item.kind,
    expression: item.output,
    meaning: item.input,
    context: item.context,
    score,
  };
}

function scoreFavorite(item: HistoryItem, inputTokens: Set<string>, normalizedInput: string): number {
  const haystack = normalizeForMatching(`${item.input} ${item.output} ${item.context ?? ''}`);
  const favoriteTokens = tokenize(haystack);
  let score = 0;

  for (const token of inputTokens) {
    if (favoriteTokens.has(token)) {
      score += token.length > 1 ? 2 : 1;
    }
  }

  const expression = normalizeForMatching(item.kind === 'explain' ? item.input : item.output);
  if (expression && normalizedInput.includes(expression)) {
    score += 6;
  }

  return score;
}

export function getFavoriteReuseHints(
  items: HistoryItem[],
  input: string,
  limit = MAX_REUSE_HINTS,
): FavoriteReuseHint[] {
  const normalizedInput = normalizeForMatching(input);
  if (!normalizedInput) return [];

  const inputTokens = tokenize(input);
  if (inputTokens.size === 0) return [];

  return items
    .filter((item) => item.favorite && item.kind === 'optimize')
    .map((item) => createFavoriteHint(item, scoreFavorite(item, inputTokens, normalizedInput)))
    .filter((hint) => hint.score >= 2)
    .sort((a, b) => b.score - a.score || b.expression.length - a.expression.length)
    .slice(0, limit);
}
