/**
 * Redaction module.
 *
 * Owns the in-memory placeholder map, the text transforms, the pre-send check
 * and the returned-placeholder check. It is the only module that can produce
 * `ApprovedOutboundText`.
 *
 * Nothing here is persisted or logged: original values live only in the map
 * held in memory for the current tab.
 */

export const PLACEHOLDER_KINDS = [
  "person",
  "address",
  "date",
  "amount",
  "lease",
  "phone",
  "email",
  "account",
  "policy",
  "organization",
  "other",
] as const;

export type PlaceholderKind = (typeof PLACEHOLDER_KINDS)[number];

export function isPlaceholderKind(value: string): value is PlaceholderKind {
  return (PLACEHOLDER_KINDS as readonly string[]).includes(value);
}

export interface SensitiveValue {
  readonly value: string;
  readonly kind: PlaceholderKind;
}

export interface PlaceholderEntry extends SensitiveValue {
  /** Token such as `{Person A}`, `{Address 1}`. */
  readonly token: string;
}

/**
 * Text that has passed the redaction module, the user's explicit approval and
 * the pre-send check.
 *
 * The brand is only created inside `redactStory`, after the pre-send check has
 * passed, so the cloud drafting call cannot be given raw story text.
 */
export type ApprovedOutboundText = string & {
  readonly __brand: "ApprovedOutboundText";
};

export type RedactionErrorCode = "empty_value" | "leak";

export class RedactionError extends Error {
  constructor(
    message: string,
    public readonly code: RedactionErrorCode,
  ) {
    super(message);
    this.name = "RedactionError";
  }
}

export interface ReturnedPlaceholderCheck {
  readonly ok: boolean;
  /** Placeholders present in the outgoing text but missing from the letter. */
  readonly missing: readonly string[];
  /** Placeholders invented by the model that the app cannot restore. */
  readonly unexpected: readonly string[];
}

const TOKEN_STEMS: Record<Exclude<PlaceholderKind, "person">, string> = {
  address: "Address",
  date: "Date",
  amount: "Amount",
  lease: "Lease",
  phone: "Phone",
  email: "Email",
  account: "Account",
  policy: "Policy",
  organization: "Organization",
  other: "Detail",
};

// Matches exactly the tokens this module creates, so other braces in a letter
// are never mistaken for placeholders.
const TOKEN_SOURCE = String.raw`\{(?:Person [A-Z]+|(?:Address|Date|Amount|Lease|Phone|Email|Account|Policy|Organization|Detail) \d+)\}`;

function createTokenRegex(): RegExp {
  return new RegExp(TOKEN_SOURCE, "g");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Bijective base-26 suffix: 0 → A, 25 → Z, 26 → AA. */
function toPersonSuffix(index: number): string {
  let remaining = index;
  let suffix = "";
  do {
    suffix = String.fromCharCode(65 + (remaining % 26)) + suffix;
    remaining = Math.floor(remaining / 26) - 1;
  } while (remaining >= 0);
  return suffix;
}

function normalizeKey(value: string): string {
  return value.trim().toLocaleLowerCase();
}

/**
 * In-memory placeholder map.
 *
 * The same value always gets the same token. Removing a value frees it from
 * the map, so the next anonymization lets it through again (the UI uses this
 * when the user un-redacts a detail).
 */
export class RedactionMap {
  private readonly byValue = new Map<string, PlaceholderEntry>();
  private entriesList: PlaceholderEntry[] = [];
  private readonly counters = new Map<PlaceholderKind, number>();
  private personCount = 0;

  get size(): number {
    return this.entriesList.length;
  }

  get entries(): readonly PlaceholderEntry[] {
    return this.entriesList.map((entry) => ({ ...entry }));
  }

  add(value: string, kind: PlaceholderKind): PlaceholderEntry {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new RedactionError("A sensitive value cannot be empty.", "empty_value");
    }

    const key = normalizeKey(trimmed);
    const existing = this.byValue.get(key);
    if (existing) return existing;

    const entry: PlaceholderEntry = {
      value: trimmed,
      kind,
      token: this.nextToken(kind),
    };

    this.byValue.set(key, entry);
    this.entriesList.push(entry);
    return entry;
  }

  remove(value: string): boolean {
    const key = normalizeKey(value);
    const entry = this.byValue.get(key);
    if (!entry) return false;

    this.byValue.delete(key);
    this.entriesList = this.entriesList.filter((candidate) => candidate !== entry);
    return true;
  }

  clear(): void {
    this.byValue.clear();
    this.entriesList = [];
    this.counters.clear();
    this.personCount = 0;
  }

  /** Replaces every value in the story and returns approved outbound text. */
  redact(story: string): ApprovedOutboundText {
    return redactStory(story, this.entriesList);
  }

  /** Puts the real values back. Call only after `checkReturnedPlaceholders`. */
  restore(letter: string): string {
    return restoreText(letter, this.entriesList);
  }

  checkReturned(
    approvedText: ApprovedOutboundText,
    returnedLetter: string,
  ): ReturnedPlaceholderCheck {
    return checkReturnedPlaceholders(approvedText, returnedLetter);
  }

  private nextToken(kind: PlaceholderKind): string {
    if (kind === "person") {
      const suffix = toPersonSuffix(this.personCount);
      this.personCount += 1;
      return `{Person ${suffix}}`;
    }

    const next = (this.counters.get(kind) ?? 0) + 1;
    this.counters.set(kind, next);
    return `{${TOKEN_STEMS[kind]} ${next}}`;
  }
}

/**
 * Builds approved outbound text by replacing every entry value in the story.
 *
 * Replacement runs in a single pass ordered longest-first, so a shorter value
 * can never damage a longer one or a token that was already written. If any
 * original value survives outside the tokens, the call throws and no approved
 * text is produced.
 */
export function redactStory(
  story: string,
  entries: readonly PlaceholderEntry[],
): ApprovedOutboundText {
  if (entries.length === 0) {
    return story as ApprovedOutboundText;
  }

  if (entries.some((entry) => entry.value.trim() === "")) {
    throw new RedactionError("A sensitive value cannot be empty.", "empty_value");
  }

  const ordered = [...entries].sort((a, b) => b.value.length - a.value.length);
  const tokensByValue = new Map(
    ordered.map((entry) => [normalizeKey(entry.value), entry.token]),
  );
  const pattern = new RegExp(
    ordered.map((entry) => escapeRegExp(entry.value)).join("|"),
    "gi",
  );

  const redacted = story.replace(pattern, (match) => {
    return tokensByValue.get(normalizeKey(match)) ?? match;
  });

  if (findLeaks(redacted, entries).length > 0) {
    throw new RedactionError(
      "The outgoing text still contains sensitive values.",
      "leak",
    );
  }

  return redacted as ApprovedOutboundText;
}

/** Returns the original values that are still present outside the tokens. */
export function findLeaks(
  text: string,
  entries: readonly PlaceholderEntry[],
): string[] {
  const withoutTokens = text.replace(createTokenRegex(), " ");
  const haystack = withoutTokens.toLocaleLowerCase();

  return entries
    .filter((entry) => haystack.includes(entry.value.toLocaleLowerCase()))
    .map((entry) => entry.value);
}

/** Lists the distinct placeholder tokens present in a piece of text. */
export function extractPlaceholders(text: string): string[] {
  const matches = text.match(createTokenRegex());
  return matches ? [...new Set(matches)] : [];
}

/**
 * Invariant: a returned letter is accepted only if it contains every
 * placeholder from the approved text and no placeholder the app cannot
 * restore.
 */
export function checkReturnedPlaceholders(
  approvedText: string,
  returnedLetter: string,
): ReturnedPlaceholderCheck {
  const approved = new Set(extractPlaceholders(approvedText));
  const returned = new Set(extractPlaceholders(returnedLetter));

  const missing = [...approved].filter((token) => !returned.has(token));
  const unexpected = [...returned].filter((token) => !approved.has(token));

  return {
    ok: missing.length === 0 && unexpected.length === 0,
    missing,
    unexpected,
  };
}

/** Puts real values back into a letter. Use only after the returned check. */
export function restoreText(
  letter: string,
  entries: readonly PlaceholderEntry[],
): string {
  return entries.reduce(
    (restored, entry) => restored.split(entry.token).join(entry.value),
    letter,
  );
}
