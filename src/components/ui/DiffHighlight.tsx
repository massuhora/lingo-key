import { type ReactElement, useMemo } from "react";
import { cn } from "../../lib/utils";
import { diffText } from "../../lib/diff";

interface DiffHighlightProps {
  original: string;
  optimized: string;
  className?: string;
}

type DiffSegment =
  | { type: "equal"; value: string }
  | { type: "change"; deleted: string; inserted: string };

function hasUpcomingChangeBeforeText(
  chunks: ReturnType<typeof diffText>,
  startIndex: number,
): boolean {
  for (let index = startIndex; index < chunks.length; index += 1) {
    const chunk = chunks[index];

    if (chunk.type !== "equal") {
      return true;
    }

    if (chunk.value.trim().length > 0) {
      return false;
    }
  }

  return false;
}

function groupDiffSegments(original: string, optimized: string): DiffSegment[] {
  const chunks = diffText(original, optimized);
  const segments: DiffSegment[] = [];

  for (let index = 0; index < chunks.length; index += 1) {
    const chunk = chunks[index];

    if (chunk.type === "equal") {
      segments.push({ type: "equal", value: chunk.value });
      continue;
    }

    let deleted = "";
    let inserted = "";

    for (; index < chunks.length; index += 1) {
      const current = chunks[index];

      if (current.type === "delete") {
        deleted += current.value;
        continue;
      }

      if (current.type === "insert") {
        inserted += current.value;
        continue;
      }

      if (
        current.value.trim().length === 0 &&
        hasUpcomingChangeBeforeText(chunks, index + 1)
      ) {
        deleted += current.value;
        inserted += current.value;
        continue;
      }

      index -= 1;
      break;
    }

    segments.push({ type: "change", deleted, inserted });
  }

  return segments;
}

function splitEdgeWhitespace(value: string) {
  const match = value.match(/^(\s*)(.*?)(\s*)$/s);

  return {
    leading: match?.[1] ?? "",
    core: match?.[2] ?? "",
    trailing: match?.[3] ?? "",
  };
}

function renderMarkedText(
  value: string,
  variant: "delete" | "insert",
): ReactElement {
  const { leading, core, trailing } = splitEdgeWhitespace(value);

  if (!core) {
    return <span>{value}</span>;
  }

  const classes =
    variant === "delete"
      ? "rounded-md bg-destructive/10 px-1.5 py-0.5 text-destructive line-through decoration-2 decoration-destructive/80"
      : "rounded-md bg-accent/12 px-1.5 py-0.5 font-medium text-accent no-underline";

  const Tag = variant === "delete" ? "del" : "ins";

  return (
    <>
      {leading && <span>{leading}</span>}
      <Tag className={cn("whitespace-pre-wrap break-words", classes)}>
        {core}
      </Tag>
      {trailing && <span>{trailing}</span>}
    </>
  );
}

export function DiffHighlight({
  original,
  optimized,
  className,
}: DiffHighlightProps) {
  const segments = useMemo(
    () => groupDiffSegments(original, optimized),
    [original, optimized],
  );

  return (
    <div
      className={cn(
        "whitespace-pre-wrap break-words text-sm leading-7 text-foreground",
        className,
      )}
    >
      {segments.map((segment, index) => {
        if (segment.type === "equal") {
          return <span key={index}>{segment.value}</span>;
        }

        return (
          <span key={index} className="inline align-baseline">
            {segment.deleted && renderMarkedText(segment.deleted, "delete")}
            {segment.inserted && renderMarkedText(segment.inserted, "insert")}
          </span>
        );
      })}
    </div>
  );
}
