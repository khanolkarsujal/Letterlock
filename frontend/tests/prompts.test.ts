import { describe, expect, it } from "vitest";
import { getSystemPrompt } from "../src/prompts";

describe("letter system prompts", () => {
  it("includes placeholder and concision rules for every dispute type", () => {
    const types = [
      "rental_deposit",
      "insurance_claim",
      "medical_bill",
    ] as const;

    for (const type of types) {
      const prompt = getSystemPrompt(type);
      expect(prompt).toContain("300-500 words");
      expect(prompt).toContain("Copy every placeholder exactly as written");
      expect(prompt).toContain("Do not invent dates");
      expect(prompt).toContain("No preamble");
    }
  });

  it("uses a distinct category-specific instruction", () => {
    expect(getSystemPrompt("rental_deposit")).toContain("rental-deposit");
    expect(getSystemPrompt("insurance_claim")).toContain("insurance appeal");
    expect(getSystemPrompt("medical_bill")).toContain("medical-bill dispute");
  });
});
