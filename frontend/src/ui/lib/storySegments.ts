import type { PlaceholderEntry } from "../../redaction";

export interface TextSegment {
  readonly text: string;
  readonly highlighted: boolean;
  readonly token: boolean;
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightOriginalStory(
  story: string,
  entries: readonly PlaceholderEntry[],
): TextSegment[] {
  if (!story) return [];
  if (entries.length === 0) return [{ text: story, highlighted: false, token: false }];

  const ordered = [...entries].sort((a, b) => b.value.length - a.value.length);
  const pattern = new RegExp(
    ordered.map((entry) => escapeRegExp(entry.value)).join("|"),
    "gi",
  );

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const match of story.matchAll(pattern)) {
    const start = match.index;
    if (start === undefined) continue;
    if (start > cursor) {
      segments.push({
        text: story.slice(cursor, start),
        highlighted: false,
        token: false,
      });
    }

    segments.push({
      text: story.slice(start, start + match[0].length),
      highlighted: true,
      token: false,
    });
    cursor = start + match[0].length;
  }

  if (cursor < story.length) {
    segments.push({
      text: story.slice(cursor),
      highlighted: false,
      token: false,
    });
  }

  return segments;
}

export function highlightRedactedStory(
  redactedStory: string,
  entries: readonly PlaceholderEntry[],
): TextSegment[] {
  if (!redactedStory) return [];
  if (entries.length === 0) {
    return [{ text: redactedStory, highlighted: false, token: false }];
  }

  const tokens = new Set(entries.map((entry) => entry.token));
  const pattern = /\{(?:Person [A-Z]+|(?:Address|Date|Amount|Lease|Phone|Email|Account|Policy|Organization|Detail) \d+)\}/g;
  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const match of redactedStory.matchAll(pattern)) {
    const start = match.index;
    if (start === undefined) continue;
    if (start > cursor) {
      segments.push({
        text: redactedStory.slice(cursor, start),
        highlighted: false,
        token: false,
      });
    }

    const text = match[0];
    const recognized = tokens.has(text);
    segments.push({
      text,
      highlighted: recognized,
      token: recognized,
    });
    cursor = start + text.length;
  }

  if (cursor < redactedStory.length) {
    segments.push({
      text: redactedStory.slice(cursor),
      highlighted: false,
      token: false,
    });
  }

  return segments;
}
