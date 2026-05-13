import { describe, expect, it } from 'vitest';
import type { HistoryItem } from '../types';
import {
  removeHistoryItem,
  toggleHistoryFavorite,
  upsertHistoryItem,
} from './history';

function item(overrides: Partial<HistoryItem>): HistoryItem {
  return {
    id: 'item-1',
    kind: 'optimize',
    input: '原文',
    output: 'Original text.',
    createdAt: 100,
    favorite: false,
    ...overrides,
  };
}

describe('history helpers', () => {
  it('adds a new history item at the top', () => {
    const items = upsertHistoryItem([], {
      kind: 'optimize',
      input: '  帮我修复这个 bug  ',
      output: 'Help me fix this bug.  ',
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      kind: 'optimize',
      input: '帮我修复这个 bug',
      output: 'Help me fix this bug.',
      favorite: false,
    });
  });

  it('deduplicates matching input and output while preserving favorite state', () => {
    const existing = item({ favorite: true, createdAt: 100 });
    const items = upsertHistoryItem([existing], {
      kind: 'optimize',
      input: existing.input,
      output: existing.output,
    });

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(existing.id);
    expect(items[0].favorite).toBe(true);
    expect(items[0].createdAt).toBeGreaterThanOrEqual(existing.createdAt);
  });

  it('toggles favorites and removes items', () => {
    const first = item({ id: 'first' });
    const second = item({ id: 'second' });

    const toggled = toggleHistoryFavorite([first, second], 'second');
    expect(toggled.find((entry) => entry.id === 'second')?.favorite).toBe(true);

    const removed = removeHistoryItem(toggled, 'first');
    expect(removed.map((entry) => entry.id)).toEqual(['second']);
  });
});
