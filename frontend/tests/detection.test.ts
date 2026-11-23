import { describe, expect, it } from "vitest";
import {
  collectModelDetections,
  collectRuleDetections,
  locateOccurrences,
  mergeDetections,
} from "../src/detection/merge";
import { runDetection } from "../src/detection/pipeline";
import { parseDetectionResponse, DetectionParseError } from "../src/detection/parse";
import { detectWithRules } from "../src/detection/rules";
import type { OnDeviceStatus } from "../src/detection/types";
import type { PlaceholderKind } from "../src/redaction";

function valuesOf(
  matches: ReturnType<typeof detectWithRules>,
  kind: PlaceholderKind,
): string[] {
  return matches.filter((match) => match.kind === kind).map((match) => match.value);
}

const story =
  "Contact Alex Example at alex.example@test.invalid or +44 7700 900123. " +
  "Backup 98765 43210. Account 12345678 and card 1234 5678 9012 3456. " +
  "IBAN GB82WEST12345698765432. Rent was 1 200 000 on 2024-03-03.";

describe("rules-based detection", () => {
  it("finds explicitly introduced full names and titled names", () => {
    const sample =
      "My name is Priya Sharma. I am Alex Morgan. I'm Jamie Lee. My landlord, Mr Rao, has kept the deposit.";
    const matches = detectWithRules(sample);

    expect(valuesOf(matches, "person").sort()).toEqual(
      ["Alex Morgan", "Jamie Lee", "Mr Rao", "Priya Sharma"].sort(),
    );
  });

  it("finds Priya Sharma in the dispute sample", () => {
    const sample =
      "I moved out of 14 Oak Street on 3 June. My landlord, Mr Rao, " +
      "has kept my deposit of 1,200. My name is Priya Sharma, lease ref LS-20418.";

    expect(valuesOf(detectWithRules(sample), "person").sort()).toEqual(
      ["Mr Rao", "Priya Sharma"].sort(),
    );
  });

  it("finds emails, phones and account numbers", () => {
    const matches = detectWithRules(story);

    expect(valuesOf(matches, "email")).toEqual(["alex.example@test.invalid"]);
    expect(valuesOf(matches, "phone").sort()).toEqual(
      ["+44 7700 900123", "98765 43210"].sort(),
    );
    expect(valuesOf(matches, "account").sort()).toEqual(
      [
        "12345678",
        "1234 5678 9012 3456",
        "GB82WEST12345698765432",
      ].sort(),
    );
  });

  it("does not classify dates or spaced amounts as phone numbers", () => {
    const matches = detectWithRules(story);

    expect(valuesOf(matches, "phone")).not.toContain("2024-03-03");
    expect(valuesOf(matches, "phone")).not.toContain("1 200 000");
    expect(valuesOf(matches, "account")).not.toContain("1 200 000");
  });

  it("classifies a plain 10-digit number as a phone, not an account", () => {
    expect(detectWithRules("Call 9876543210 now.")).toEqual([
      { value: "9876543210", kind: "phone", start: 5, end: 15 },
    ]);
  });

  it("reports positions that slice back to the exact value", () => {
    for (const match of detectWithRules(story)) {
      expect(story.slice(match.start, match.end)).toBe(match.value);
    }
  });
});

describe("on-device output parsing", () => {
  it("parses plain JSON", () => {
    expect(
      parseDetectionResponse(
        '{"values":[{"value":"Alex Example","kind":"person"},{"value":"12 Test Lane","kind":"address"}]}',
      ),
    ).toEqual([
      { value: "Alex Example", kind: "person" },
      { value: "12 Test Lane", kind: "address" },
    ]);
  });

  it("parses JSON wrapped in a markdown fence and surrounding prose", () => {
    const raw =
      'Here you go:\n```json\n{"values":[{"value":"Alex Example","kind":"person"}]}\n```\nDone.';

    expect(parseDetectionResponse(raw)).toEqual([
      { value: "Alex Example", kind: "person" },
    ]);
  });

  it("maps unknown kinds to other instead of trusting them", () => {
    expect(
      parseDetectionResponse(
        '{"values":[{"value":"Blue Widgets Ltd","kind":"company"}]}',
      ),
    ).toEqual([{ value: "Blue Widgets Ltd", kind: "other" }]);
  });

  it("keeps valid entries and drops invalid ones", () => {
    expect(
      parseDetectionResponse(
        '{"values":[{"value":"","kind":"person"},{"value":"Alex Example","kind":"person"}]}',
      ),
    ).toEqual([{ value: "Alex Example", kind: "person" }]);
  });

  it("rejects invalid JSON and responses where every entry is invalid", () => {
    expect(() => parseDetectionResponse("not json")).toThrow(
      DetectionParseError,
    );
    expect(() =>
      parseDetectionResponse('{"values":[{"value":"","kind":"person"}]}'),
    ).toThrow(DetectionParseError);
    expect(() => parseDetectionResponse('{"items":[]}')).toThrow(
      DetectionParseError,
    );
  });
});

describe("locating model values in the story", () => {
  it("finds every occurrence case-insensitively", () => {
    expect(locateOccurrences("Rao met rao and RAO.", "Rao")).toEqual([
      { start: 0, end: 3 },
      { start: 8, end: 11 },
      { start: 16, end: 19 },
    ]);
  });

  it("discards fabricated values and rewrites casing to the story text", () => {
    const detections = collectModelDetections(
      [
        { value: "mr rao", kind: "person" },
        { value: "Invented Name", kind: "person" },
      ],
      "Mr Rao met Rao.",
    );

    expect(detections).toEqual([
      {
        value: "Mr Rao",
        kind: "person",
        occurrences: [{ start: 0, end: 6 }],
        sources: ["on_device"],
      },
    ]);
  });

  it("discards a value that covers the whole story", () => {
    expect(
      collectModelDetections(
        [{ value: "Alex Example", kind: "person" }],
        "Alex Example",
      ),
    ).toEqual([]);
  });
});

describe("merging detections", () => {
  it("prefers the rule kind and records both sources", () => {
    const sample = "Call 98765 43210 now.";
    const ruleValues = collectRuleDetections(detectWithRules(sample));
    const modelValues = collectModelDetections(
      [{ value: "98765 43210", kind: "account" }],
      sample,
    );

    const merged = mergeDetections(ruleValues, modelValues);

    expect(merged).toHaveLength(1);
    expect(merged[0].kind).toBe("phone");
    expect(merged[0].sources).toEqual(["rules", "on_device"]);
  });

  it("keeps a standalone short value and drops only covered occurrences", () => {
    const sample = "Mr Rao met Rao.";
    const modelValues = collectModelDetections(
      [
        { value: "Mr Rao", kind: "person" },
        { value: "Rao", kind: "person" },
      ],
      sample,
    );

    const merged = mergeDetections(modelValues);

    expect(merged.map((entry) => entry.value)).toEqual(["Mr Rao", "Rao"]);
    expect(merged.find((entry) => entry.value === "Rao")?.occurrences).toEqual([
      { start: 11, end: 14 },
    ]);
  });

  it("drops a value whose every occurrence is inside a longer value", () => {
    const sample = "Mr Rao called.";
    const modelValues = collectModelDetections(
      [
        { value: "Mr Rao", kind: "person" },
        { value: "Rao", kind: "person" },
      ],
      sample,
    );

    expect(mergeDetections(modelValues).map((entry) => entry.value)).toEqual([
      "Mr Rao",
    ]);
  });

  it("sorts the final list by first occurrence", () => {
    const sample = "Rao met Mr Rao.";
    const modelValues = collectModelDetections(
      [
        { value: "Mr Rao", kind: "person" },
        { value: "Rao", kind: "person" },
      ],
      sample,
    );

    expect(mergeDetections(modelValues).map((entry) => entry.value)).toEqual([
      "Rao",
      "Mr Rao",
    ]);
  });
});

describe("detection pipeline", () => {
  const sample =
    "Alex Example emailed alex.example@test.invalid about 12 Test Lane.";

  function events() {
    const seen: Array<{ status: OnDeviceStatus; progress?: number }> = [];
    return {
      seen,
      onStatusChange: (status: OnDeviceStatus, progress?: number) => {
        seen.push({ status, progress });
      },
    };
  }

  it("merges rule and model detections and marks the result as complete", async () => {
    const track = events();

    const result = await runDetection(sample, {
      prepare: async () => "available",
      detect: async () => [
        { value: "Alex Example", kind: "person" },
        { value: "12 Test Lane", kind: "address" },
      ],
      statusChange: track.onStatusChange,
    });

    expect(result.status).toBe("available");
    expect(result.limited).toBe(false);
    expect(result.values.map((entry) => entry.kind).sort()).toEqual([
      "address",
      "email",
      "person",
    ]);
    expect(track.seen.map((event) => event.status)).toEqual([
      "preparing",
      "available",
    ]);
  });

  it("runs rules only when the local model is unavailable", async () => {
    const track = events();
    let detectCalls = 0;

    const result = await runDetection(sample, {
      prepare: async () => "unavailable",
      detect: async () => {
        detectCalls += 1;
        return [];
      },
      statusChange: track.onStatusChange,
    });

    expect(detectCalls).toBe(0);
    expect(result.status).toBe("unavailable");
    expect(result.limited).toBe(true);
    expect(result.values.map((entry) => entry.value)).toEqual([
      "alex.example@test.invalid",
    ]);
    expect(track.seen.map((event) => event.status)).toEqual([
      "preparing",
      "unavailable",
    ]);
  });

  it("falls back to rules if preparing the model throws", async () => {
    const result = await runDetection(sample, {
      prepare: async () => {
        throw new Error("download failed");
      },
      detect: async () => [],
    });

    expect(result.status).toBe("unavailable");
    expect(result.limited).toBe(true);
    expect(result.values).toHaveLength(1);
  });

  it("reports unavailable when the model disappears during detection", async () => {
    const track = events();

    const result = await runDetection(sample, {
      prepare: async () => "available",
      detect: async () => {
        throw Object.assign(new Error("gone"), { code: "unavailable" });
      },
      statusChange: track.onStatusChange,
    });

    expect(result.status).toBe("unavailable");
    expect(result.limited).toBe(true);
    expect(track.seen.map((event) => event.status)).toEqual([
      "preparing",
      "available",
      "unavailable",
    ]);
  });

  it("keeps the model as available but marks detection limited on bad output", async () => {
    const result = await runDetection(sample, {
      prepare: async () => "available",
      detect: async () => {
        throw Object.assign(new Error("bad json"), { code: "invalid_output" });
      },
    });

    expect(result.status).toBe("available");
    expect(result.limited).toBe(true);
    expect(result.values.map((entry) => entry.value)).toEqual([
      "alex.example@test.invalid",
    ]);
  });

  it("reports download progress while preparing", async () => {
    const progress: number[] = [];

    await runDetection(sample, {
      prepare: async (onProgress) => {
        onProgress?.(0.4);
        onProgress?.(1);
        return "unavailable";
      },
      detect: async () => [],
      statusChange: (status, value) => {
        if (status === "preparing" && value !== undefined) progress.push(value);
      },
    });

    expect(progress).toEqual([0.4, 1]);
  });
});
