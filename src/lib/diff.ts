import type { DiffChunk } from '../types';

function tokenize(text: string): string[] {
  // Split by whitespace while keeping the delimiters as separate tokens
  return text.split(/(\s+)/).filter((t) => t.length > 0);
}

/**
 * A simple word-level diff that produces equal/insert/delete chunks.
 * This is a basic greedy algorithm sufficient for MVP.
 */
export function diffText(oldText: string, newText: string): DiffChunk[] {
  const oldTokens = tokenize(oldText);
  const newTokens = tokenize(newText);
  const chunks: DiffChunk[] = [];

  let i = 0;
  let j = 0;

  while (i < oldTokens.length || j < newTokens.length) {
    if (i >= oldTokens.length) {
      // All remaining new tokens are inserts
      const value = newTokens.slice(j).join('');
      chunks.push({ type: 'insert', value });
      break;
    }

    if (j >= newTokens.length) {
      // All remaining old tokens are deletes
      const value = oldTokens.slice(i).join('');
      chunks.push({ type: 'delete', value });
      break;
    }

    if (oldTokens[i] === newTokens[j]) {
      // Find consecutive equal tokens
      const startI = i;
      while (
        i < oldTokens.length &&
        j < newTokens.length &&
        oldTokens[i] === newTokens[j]
      ) {
        i++;
        j++;
      }
      const value = oldTokens.slice(startI, i).join('');
      chunks.push({ type: 'equal', value });
      continue;
    }

    // Tokens differ: try to find the next match with a small lookahead
    const lookAheadLimit = 8;
    let foundMatch = false;

    for (let offset = 1; offset <= lookAheadLimit; offset++) {
      if (
        i + offset < oldTokens.length &&
        oldTokens[i + offset] === newTokens[j]
      ) {
        // Tokens from i to i+offset-1 were deleted
        const value = oldTokens.slice(i, i + offset).join('');
        chunks.push({ type: 'delete', value });
        i += offset;
        foundMatch = true;
        break;
      }

      if (
        j + offset < newTokens.length &&
        oldTokens[i] === newTokens[j + offset]
      ) {
        // Tokens from j to j+offset-1 were inserted
        const value = newTokens.slice(j, j + offset).join('');
        chunks.push({ type: 'insert', value });
        j += offset;
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      // No nearby match: treat old as delete and new as insert
      chunks.push({ type: 'delete', value: oldTokens[i] });
      chunks.push({ type: 'insert', value: newTokens[j] });
      i++;
      j++;
    }
  }

  return mergeChunks(chunks);
}

function mergeChunks(chunks: DiffChunk[]): DiffChunk[] {
  const merged: DiffChunk[] = [];
  for (const chunk of chunks) {
    const last = merged[merged.length - 1];
    if (last && last.type === chunk.type) {
      last.value += chunk.value;
    } else {
      merged.push({ ...chunk });
    }
  }
  return merged;
}
