import type { PlaceholderKind } from "../redaction";
import type { RuleMatch, TextRange } from "./types";

/**
 * Rules-based detection. It never talks to the cloud and works when no local
 * model is available.
 *
 * Scope follows F6: email addresses, phone numbers and account numbers. Names,
 * addresses, dates and amounts are the on-device model's job.
 */

interface Rule {
  readonly kind: PlaceholderKind;
  readonly pattern: RegExp;
  readonly accept?: (value: string) => boolean;
}

function countDigits(value: string): number {
  const matches = value.match(/\d/g);
  return matches ? matches.length : 0;
}

function isDateLike(value: string): boolean {
  return (
    /\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b/.test(value) ||
    /\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b/.test(value)
  );
}

function isPhone(value: string): boolean {
  const digits = countDigits(value);
  if (digits < 7 || digits > 15) return false;
  if (isDateLike(value)) return false;
  // Looks like a pair of years, not a phone number.
  if (/^\d{4}(?:[\s.-]\d{4})+$/.test(value)) return false;

  // Explicit international or area-code formats are trusted.
  if (value.trim().startsWith("+") || value.includes("(")) return true;

  // Bare grouped numbers need at least 9 digits; this avoids amounts such as
  // "1 200 000" and keeps short local numbers to the on-device model.
  return digits >= 9 && digits <= 15;
}

function compactIdentifier(value: string): string {
  return value.replace(/[\s-]/g, "");
}

function isAccount(value: string): boolean {
  const compact = compactIdentifier(value);

  if (/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/i.test(compact)) {
    return true;
  }

  if (/^[A-Z]{4}0[A-Z0-9]{6}$/.test(compact)) {
    return true;
  }

  if (/^[A-Z]{2,5}-\d{4,10}$/i.test(value.trim())) {
    return true;
  }

  const digits = countDigits(value);
  return digits >= 8 && digits <= 17;
}

function createRules(): Rule[] {
  return [
    {
      kind: "person",
      pattern: /\b(?:my name is|name is|i am|i['’]m)\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){0,3})/gi,
    },
    {
      kind: "person",
      pattern: /\b(?:Mr|Mrs|Ms|Miss|Mx|Dr)\.?\s+[A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?/g,
    },
    {
      kind: "email",
      pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    },
    {
      kind: "phone",
      pattern: /\+\d[\d\s().-]{5,18}\d/g,
      accept: isPhone,
    },
    {
      kind: "phone",
      pattern: /\(\d{2,4}\)[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g,
      accept: isPhone,
    },
    {
      kind: "phone",
      pattern: /\b\d{2,5}(?:[\s.-]\d{2,5}){1,4}\b/g,
      accept: isPhone,
    },
    {
      kind: "phone",
      pattern: /\b\d{10}\b/g,
      accept: isPhone,
    },
    {
      kind: "account",
      pattern: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
      accept: isAccount,
    },
    {
      kind: "account",
      pattern: /\b[A-Z]{2,5}-\d{4,10}\b/g,
      accept: isAccount,
    },
    {
      kind: "account",
      pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/gi,
      accept: isAccount,
    },
    {
      kind: "account",
      pattern: /\b\d{4}(?:[\s-]\d{4}){3}\b/g,
      accept: isAccount,
    },
    {
      kind: "account",
      pattern: /\b\d{8,17}\b/g,
      accept: isAccount,
    },
  ];
}

function overlaps(start: number, end: number, ranges: readonly TextRange[]): boolean {
  return ranges.some((range) => start < range.end && range.start < end);
}

/**
 * Runs every rule in priority order and drops matches that overlap a higher
 * priority match. This keeps, for example, a 10-digit phone number from being
 * reported as both a phone and an account number.
 */
export function detectWithRules(story: string): RuleMatch[] {
  const accepted: RuleMatch[] = [];
  const ranges: TextRange[] = [];

  for (const rule of createRules()) {
    for (const match of story.matchAll(rule.pattern)) {
      if (match.index === undefined) continue;

      const value =
        rule.kind === "person" && match[1] ? match[1] : match[0];
      const valueOffset =
        rule.kind === "person" && match[1]
          ? match[0].indexOf(match[1], 0)
          : 0;
      if (rule.accept && !rule.accept(value)) continue;

      const start = match.index + valueOffset;
      const end = start + value.length;
      if (overlaps(start, end, ranges)) continue;

      accepted.push({ value, kind: rule.kind, start, end });
      ranges.push({ start, end });
    }
  }

  return accepted;
}
