import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIError, AIErrorCode } from "firebase/ai";
import { runDetection } from "../src/detection";
import { classifyDisputeType } from "../src/prompts";
import {
  buildRedactionMap,
  extractPlaceholders,
  findLeaks,
} from "../src/redaction";

describe("LetterLock End-to-End Pipeline", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  // A. Detection + B. Redaction + E. Restoration (repeated categories & privacy)
  it("A/B/E: detects, redacts uniquely, leaks zero PII, and restores repeated categories accurately", async () => {
    const story = [
      "My name is Arjun Mehta, and I worked at BrightTech Solutions from 12 January 2024 to 30 September 2025.",
      "My employee ID is EMP-78291 and unpaid salary is ₹45,800.",
      "Email arjun.mehta@gmail.com, phone 91234 56789, office 22 MG Road, manager Neha Kapoor at 98765 12340.",
    ].join(" ");

    const detection = await runDetection(story, {
      prepare: async () => "available",
      detect: async () => [
        { value: "Arjun Mehta", kind: "person" },
        { value: "Neha Kapoor", kind: "person" },
        { value: "BrightTech Solutions", kind: "organization" },
        { value: "12 January 2024", kind: "date" },
        { value: "30 September 2025", kind: "date" },
        { value: "EMP-78291", kind: "account" },
        { value: "₹45,800", kind: "amount" },
        { value: "arjun.mehta@gmail.com", kind: "email" },
        { value: "91234 56789", kind: "phone" },
        { value: "98765 12340", kind: "phone" },
        { value: "22 MG Road", kind: "address" },
      ],
    });

    expect(detection.limited).toBe(false);
    expect(detection.status).toBe("available");

    const map = buildRedactionMap(
      detection.values.map((v) => ({ value: v.value, kind: v.kind })),
    );
    const tokens = map.entries.map((e) => e.token);
    expect(new Set(tokens).size).toBe(tokens.length);

    const anonymized = map.redact(story);
    expect(findLeaks(anonymized, map.entries)).toEqual([]);
    for (const entry of map.entries) {
      expect(anonymized).not.toContain(entry.value);
      expect(anonymized).toContain(entry.token);
    }

    // Restore a multi-occurrence draft
    const personA = map.entries.find((e) => e.value === "Arjun Mehta")!.token;
    const personB = map.entries.find((e) => e.value === "Neha Kapoor")!.token;
    const phone1 = map.entries.find((e) => e.value === "91234 56789")!.token;
    const phone2 = map.entries.find((e) => e.value === "98765 12340")!.token;

    const draft = `Dear ${personB}, I (${personA}) am requesting my unpaid salary. Call ${phone1} or ${phone2}. Sincerely, ${personA}.`;
    const check = map.checkReturned(anonymized, draft);
    expect(check.missing).toContain(
      map.entries.find((e) => e.value === "BrightTech Solutions")!.token,
    );

    // Full draft with all placeholders
    const allTokens = extractPlaceholders(anonymized);
    const completeDraft = `Subject: Unpaid Salary\n\nDear ${personB},\n\n${allTokens.join(" ")}\n\nSincerely, ${personA}`;
    expect(map.checkReturned(anonymized, completeDraft).ok).toBe(true);

    const restored = map.restore(completeDraft);
    expect(restored).toContain("Arjun Mehta");
    expect(restored).toContain("Neha Kapoor");
    expect(restored).toContain("91234 56789");
    expect(restored).toContain("98765 12340");
    expect(restored).toContain("₹45,800");
    expect(extractPlaceholders(restored)).toEqual([]);
  });

  // C. Cloud request payload inspection + D. Cloud response edge cases
  it("C/D: sends only anonymized text + allowed placeholders to cloud, and handles all response/error cases", async () => {
    const generateContentMock = vi.fn();

    vi.doMock("../src/inference/firebase", () => ({
      getFirebaseAi: () => ({}),
    }));
    vi.doMock("firebase/ai", async (importOriginal) => {
      const actual = await importOriginal<typeof import("firebase/ai")>();
      return {
        ...actual,
        getGenerativeModel: () => ({
          generateContent: generateContentMock,
        }),
      };
    });

    const { draftLetterInCloud, CloudDraftError } = await import(
      "../src/inference/cloudDrafting"
    );

    const map = buildRedactionMap([
      { value: "Arjun Mehta", kind: "person" },
      { value: "BrightTech Solutions", kind: "organization" },
      { value: "₹45,800", kind: "amount" },
    ]);
    const rawStory =
      "I am Arjun Mehta. BrightTech Solutions owes me unpaid salary of ₹45,800.";
    const approved = map.redact(rawStory);

    // 1. Valid response with duplicate {Person A}
    generateContentMock.mockResolvedValueOnce({
      response: {
        text: () =>
          "Subject: Salary Payment Demand\n\nDear {Organization 1},\n\nI, {Person A}, request my unpaid salary of {Amount 1}.\n\nSincerely,\n{Person A}",
        inferenceSource: "IN_CLOUD",
      },
    });

    const validRes = await draftLetterInCloud(approved, "salary_payment");
    expect(generateContentMock).toHaveBeenCalledTimes(1);

    const [requestArg] = generateContentMock.mock.calls[0];
    const serializedPayload = JSON.stringify(requestArg);
    expect(serializedPayload).not.toContain("Arjun Mehta");
    expect(serializedPayload).not.toContain("BrightTech Solutions");
    expect(serializedPayload).not.toContain("₹45,800");
    expect(requestArg.systemInstruction).toContain("- {Person A}");
    expect(requestArg.systemInstruction).toContain("- {Organization 1}");
    expect(requestArg.systemInstruction).toContain("- {Amount 1}");

    const validCheck = map.checkReturned(
      approved,
      validRes.draftWithPlaceholders,
    );
    expect(validCheck.ok).toBe(true);

    // 2. Missing placeholder -> blocked
    const missingCheck = map.checkReturned(
      approved,
      "Dear {Organization 1}, I {Person A} need my salary.",
    );
    expect(missingCheck.ok).toBe(false);
    expect(missingCheck.missing).toEqual(["{Amount 1}"]);

    // 3. Unexpected placeholder -> blocked
    const unexpectedCheck = map.checkReturned(
      approved,
      "Dear {Organization 1}, I {Person A} at {Address 1} need {Amount 1}.",
    );
    expect(unexpectedCheck.ok).toBe(false);
    expect(unexpectedCheck.unexpected).toEqual(["{Address 1}"]);

    // 4. Modified/corrupted placeholder -> blocked
    const corruptedCheck = map.checkReturned(
      approved,
      "Dear {Organization 1}, I {Person_A} need {Amount 1}.",
    );
    expect(corruptedCheck.ok).toBe(false);
    expect(corruptedCheck.missing).toContain("{Person A}");
    expect(corruptedCheck.unexpected).toContain("{Person_A}");

    // 5. Empty response -> CloudDraftError("empty_response")
    generateContentMock.mockResolvedValueOnce({
      response: { text: () => "   " },
    });
    await expect(
      draftLetterInCloud(approved, "salary_payment"),
    ).rejects.toMatchObject({
      name: "CloudDraftError",
      code: "empty_response",
    });

    // 6. Timeout -> CloudDraftError("timeout")
    const abortErr = new Error("Aborted");
    abortErr.name = "AbortError";
    generateContentMock.mockRejectedValueOnce(abortErr);
    await expect(
      draftLetterInCloud(approved, "salary_payment"),
    ).rejects.toMatchObject({
      name: "CloudDraftError",
      code: "timeout",
    });

    // 7. Malformed response -> CloudDraftError
    generateContentMock.mockResolvedValueOnce({
      response: null,
    });
    await expect(
      draftLetterInCloud(approved, "salary_payment"),
    ).rejects.toBeInstanceOf(CloudDraftError);

    // 8. API error -> CloudDraftError without raw PII
    generateContentMock.mockRejectedValueOnce(
      new AIError(AIErrorCode.FETCH_ERROR, "Network down"),
    );
    await expect(
      draftLetterInCloud(approved, "salary_payment"),
    ).rejects.toMatchObject({
      code: "network",
    });
  });

  // F. Dynamic generation classification + G. Session cleanup
  it("F/G: classifies disputes accurately without cross-contamination and clears local mappings on reset", () => {
    expect(
      classifyDisputeType(
        "My employer has not paid my salary of ₹45,800 for October.",
        "deposit",
      ),
    ).toBe("salary_payment");

    expect(
      classifyDisputeType(
        "My landlord kept my security deposit after moving out.",
        "deposit",
      ),
    ).toBe("rental_deposit");

    expect(
      classifyDisputeType(
        "The merchant refused my refund for a defective order.",
        "deposit",
      ),
    ).toBe("refund_dispute");

    expect(
      classifyDisputeType(
        "The contractor left the repair unfinished.",
        "deposit",
      ),
    ).toBe("general_dispute");

    const map = buildRedactionMap([
      { value: "Arjun Mehta", kind: "person" },
      { value: "₹45,800", kind: "amount" },
    ]);
    expect(map.size).toBe(2);
    map.clear();
    expect(map.size).toBe(0);
    expect(map.entries).toEqual([]);
  });
});
