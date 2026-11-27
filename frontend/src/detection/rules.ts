import type { PlaceholderKind } from "../redaction";
import type { RuleMatch, TextRange } from "./types";

/**
 * Rules-based detection. It never talks to the cloud and works when no local
 * model is available.
 *
 * Scope: emails, phones, accounts/IFSC, reference IDs, organizations, and
 * person names via trigger words and capitalized name pairs.
 */

interface Rule {
  readonly kind: PlaceholderKind;
  readonly pattern: RegExp;
  readonly accept?: (value: string) => boolean;
}

const ORG_SUFFIXES = new Set([
  "solutions",
  "pvt",
  "ltd",
  "limited",
  "inc",
  "llc",
  "corp",
  "technologies",
  "bank",
  "insurance",
  "hospital",
  "clinic",
  "properties",
  "realty",
]);

const NON_PERSON_WORDS = new Set([
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
  "street",
  "road",
  "lane",
  "avenue",
  "boulevard",
  "drive",
  "nagar",
  "colony",
  "sector",
  "apartment",
  "flat",
  "floor",
  "subject",
  "request",
  "salary",
  "payment",
  "correction",
  "deposit",
  "return",
  "notice",
  "medical",
  "bill",
  "insurance",
  "claim",
  "employee",
  "bank",
  "account",
  "ifsc",
  "code",
  "dear",
  "sir",
  "madam",
  "hello",
  "regards",
  "sincerely",
  "thanks",
]);

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

  const digits = countDigits(value);
  return digits >= 8 && digits <= 17;
}

function isReferenceId(value: string): boolean {
  const trimmed = value.trim();
  if (/^(?:FY|Q[1-4])-\d{4}$/i.test(trimmed)) {
    return false;
  }
  return /^[A-Z]{2,5}-\d{4,10}$/.test(trimmed);
}

function isPersonCandidate(value: string): boolean {
  const words = value.trim().split(/\s+/);
  if (words.length === 0) return false;
  return words.every((word) => {
    const clean = word.replace(/[.,'’\-]/g, "").toLocaleLowerCase();
    return (
      clean.length >= 2 &&
      !NON_PERSON_WORDS.has(clean) &&
      !ORG_SUFFIXES.has(clean)
    );
  });
}

function isOrganizationCandidate(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 3) return false;
  const words = trimmed.split(/\s+/);
  const firstClean = words[0]?.replace(/[.,'’]/g, "").toLocaleLowerCase() ?? "";
  return !NON_PERSON_WORDS.has(firstClean);
}

function createRules(): Rule[] {
  return [
    // 1. Organizations (run before person name-pair rules so company names stay organizations)
    {
      kind: "organization",
      pattern:
        /\b([A-Z][A-Za-z0-9&'.-]+(?:\s+(?:of|and|&|[A-Z][A-Za-z0-9&'.-]+)){0,4}\s+(?:Solutions|Pvt\.?\s+Ltd\.?|Pvt\.?|Ltd\.?|Limited|Inc\.?|LLC|Corp\.?|Technologies|Bank|Insurance|Hospital|Clinic|Properties|Realty))\b/g,
      accept: isOrganizationCandidate,
    },
    {
      kind: "organization",
      pattern:
        /\b(?:[Ww]orked\s+at|[Ee]mployed\s+by|[Ee]mployed\s+at|[Ii]nsured\s+with)\s+([A-Z][A-Za-z0-9&'.-]+(?:\s+[A-Z][A-Za-z0-9&'.-]+){0,3})/g,
      accept: isOrganizationCandidate,
    },
    // 2. Person names after explicit triggers, titles, or closings (no /i flag so [A-Z] only matches capitalized words)
    {
      kind: "person",
      pattern:
        /\b(?:[Mm]y\s+name\s+is|[Nn]ame\s+is|I\s+am|I['’]m)\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){0,3})/g,
    },
    {
      kind: "person",
      pattern:
        /\b(?:Mr|Mrs|Ms|Miss|Mx|Dr)\.?\s+[A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?/g,
    },
    {
      kind: "person",
      pattern:
        /\b(?:[Mm]anager|[Ll]andlord|[Ee]mployer|[Ss]upervisor|[Dd]octor|[Cc]ontact|[Aa]sk\s+for|[Ss]igned\s+by)[,:\s]+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){0,2})/g,
      accept: isPersonCandidate,
    },
    {
      kind: "person",
      pattern:
        /\b(?:[Rr]egards|[Ss]incerely|[Tt]hanks|[Tt]hank\s+you|[Ww]arm\s+regards|[Bb]est\s+regards)[,\s]+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){1,2})/g,
      accept: isPersonCandidate,
    },
    // 3. Capitalized two-word person name pairs (after orgs & triggers, filtered by stoplist)
    {
      kind: "person",
      pattern: /\b([A-Z][a-z]{1,20}\s+[A-Z][a-z]{1,20})\b/g,
      accept: isPersonCandidate,
    },
    // 4. Emails, phones, reference IDs, and accounts
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
      kind: "reference",
      pattern: /\b[A-Z]{2,5}-\d{4,10}\b/g,
      accept: isReferenceId,
    },
    {
      kind: "account",
      pattern: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
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
 * priority match.
 */
export function detectWithRules(story: string): RuleMatch[] {
  const accepted: RuleMatch[] = [];
  const ranges: TextRange[] = [];

  for (const rule of createRules()) {
    for (const match of story.matchAll(rule.pattern)) {
      if (match.index === undefined) continue;

      const value =
        (rule.kind === "person" || rule.kind === "organization") && match[1]
          ? match[1]
          : match[0];
      const valueOffset =
        (rule.kind === "person" || rule.kind === "organization") && match[1]
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
