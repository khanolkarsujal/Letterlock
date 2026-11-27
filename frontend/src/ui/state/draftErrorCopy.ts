export type DraftErrorKind =
  | "cloud_unreachable"
  | "broken_placeholders"
  | "local_failed"
  | "empty_or_refused";

/**
 * Structured description of one failed drafting attempt. Built only from
 * error codes and placeholder tokens, never from real personal values.
 */
export interface DraftErrorMeta {
  readonly kind: DraftErrorKind;
  readonly timedOut: boolean;
  readonly waitSeconds: number;
  readonly missing: readonly string[];
  readonly unexpected: readonly string[];
}

export interface DraftErrorCopy {
  readonly title: string;
  readonly subtitle?: string;
  readonly tabNote: string;
  readonly details: string;
}

const KEEP_OPEN_NOTE =
  "Your story and real details are still on this device. Keep this tab open: closing or refreshing it clears everything.";

const PLACEHOLDERS_ONLY_NOTE =
  "Only placeholders were sent, not your name, company or contact details.";

function waitLabel(seconds: number): string {
  return seconds <= 0 ? "under 1s" : `${seconds}s`;
}

function waitSentence(seconds: number): string {
  const safe = Math.max(1, seconds);
  return `We waited ${safe} ${safe === 1 ? "second" : "seconds"}.`;
}

function typeLabel(meta: DraftErrorMeta): string {
  if (meta.kind === "cloud_unreachable" && meta.timedOut) return "Timed out";
  switch (meta.kind) {
    case "broken_placeholders":
      return "Placeholder mismatch";
    case "local_failed":
      return "Local step failed";
    case "empty_or_refused":
      return "Empty or refused answer";
    default:
      return "Couldn't reach the AI";
  }
}

function buildDetails(meta: DraftErrorMeta): string {
  const lines = [
    `Error type: ${typeLabel(meta)}`,
    `Wait time: ${waitLabel(meta.waitSeconds)}`,
  ];

  if (meta.kind === "broken_placeholders") {
    if (meta.missing.length > 0) {
      lines.push(`Missing placeholders: ${meta.missing.join(", ")}`);
    }
    if (meta.unexpected.length > 0) {
      lines.push(`Unknown placeholders: ${meta.unexpected.join(", ")}`);
    }
  }

  return lines.join("\n");
}

export function buildDraftErrorCopy(meta: DraftErrorMeta): DraftErrorCopy {
  const details = buildDetails(meta);
  const privacyNote = `${PLACEHOLDERS_ONLY_NOTE}\n${KEEP_OPEN_NOTE}`;

  switch (meta.kind) {
    case "broken_placeholders":
      return {
        title: "The letter couldn't be put together",
        subtitle: "The AI left out or changed one of the placeholders.",
        tabNote: privacyNote,
        details,
      };

    case "local_failed":
      return {
        title: "We couldn't get the letter ready on this device",
        subtitle: "Try again, or go back to check your story and details.",
        tabNote: KEEP_OPEN_NOTE,
        details,
      };

    case "empty_or_refused":
      return {
        title: "The AI didn't write an answer",
        subtitle: "It returned an empty or refused answer.",
        tabNote: privacyNote,
        details,
      };

    case "cloud_unreachable":
    default:
      return {
        title: "Couldn't reach the AI",
        subtitle: meta.timedOut
          ? `This is usually a connection problem. ${waitSentence(meta.waitSeconds)}`
          : "This is usually a connection problem.",
        tabNote: privacyNote,
        details,
      };
  }
}
