import { describe, expect, it, vi } from "vitest";

/**
 * Audit test: capture the exact outgoing cloud request and fail if any value
 * that detection marked as sensitive appears inside it.
 *
 * This is a read-only audit artifact. It does not change app behaviour.
 */

const { capturedRequests, generateContentMock } = vi.hoisted(() => {
  const capturedRequests: Array<Record<string, unknown>> = [];

  const generateContentMock = vi.fn(
    async (request: Record<string, unknown>) => {
      capturedRequests.push(request);
      const contents = request?.contents as
        | Array<{ parts?: Array<{ text?: string }> }>
        | undefined;
      const userText = contents?.[0]?.parts?.[0]?.text ?? "";
      const tokenRe =
        /\{(?:Person [A-Z]+|(?:Address|Date|Amount|Lease|Phone|Email|Account|Policy|Organization|Reference|Detail) \d+)\}/g;
      const tokens = [
        ...new Set((userText.match(tokenRe) ?? []) as string[]),
      ];

      return {
        response: {
          text: () =>
            `Subject: Audit draft\n\nDear Sir,\n\n${tokens.join(", ")}\n\nSincerely,\n[Recipient Name]`,
          inferenceSource: "IN_CLOUD",
        },
      };
    },
  );

  return { capturedRequests, generateContentMock };
});

vi.mock("../src/inference/firebase", () => ({
  getFirebaseAi: () => ({}),
}));

vi.mock("firebase/ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/ai")>();
  return {
    ...actual,
    getGenerativeModel: () => ({ generateContent: generateContentMock }),
  };
});

import { detectSensitiveValuesWithRulesOnly } from "../src/detection";
import { classifyDisputeType } from "../src/prompts";
import {
  buildRedactionMap,
  extractPlaceholders,
  findLeaks,
  type PlaceholderEntry,
} from "../src/redaction";
import { draftLetterInCloud } from "../src/inference/cloudDrafting";
import { exampleSalaryStory } from "../src/ui/state/mockData";

const SECOND_STORY = [
  "My name is Zorblax Quimby.",
  "I live at 17 Zorblax Lane.",
  "I paid Zorblax Holdings Pvt Ltd a fee of 2,400 on 7 February 2025.",
  "Email me at zorblax.quimby@example.test or call +44 7700 900123.",
  "Account 998877665544, reference ZZ-445566.",
].join(" ");

const DATE_RE =
  /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/g;
const AMOUNT_RE =
  /(?:₹|£|\$|€|EUR|INR)\s?\d[\d,]*(?:\.\d+)?|\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b/g;
const ADDRESS_RE =
  /\b\d{1,4}\s+[A-Z][A-Za-z']+(?:\s+[A-Z][A-Za-z']+){0,2}\s+(?:Street|Road|Lane|Avenue|Boulevard|Drive|Nagar|Colony|Sector)\b/g;

function piiShapedButNotDetected(
  story: string,
  entries: readonly PlaceholderEntry[],
): string[] {
  const detected = new Set(entries.map((entry) => entry.value));
  const found = new Set<string>();
  for (const match of story.match(DATE_RE) ?? []) found.add(match);
  for (const match of story.match(AMOUNT_RE) ?? []) {
    found.add(match.replace(/,$/, ""));
  }
  for (const match of story.match(ADDRESS_RE) ?? []) found.add(match);
  return [...found].filter((value) => !detected.has(value));
}

async function runOutbound(story: string) {
  capturedRequests.length = 0;
  generateContentMock.mockClear();

  const detection = detectSensitiveValuesWithRulesOnly(story);
  const map = buildRedactionMap(detection.values);
  const anonymized = map.redact(story);
  const disputeType = classifyDisputeType(anonymized);

  await draftLetterInCloud(anonymized, disputeType);

  const request = capturedRequests[0];
  const systemInstruction = String(request.systemInstruction ?? "");
  const contents = request.contents as
    | Array<{ role?: string; parts?: Array<{ text?: string }> }>
    | undefined;
  const userText = contents?.[0]?.parts?.[0]?.text ?? "";
  const wire = JSON.stringify(request);

  return {
    detection,
    entries: map.entries,
    anonymized: String(anonymized),
    disputeType,
    request,
    systemInstruction,
    userText,
    wire,
    tokens: extractPlaceholders(anonymized),
    leaks: findLeaks(anonymized, map.entries),
    undetectedPii: piiShapedButNotDetected(story, map.entries),
  };
}

describe("AUDIT: outgoing cloud request leak check", () => {
  it("demo story: no detected value appears in the outgoing request", async () => {
    const result = await runOutbound(exampleSalaryStory);

    console.log("\n========== AUDIT: DEMO STORY ==========");
    console.log("detection status:", result.detection.status);
    console.log("limited (rules only):", result.detection.limited);
    console.log(
      "detected values (%d):",
      result.entries.length,
      result.entries.map((entry) => `${entry.token} = ${entry.value}`),
    );
    console.log("dispute type:", result.disputeType);
    console.log("allowed placeholders:", result.tokens);
    console.log("\n----- SYSTEM INSTRUCTION (exact) -----");
    console.log(result.systemInstruction);
    console.log("\n----- USER MESSAGE (exact) -----");
    console.log(result.userText);
    console.log("\n----- ANONYMIZED STORY (exact) -----");
    console.log(result.anonymized);
    console.log("\n----- LEAVES THE DEVICE UNCHANGED (PII-shaped) -----");
    console.log(result.undetectedPii);
    console.log("======================================\n");

    expect(result.leaks).toEqual([]);
    expect(result.request).toBeTruthy();
    for (const entry of result.entries) {
      expect(result.wire).not.toContain(entry.value);
    }
    expect(result.wire).toContain("{Person A}");
  });

  it("second story (Zorblax Quimby): no detected value appears in the outgoing request", async () => {
    const result = await runOutbound(SECOND_STORY);

    console.log("\n========== AUDIT: SECOND STORY ==========");
    console.log(
      "detected values (%d):",
      result.entries.length,
      result.entries.map((entry) => `${entry.token} = ${entry.value}`),
    );
    console.log("dispute type:", result.disputeType);
    console.log("\n----- SYSTEM INSTRUCTION (exact) -----");
    console.log(result.systemInstruction);
    console.log("\n----- USER MESSAGE (exact) -----");
    console.log(result.userText);
    console.log("\n----- LEAVES THE DEVICE UNCHANGED (PII-shaped) -----");
    console.log(result.undetectedPii);
    console.log("=========================================\n");

    expect(result.leaks).toEqual([]);
    for (const entry of result.entries) {
      expect(result.wire).not.toContain(entry.value);
    }
  });
});
