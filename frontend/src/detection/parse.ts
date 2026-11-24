import { z } from "zod";
import { isPlaceholderKind } from "../redaction";
import type { RawDetection } from "./types";

/**
 * Validates the on-device model's output as untrusted input.
 *
 * The model may wrap JSON in markdown fences or add surrounding text, so a
 * tolerant extraction runs first. Everything after that is strict: shape,
 * value length and a bounded number of entries. Unknown kinds degrade to
 * `other` (still redacted) instead of being trusted as-is.
 */

export class DetectionParseError extends Error {
  constructor() {
    super("The on-device model did not return valid detection JSON.");
    this.name = "DetectionParseError";
  }
}

const MAX_VALUES = 100;
const MAX_VALUE_LENGTH = 200;

const ItemSchema = z.object({
  value: z.string().trim().min(2).max(MAX_VALUE_LENGTH),
  kind: z.string(),
});

const ResponseSchema = z.object({
  values: z.array(z.unknown()).max(MAX_VALUES),
});

function extractJsonObject(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end <= start) {
    throw new DetectionParseError();
  }

  return candidate.slice(start, end + 1);
}

export function parseDetectionResponse(raw: string): RawDetection[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(extractJsonObject(raw));
  } catch {
    throw new DetectionParseError();
  }

  const result = ResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new DetectionParseError();
  }

  const values: RawDetection[] = [];

  for (const candidate of result.data.values) {
    const item = ItemSchema.safeParse(candidate);
    if (!item.success) continue;

    values.push({
      value: item.data.value,
      kind: isPlaceholderKind(item.data.kind) ? item.data.kind : "other",
    });
  }

  // A non-empty response where every entry is invalid is a broken response,
  // not an empty detection. Treat it as untrusted so the caller falls back to
  // rules only.
  if (result.data.values.length > 0 && values.length === 0) {
    throw new DetectionParseError();
  }

  return values;
}
