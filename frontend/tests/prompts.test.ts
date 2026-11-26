import { describe, expect, it } from "vitest";
import { classifyDisputeType, getSystemPrompt } from "../src/prompts";
import { buildRedactionMap, extractPlaceholders } from "../src/redaction";

describe("letter system prompts & dispute classification", () => {
  it("includes placeholder and concision rules for every dispute type", () => {
    const types = [
      "salary_payment",
      "rental_deposit",
      "refund_dispute",
      "insurance_claim",
      "medical_bill",
      "general_dispute",
    ] as const;

    for (const type of types) {
      const prompt = getSystemPrompt(type);
      expect(prompt).toContain("400-500 words");
      expect(prompt).toContain("Copy every placeholder from the story exactly as written");
      expect(prompt).toContain("NEVER invent recipients, property addresses, amounts, deadlines, reference numbers, statutory citations");
      expect(prompt).toContain("No preamble");
      expect(prompt).not.toContain("{Address 1}");
      expect(prompt).not.toContain("{Person A}");
    }
  });

  it("classifies a salary payment complaint into a salary demand prompt without rental facts", () => {
    const story =
      "My name is {Person A}, employee ID {Account 1}. My salary for October amounting to {Amount 1} at {Organization 1} has not been credited. Contact {Person B} at {Phone 1}.";
    const disputeType = classifyDisputeType(story, "deposit");
    expect(disputeType).toBe("salary_payment");

    const prompt = getSystemPrompt(disputeType, extractPlaceholders(story));
    expect(prompt).toContain("unpaid salary");
    expect(prompt).not.toContain("landlord");
    expect(prompt).not.toContain("security deposit");
    expect(prompt).not.toContain("14 Oak Street");
    expect(prompt).not.toContain("Mr Rao");
    expect(prompt).not.toContain("LS-20418");
    expect(prompt).not.toContain("£1,200");
  });

  it("classifies a rental deposit complaint into a rental deposit prompt", () => {
    const story =
      "I moved out of {Address 1} on {Date 1}. My landlord {Person B} has kept my security deposit of {Amount 1}.";
    const disputeType = classifyDisputeType(story, "deposit");
    expect(disputeType).toBe("rental_deposit");

    const prompt = getSystemPrompt(disputeType, extractPlaceholders(story));
    expect(prompt).toContain("security deposit");
    expect(prompt).toContain("- {Address 1}");
    expect(prompt).toContain("- {Amount 1}");
  });

  it("classifies a refund complaint into a refund demand prompt without rental facts", () => {
    const story =
      "I returned a defective item for order {Account 1} to merchant {Organization 1} on {Date 1} and still have not received my {Amount 1} refund.";
    const disputeType = classifyDisputeType(story, "deposit");
    expect(disputeType).toBe("refund_dispute");

    const prompt = getSystemPrompt(disputeType, extractPlaceholders(story));
    expect(prompt).toContain("refund");
    expect(prompt).not.toContain("landlord");
    expect(prompt).not.toContain("security deposit");
  });

  it("forbids inventing recipients or statutory provisions when missing", () => {
    const prompt = getSystemPrompt("general_dispute", ["{Amount 1}"]);
    expect(prompt).toContain("NEVER invent recipients");
    expect(prompt).toContain("statutory citations, jurisdiction-specific laws, or legal provisions");
    expect(prompt).toContain("If a detail (such as a recipient name, address, or jurisdiction) is missing from the story, omit it or use a clearly marked editable bracket");
  });

  it("preserves different currencies and multiple entities of the same category end-to-end", () => {
    const map = buildRedactionMap([
      { value: "Arjun Mehta", kind: "person" },
      { value: "Neha Kapoor", kind: "person" },
      { value: "BrightTech Solutions", kind: "organization" },
      { value: "12 January 2024", kind: "date" },
      { value: "30 September 2025", kind: "date" },
      { value: "EMP-78291", kind: "account" },
      { value: "₹45,800", kind: "amount" },
      { value: "91234 56789", kind: "phone" },
      { value: "98765 12340", kind: "phone" },
      { value: "arjun.mehta@gmail.com", kind: "email" },
    ]);

    const story =
      "My name is Arjun Mehta at BrightTech Solutions from 12 January 2024 to 30 September 2025. ID EMP-78291, unpaid salary ₹45,800, email arjun.mehta@gmail.com, phone 91234 56789, manager Neha Kapoor at 98765 12340.";
    const anonymized = map.redact(story);
    const allowed = extractPlaceholders(anonymized);
    const prompt = getSystemPrompt("salary_payment", allowed);

    expect(prompt).toContain("Preserve the exact currency symbol or code");
    for (const token of allowed) {
      expect(prompt).toContain(`- ${token}`);
    }
    expect(prompt).not.toContain("{Address 1}");

    const simulatedDraft =
      "Subject: Request for Salary Payment Correction\n\nDear {Person B},\n\nI, {Person A}, worked at {Organization 1} from {Date 1} to {Date 2} (Employee ID: {Account 1}). My unpaid salary of {Amount 1} has not been credited. Reach me at {Email 1} or {Phone 1}, or via {Phone 2}.";
    const check = map.checkReturned(anonymized, simulatedDraft);
    expect(check.ok).toBe(true);

    const restored = map.restore(simulatedDraft);
    expect(restored).toContain("₹45,800");
    expect(restored).toContain("Arjun Mehta");
    expect(restored).toContain("Neha Kapoor");
    expect(restored).toContain("BrightTech Solutions");
    expect(restored).toContain("EMP-78291");
    expect(restored).not.toContain("£1,200");
    expect(restored).not.toContain("Mr Rao");
  });

  it("forbids inventing placeholders when none are present in the story", () => {
    const prompt = getSystemPrompt("insurance_claim", []);
    expect(prompt).toContain("No placeholders appear in the story.");
    expect(prompt).toContain("Do NOT include or invent any curly-brace placeholders");
  });
});
