import type {
  DetectedValue,
  DetectionSource,
  RawDetection,
  RuleMatch,
  TextRange,
} from "./types";

interface MutableDetection {
  value: string;
  kind: DetectedValue["kind"];
  occurrences: TextRange[];
  sources: DetectionSource[];
}

function uniqueRanges(ranges: readonly TextRange[]): TextRange[] {
  const seen = new Set<string>();
  const result: TextRange[] = [];

  for (const range of ranges) {
    const key = `${range.start}:${range.end}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ start: range.start, end: range.end });
  }

  return result.sort((a, b) => a.start - b.start || a.end - b.end);
}

function overlaps(range: TextRange, accepted: readonly TextRange[]): boolean {
  return accepted.some(
    (other) => range.start < other.end && other.start < range.end,
  );
}

function toDetectedValue(item: MutableDetection): DetectedValue {
  return {
    value: item.value,
    kind: item.kind,
    occurrences: uniqueRanges(item.occurrences),
    sources: [...item.sources],
  };
}

/** Finds every case-insensitive occurrence of a value inside the story. */
export function locateOccurrences(story: string, value: string): TextRange[] {
  const needle = value.toLocaleLowerCase();
  if (!needle) return [];

  const haystack = story.toLocaleLowerCase();
  const ranges: TextRange[] = [];
  let from = 0;

  while (from <= haystack.length - needle.length) {
    const index = haystack.indexOf(needle, from);
    if (index === -1) break;
    ranges.push({ start: index, end: index + value.length });
    from = index + needle.length;
  }

  return ranges;
}

/** Groups local rule matches into one entry per distinct value. */
export function collectRuleDetections(
  matches: readonly RuleMatch[],
): DetectedValue[] {
  const byValue = new Map<string, MutableDetection>();

  for (const match of matches) {
    const key = match.value.toLocaleLowerCase();
    const existing = byValue.get(key);

    if (existing) {
      existing.occurrences.push({ start: match.start, end: match.end });
    } else {
      byValue.set(key, {
        value: match.value,
        kind: match.kind,
        occurrences: [{ start: match.start, end: match.end }],
        sources: ["rules"],
      });
    }
  }

  return [...byValue.values()].map(toDetectedValue);
}

/**
 * Turns the model's raw values into located detections.
 *
 * The model never supplies offsets: each value is located inside the story and
 * replaced by the exact story slice, so a fabricated value or a wrong casing
 * can never create a range that points outside the original text.
 */
export function collectModelDetections(
  raw: readonly RawDetection[],
  story: string,
): DetectedValue[] {
  const byValue = new Map<string, MutableDetection>();

  for (const item of raw) {
    const candidate = item.value.trim();
    if (candidate.length < 2 || candidate.length >= story.length) continue;
    if (!/[A-Za-z0-9\u00C0-\u024F]/.test(candidate)) continue;

    const occurrences = locateOccurrences(story, candidate);
    if (occurrences.length === 0) continue;

    const canonical = story.slice(occurrences[0].start, occurrences[0].end);
    const key = canonical.toLocaleLowerCase();
    const existing = byValue.get(key);

    if (existing) {
      existing.occurrences.push(...occurrences);
    } else {
      byValue.set(key, {
        value: canonical,
        kind: item.kind,
        occurrences: [...occurrences],
        sources: ["on_device"],
      });
    }
  }

  return [...byValue.values()].map(toDetectedValue);
}

/**
 * Merges detections from several sources and removes redundant entries.
 *
 * Longer values win and keep their ranges. A shorter value is kept only if it
 * still has at least one occurrence outside the longer values, so a standalone
 * `Rao` is not lost when `Mr Rao` is also detected. Values whose every
 * occurrence is covered by a longer value are dropped, which prevents tokens
 * that would never appear in the outgoing text.
 */
export function mergeDetections(
  ...groups: ReadonlyArray<readonly DetectedValue[]>
): DetectedValue[] {
  const byValue = new Map<string, MutableDetection>();

  for (const group of groups) {
    for (const item of group) {
      const key = item.value.toLocaleLowerCase();
      const existing = byValue.get(key);

      if (existing) {
        existing.occurrences.push(...item.occurrences);
        for (const source of item.sources) {
          if (!existing.sources.includes(source)) {
            existing.sources.push(source);
          }
        }
      } else {
        byValue.set(key, {
          value: item.value,
          kind: item.kind,
          occurrences: [...item.occurrences],
          sources: [...item.sources],
        });
      }
    }
  }

  const ordered = [...byValue.values()].sort((a, b) => {
    if (b.value.length !== a.value.length) {
      return b.value.length - a.value.length;
    }

    const aRules = a.sources.includes("rules") ? 0 : 1;
    const bRules = b.sources.includes("rules") ? 0 : 1;
    return aRules - bRules;
  });

  const accepted: MutableDetection[] = [];
  const acceptedRanges: TextRange[] = [];

  for (const candidate of ordered) {
    const occurrences = uniqueRanges(candidate.occurrences).filter(
      (range) => !overlaps(range, acceptedRanges),
    );

    if (occurrences.length === 0) continue;

    accepted.push({ ...candidate, occurrences });
    acceptedRanges.push(...occurrences);
  }

  return accepted
    .map(toDetectedValue)
    .sort((a, b) => a.occurrences[0].start - b.occurrences[0].start);
}
