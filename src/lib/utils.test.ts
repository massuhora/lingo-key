import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('concatenates all provided class names', () => {
    expect(cn('px-2', 'px-4')).toBe('px-2 px-4');
  });

  it('handles object syntax', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });
});
