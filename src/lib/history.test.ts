import { describe, expect, it } from 'vitest';
import type { HistoryItem } from '../types';
import {
  getFavoriteReuseHints,
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

  it('can create a new history item as a favorite', () => {
    const items = upsertHistoryItem([], {
      kind: 'explain',
      input: 'flaky',
      output: '不稳定，偶发失败',
      favorite: true,
    });

    expect(items[0]).toMatchObject({
      kind: 'explain',
      favorite: true,
    });
  });

  it('toggles favorites and removes items', () => {
    const first = item({ id: 'first' });
    const second = item({ id: 'second' });

    const toggled = toggleHistoryFavorite([first, second], 'second');
    expect(toggled.find((entry) => entry.id === 'second')?.favorite).toBe(true);

    const removed = removeHistoryItem(toggled, 'first');
    expect(removed.map((entry) => entry.id)).toEqual(['second']);
  });

  it('suggests matching favorite expressions for reuse', () => {
    const hints = getFavoriteReuseHints(
      [
        item({
          id: 'flaky',
          input: '这个测试有时候通过有时候失败，很不稳定',
          output: 'This test is flaky.',
          favorite: true,
        }),
        item({
          id: 'ignored',
          input: '更新文档',
          output: 'Update the docs.',
          favorite: false,
        }),
      ],
      '这个测试有时候通过有时候失败，很不稳定',
    );

    expect(hints).toHaveLength(1);
    expect(hints[0]).toMatchObject({
      id: 'flaky',
      expression: 'This test is flaky.',
      meaning: '这个测试有时候通过有时候失败，很不稳定',
    });
  });

  it('does not surface original text from explanation favorites as reusable polish text', () => {
    const hints = getFavoriteReuseHints(
      [
        item({
          id: 'explain-source',
          kind: 'explain',
          input: 'this are wrong',
          output: '这句话有语法问题',
          favorite: true,
        }),
      ],
      '这句话有语法问题',
    );

    expect(hints).toEqual([]);
  });
});
