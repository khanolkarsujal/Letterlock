import { describe, expect, it } from "vitest";
import {
  checkReturnedPlaceholders,
  extractPlaceholders,
  findLeaks,
  normalizeReturnedPlaceholders,
  redactStory,
  RedactionError,
  RedactionMap,
  restoreText,
  type ApprovedOutboundText,
  type PlaceholderEntry,
} from "../src/redaction";
import { buildRedactionMap } from "../src/redaction";

describe("buildRedactionMap", () => {
  it("creates one placeholder map entry for each detected value", () => {
    const map = buildRedactionMap([
      { value: "Priya Sharma", kind: "person" },
      { value: "eddy@gmail.com", kind: "email" },
    ]);

    expect(map.entries.map((entry) => entry.token)).toEqual([
      "{Person A}",
      "{Email 1}",
    ]);
  });

  it("returns a leak-free redacted story from detected values", () => {
    const map = buildRedactionMap([
      { value: "Priya Sharma", kind: "person" },
      { value: "eddy@gmail.com", kind: "email" },
    ]);

    const outbound = map.redact(
      "My name is Priya Sharma. Email eddy@gmail.com.",
    );

    expect(outbound).toBe(
      "My name is {Person A}. Email {Email 1}.",
    );
    expect(findLeaks(outbound, map.entries)).toEqual([]);
  });

  it("updates the redacted story after adding and removing a manual detail", () => {
    const map = buildRedactionMap([
      { value: "Priya Sharma", kind: "person" },
    ]);
    map.add("eddy@gmail.com", "email");

    const withManualDetail = map.redact(
      "Priya Sharma uses eddy@gmail.com.",
    );
    expect(withManualDetail).toBe(
      "{Person A} uses {Email 1}.",
    );

    map.remove("eddy@gmail.com");
    expect(map.redact("Priya Sharma uses eddy@gmail.com.")).toBe(
      "{Person A} uses eddy@gmail.com.",
    );
  });
});

function buildEntries(pairs: Array<[string, PlaceholderEntry["kind"]]>): PlaceholderEntry[] {
  const map = new RedactionMap();
  return pairs.map(([value, kind]) => map.add(value, kind));
}

describe("RedactionMap tokens", () => {
  it("assigns a stable placeholder and reuses it for the same value", () => {
    const map = new RedactionMap();

    const first = map.add("Alex Example", "person");
    const second = map.add("Alex Example", "person");
    const sameIgnoringCase = map.add("alex example", "person");

    expect(first.token).toBe("{Person A}");
    expect(second).toBe(first);
    expect(sameIgnoringCase).toBe(first);
    expect(map.size).toBe(1);
  });

  it("numbers non-person kinds independently", () => {
    const map = new RedactionMap();

    expect(map.add("12 Test Lane", "address").token).toBe("{Address 1}");
    expect(map.add("34 Sample Road", "address").token).toBe("{Address 2}");
    expect(map.add("3 March 2024", "date").token).toBe("{Date 1}");
    expect(map.add("1234.50", "amount").token).toBe("{Amount 1}");
    expect(map.add("Alex Example", "person").token).toBe("{Person A}");
    expect(map.add("Sam Sample", "person").token).toBe("{Person B}");
  });

  it("rolls person suffixes from Z to AA", () => {
    const map = new RedactionMap();
    for (let index = 0; index < 27; index += 1) {
      map.add(`Invented Person ${index}`, "person");
    }

    const tokens = map.entries.map((entry) => entry.token);
    expect(tokens[25]).toBe("{Person Z}");
    expect(tokens[26]).toBe("{Person AA}");
  });

  it("rejects empty values without echoing them", () => {
    const map = new RedactionMap();
    expect(() => map.add("   ", "person")).toThrow(RedactionError);
  });
});

describe("redactStory", () => {
  it("does not create approved text if a sensitive value still leaks", () => {
    const map = buildRedactionMap([
      { value: "Priya Sharma", kind: "person" },
    ]);
    map.remove("Priya Sharma");

    const outbound = map.redact("My name is Priya Sharma.");

    expect(outbound).toBe("My name is Priya Sharma.");
  });

  it("replaces every occurrence and returns approved outbound text", () => {
    const map = new RedactionMap();
    map.add("Alex Example", "person");
    map.add("12 Test Lane", "address");
    map.add("3 March 2024", "date");

    const story =
      "My name is Alex Example. Alex Example lives at 12 Test Lane and moved out on 3 March 2024.";

    const outbound: ApprovedOutboundText = map.redact(story);

    expect(outbound).toContain("{Person A}");
    expect(outbound).toContain("{Address 1}");
    expect(outbound).toContain("{Date 1}");
    expect(outbound).not.toMatch(/Alex Example|12 Test Lane|3 March 2024/);
    expect(findLeaks(outbound, map.entries)).toEqual([]);
  });

  it("matches case-insensitively", () => {
    const map = new RedactionMap();
    map.add("Alex Example", "person");

    const outbound = map.redact("ALEX EXAMPLE paid alex example back.");

    expect(outbound).not.toMatch(/alex example/i);
    expect(outbound.match(/\{Person A\}/g)).toHaveLength(2);
  });

  it("replaces longer values first so shorter ones cannot damage them", () => {
    const map = new RedactionMap();
    map.add("Example Ltd", "organization");
    map.add("Landlord Example Ltd", "organization");

    const outbound = map.redact(
      "Sent to Landlord Example Ltd, not Example Ltd.",
    );

    expect(outbound).toContain("{Organization 2}");
    expect(outbound).toContain("{Organization 1}");
    expect(outbound).not.toContain("Example Ltd");
  });

  it("returns the story unchanged when there are no entries", () => {
    expect(redactStory("Nothing to redact.", [])).toBe("Nothing to redact.");
  });
});

describe("findLeaks", () => {
  it("detects a sensitive value that survived outside the tokens", () => {
    const list = buildEntries([["Alex Example", "person"]]);

    expect(findLeaks("Dear {Person A}, Alex Example", list)).toEqual([
      "Alex Example",
    ]);
    expect(findLeaks("Dear ALEX EXAMPLE", list)).toEqual(["Alex Example"]);
  });

  it("ignores values that only appear inside tokens", () => {
    const list = buildEntries([["Address", "address"]]);

    expect(findLeaks("Dear {Address 1}", list)).toEqual([]);
  });

  it("returns an empty list for clean outgoing text", () => {
    const list = buildEntries([
      ["Alex Example", "person"],
      ["12 Test Lane", "address"],
    ]);

    expect(findLeaks("Dear {Person A} at {Address 1}.", list)).toEqual([]);
  });
});

describe("restoreText", () => {
  it("round-trips redact then restore", () => {
    const map = new RedactionMap();
    map.add("Alex Example", "person");
    map.add("12 Test Lane", "address");

    const story = "My name is Alex Example and I live at 12 Test Lane.";
    const approved = map.redact(story);

    expect(map.restore(approved)).toBe(story);
  });

  it("leaves unknown tokens untouched", () => {
    const list = buildEntries([["Alex Example", "person"]]);

    expect(restoreText("Dear {Person A} and {Person Z}.", list)).toBe(
      "Dear Alex Example and {Person Z}.",
    );
  });

  it("restores doubled braces to the same value", () => {
    const list = buildEntries([["Alex Example", "person"]]);

    expect(restoreText("Dear {{Person A}}.", list)).toBe(
      "Dear Alex Example.",
    );
  });
});

describe("checkReturnedPlaceholders", () => {
  it("accepts a letter that contains every placeholder", () => {
    const map = new RedactionMap();
    map.add("Alex Example", "person");
    map.add("12 Test Lane", "address");
    const approved = map.redact("Alex Example at 12 Test Lane");

    const result = map.checkReturned(
      approved,
      "Dear {Person A}, about {Address 1}.",
    );

    expect(result).toEqual({ ok: true, missing: [], unexpected: [] });
  });

  it("rejects a letter with a missing placeholder", () => {
    const map = new RedactionMap();
    map.add("Alex Example", "person");
    map.add("12 Test Lane", "address");
    const approved = map.redact("Alex Example at 12 Test Lane");

    const result = checkReturnedPlaceholders(approved, "Dear {Person A}.");

    expect(result.ok).toBe(false);
    expect(result.missing).toEqual(["{Address 1}"]);
  });

  it("rejects a placeholder the app cannot restore", () => {
    const map = new RedactionMap();
    map.add("Alex Example", "person");
    map.add("12 Test Lane", "address");
    const approved = map.redact("Alex Example at 12 Test Lane");

    const result = checkReturnedPlaceholders(
      approved,
      "Dear {Person A}, {Address 1}, from {Person Z}.",
    );

    expect(result.ok).toBe(false);
    expect(result.unexpected).toEqual(["{Person Z}"]);
  });

  it("accepts doubled braces when every placeholder is present", () => {
    const map = new RedactionMap();
    map.add("Alex Example", "person");
    map.add("12 Test Lane", "address");
    const approved = map.redact("Alex Example at 12 Test Lane");

    const result = map.checkReturned(
      approved,
      "Dear {{Person A}}, about {{Address 1}}.",
    );

    expect(result.ok).toBe(true);
  });
});

describe("extractPlaceholders", () => {
  it("only recognises the tokens this module creates", () => {
    expect(
      extractPlaceholders(
        "A {Person A}, {Address 2}, {not a token} and {Person a}.",
      ),
    ).toEqual(["{Person A}", "{Address 2}"]);
  });

  it("accepts doubled braces as the same placeholder", () => {
    expect(extractPlaceholders("A {{Person A}} and {{Address 2}}.")).toEqual([
      "{Person A}",
      "{Address 2}",
    ]);
  });
});

describe("RedactionMap lifecycle", () => {
  it("removes a value and lets it through again", () => {
    const map = new RedactionMap();
    map.add("Alex Example", "person");

    expect(map.remove("alex example")).toBe(true);
    expect(map.size).toBe(0);
    expect(map.redact("Alex Example")).toBe("Alex Example");
  });

  it("clears entries and resets counters", () => {
    const map = new RedactionMap();
    map.add("Alex Example", "person");
    map.clear();

    expect(map.size).toBe(0);
    expect(map.add("Sam Sample", "person").token).toBe("{Person A}");
  });
});

describe("normalizeReturnedPlaceholders", () => {
  it("normalizes {person a}, {Person_A}, and unbraced Person A to {Person A}", () => {
    const map = new RedactionMap();
    map.add("Arjun Mehta", "person");
    map.add("BrightTech Solutions", "organization");
    const approved = map.redact("My name is Arjun Mehta at BrightTech Solutions.");

    const rawResponse =
      "Dear Sir, {person a} worked at {Organization_1}. Regards, Person A.";
    const normalized = normalizeReturnedPlaceholders(rawResponse, approved);

    expect(normalized).toBe(
      "Dear Sir, {Person A} worked at {Organization 1}. Regards, {Person A}.",
    );
    expect(checkReturnedPlaceholders(approved, normalized).ok).toBe(true);
    expect(map.restore(normalized)).toBe(
      "Dear Sir, Arjun Mehta worked at BrightTech Solutions. Regards, Arjun Mehta.",
    );
  });

  it("still rejects unknown placeholders like {Person C}", () => {
    const map = new RedactionMap();
    map.add("Arjun Mehta", "person");
    const approved = map.redact("My name is Arjun Mehta.");

    const normalized = normalizeReturnedPlaceholders(
      "Dear Person A, please copy {Person C}.",
      approved,
    );
    const check = checkReturnedPlaceholders(approved, normalized);

    expect(check.ok).toBe(false);
    expect(check.unexpected).toEqual(["{Person C}"]);
  });
});
