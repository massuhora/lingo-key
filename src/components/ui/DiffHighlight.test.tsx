import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DiffHighlight } from './DiffHighlight';

describe('DiffHighlight', () => {
  it('renders replacements as separate delete and insert blocks', () => {
    render(<DiffHighlight original="hello world" optimized="hello there" />);

    const deleted = screen.getByText('world');
    const inserted = screen.getByText('there');

    expect(deleted.tagName).toBe('DEL');
    expect(inserted.tagName).toBe('INS');
  });

  it('renders insert-only changes without mixing with original text', () => {
    render(<DiffHighlight original="hello" optimized="hello world" />);

    expect(screen.getByText('hello')).toBeInTheDocument();
    const inserted = screen.getByText(
      (_content, element) =>
        element?.tagName === 'INS' && element.textContent === 'world',
    );
    expect(inserted.tagName).toBe('INS');
  });

  it('keeps whitespace-bridged replacements in a single correction flow', () => {
    render(
      <DiffHighlight
        original="Today, we're introducing Codex."
        optimized="Today, we are introducing Codex."
      />,
    );

    const deleted = screen.getByText("we're", { exact: false });
    const inserted = screen.getByText(
      (_content, element) =>
        element?.tagName === 'INS' && element.textContent === 'we are',
    );

    expect(deleted.tagName).toBe('DEL');
    expect(deleted).toHaveClass('line-through');
    expect(inserted.tagName).toBe('INS');
  });
});
