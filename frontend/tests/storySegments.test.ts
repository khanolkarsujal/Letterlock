import { describe, expect, it } from "vitest";
import { buildRedactionMap } from "../src/redaction";
import {
  highlightOriginalStory,
  highlightRedactedStory,
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
});
