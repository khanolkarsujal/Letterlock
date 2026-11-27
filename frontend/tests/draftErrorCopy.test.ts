import { describe, expect, it } from "vitest";
import {
  buildDraftErrorCopy,
  type DraftErrorMeta,
} from "../src/ui/state/draftErrorCopy";

const KEEP_OPEN =
  "Your story and real details are still on this device. Keep this tab open: closing or refreshing it clears everything.";

function meta(overrides: Partial<DraftErrorMeta>): DraftErrorMeta {
  return {
    kind: "cloud_unreachable",
    timedOut: false,
    waitSeconds: 3,
    missing: [],
    unexpected: [],
    ...overrides,
  };
}

const BANNED_WORDS = ["service", "redaction", "bytes", "memory", "merge"];
const FORBIDDEN_CLAIMS = [
  "no dates",
  "100% protected",
  "completely safe",
  "nothing was sent",
];

function copyText(copy: ReturnType<typeof buildDraftErrorCopy>): string {
  return [copy.title, copy.subtitle ?? "", copy.tabNote, copy.details].join(" ");
}

const CASES: DraftErrorMeta[] = [
  meta({ kind: "cloud_unreachable", timedOut: true, waitSeconds: 30 }),
  meta({ kind: "cloud_unreachable", timedOut: false, waitSeconds: 4 }),
  meta({
    kind: "broken_placeholders",
    waitSeconds: 6,
    missing: ["{Phone 2}"],
    unexpected: ["{Address 1}"],
  }),
  meta({ kind: "local_failed", waitSeconds: 0 }),
  meta({ kind: "empty_or_refused", waitSeconds: 5 }),
];

describe("draft error copy", () => {
  for (const item of CASES) {
    it(`uses plain words and true claims for ${item.kind}`, () => {
      const copy = buildDraftErrorCopy(item);
      const text = copyText(copy).toLowerCase();

      for (const word of BANNED_WORDS) {
        expect(text).not.toContain(word);
      }
      for (const claim of FORBIDDEN_CLAIMS) {
        expect(text).not.toContain(claim);
      }

      expect(copy.tabNote).toContain(KEEP_OPEN);
      expect(copy.details).toContain("Error type:");
      expect(copy.details).toContain("Wait time:");
    });
  }

  it("only claims placeholder-only sending when a request was made", () => {
    const sent = buildDraftErrorCopy(
      meta({ kind: "empty_or_refused", waitSeconds: 5 }),
    );
    const local = buildDraftErrorCopy(meta({ kind: "local_failed" }));

    expect(sent.tabNote).toContain(
      "Only placeholders were sent, not your name, company or contact details.",
    );
    expect(local.tabNote).not.toContain("placeholders were sent");
  });

  it("reports the exact timeout wait", () => {
    const copy = buildDraftErrorCopy(
      meta({ kind: "cloud_unreachable", timedOut: true, waitSeconds: 30 }),
    );

    expect(copy.subtitle).toBe(
      "This is usually a connection problem. We waited 30 seconds.",
    );
    expect(copy.details).toContain("Error type: Timed out");
    expect(copy.details).toContain("Wait time: 30s");
  });

  it("lists only placeholder names for broken placeholders", () => {
    const copy = buildDraftErrorCopy(
      meta({
        kind: "broken_placeholders",
        waitSeconds: 7,
        missing: ["{Phone 2}"],
        unexpected: ["{Address 1}"],
      }),
    );

    expect(copy.details).toContain("Missing placeholders: {Phone 2}");
    expect(copy.details).toContain("Unknown placeholders: {Address 1}");
  });
});
