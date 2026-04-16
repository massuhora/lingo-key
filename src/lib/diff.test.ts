import { describe, it, expect } from 'vitest';
import { diffText } from './diff';

describe('diffText', () => {
  it('returns empty array for two empty strings', () => {
    expect(diffText('', '')).toEqual([]);
  });

  it('marks all text as insert when original is empty', () => {
    expect(diffText('', 'hello')).toEqual([
      { type: 'insert', value: 'hello' },
    ]);
  });

  it('marks all text as delete when optimized is empty', () => {
    expect(diffText('hello', '')).toEqual([
      { type: 'delete', value: 'hello' },
    ]);
  });

  it('returns single equal chunk for identical strings', () => {
    expect(diffText('hello world', 'hello world')).toEqual([
      { type: 'equal', value: 'hello world' },
    ]);
  });

  it('detects a simple word replacement', () => {
    const result = diffText('hello world', 'hello there');
    expect(result).toEqual([
      { type: 'equal', value: 'hello ' },
      { type: 'delete', value: 'world' },
      { type: 'insert', value: 'there' },
    ]);
  });

  it('detects added words at the end', () => {
    const result = diffText('hello', 'hello world');
    expect(result).toEqual([
      { type: 'equal', value: 'hello' },
      { type: 'insert', value: ' world' },
    ]);
  });

  it('detects removed words at the beginning', () => {
    const result = diffText('say hello', 'hello');
    expect(result).toEqual([
      { type: 'delete', value: 'say ' },
      { type: 'equal', value: 'hello' },
    ]);
  });

  it('handles punctuation differences as word replacements', () => {
    const result = diffText('hello world', 'hello world.');
    // Word-level diff treats 'world' vs 'world.' as a replacement
    expect(result).toEqual([
      { type: 'equal', value: 'hello ' },
      { type: 'delete', value: 'world' },
      { type: 'insert', value: 'world.' },
    ]);
  });

  it('handles multiple scattered changes', () => {
    const result = diffText('the quick brown fox', 'the slow brown dog');
    expect(result).toEqual([
      { type: 'equal', value: 'the ' },
      { type: 'delete', value: 'quick' },
      { type: 'insert', value: 'slow' },
      { type: 'equal', value: ' brown ' },
      { type: 'delete', value: 'fox' },
      { type: 'insert', value: 'dog' },
    ]);
  });

  it('is case-sensitive', () => {
    const result = diffText('Hello', 'hello');
    expect(result).toEqual([
      { type: 'delete', value: 'Hello' },
      { type: 'insert', value: 'hello' },
    ]);
  });
});
