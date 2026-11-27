import { describe, expect, it } from "vitest";
import { buildRedactionMap } from "../src/redaction";
import {
  highlightOriginalStory,
  highlightRedactedStory,
  verifyRenderedStoryOrder,
} from "../src/ui/lib/storySegments";

describe("review story segments", () => {
  it("marks private values in the original story", () => {
    const map = buildRedactionMap([
      { value: "Priya Sharma", kind: "person" },
      { value: "eddy@gmail.com", kind: "email" },
    ]);

    const segments = highlightOriginalStory(
      "My name is Priya Sharma. Email eddy@gmail.com.",
      map.entries,
    );

    expect(segments.filter((segment) => segment.highlighted).map(
      (segment) => segment.text,
    )).toEqual(["Priya Sharma", "eddy@gmail.com"]);
  });

  it("marks placeholders in the redacted story", () => {
    const map = buildRedactionMap([
      { value: "Priya Sharma", kind: "person" },
      { value: "eddy@gmail.com", kind: "email" },
    ]);
    const redacted = map.redact(
      "My name is Priya Sharma. Email eddy@gmail.com.",
    );

    const segments = highlightRedactedStory(redacted, map.entries);

    expect(segments.filter((segment) => segment.token).map(
      (segment) => segment.text,
    )).toEqual(["{Person A}", "{Email 1}"]);
  });

  it("preserves exact original text and order across subject lines and newlines", () => {
    const story =
      "Subject: Request for Salary Payment Correction\n\nHello,\n\nMy name is Arjun Mehta.";
    const map = buildRedactionMap([{ value: "Arjun Mehta", kind: "person" }]);

    const segments = highlightOriginalStory(story, map.entries);
    expect(
      verifyRenderedStoryOrder(
        story,
        segments.map((s) => s.text),
      ),
    ).toBe(true);
  });
});
