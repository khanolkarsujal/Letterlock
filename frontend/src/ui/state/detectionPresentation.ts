import type { DetectionResult } from "../../detection";
import type { PlaceholderKind } from "../../redaction";
import type { Entity } from "./mockData";

const CATEGORY_LABELS: Record<PlaceholderKind, string> = {
  person: "Person",
  address: "Address",
  date: "Date",
  amount: "Amount",
  lease: "Lease reference",
  phone: "Phone",
  email: "Email",
  account: "Account",
  policy: "Policy",
  organization: "Organization",
  other: "Private detail",
};

const TOKEN_STEMS: Record<Exclude<PlaceholderKind, "person">, string> = {
  address: "Address",
  date: "Date",
  amount: "Amount",
  lease: "Lease",
  phone: "Phone",
  email: "Email",
  account: "Account",
  policy: "Policy",
  organization: "Organization",
  other: "Detail",
};

export function entitiesFromDetection(
  detection: DetectionResult,
): Entity[] {
  return detection.values.map((value, index) => ({
    id: value.occurrences[0]?.start ?? index,
    text: value.value,
    category: CATEGORY_LABELS[value.kind],
    token: tokenFor(value.kind, index, detection),
    locked: true,
  }));
}

function tokenFor(
  kind: PlaceholderKind,
  index: number,
  detection: DetectionResult,
): string {
  if (kind === "person") {
    const personIndex =
      detection.values
        .slice(0, index + 1)
        .filter((value) => value.kind === "person").length - 1;
    return `{Person ${personSuffix(personIndex)}}`;
  }

  const count = detection.values
    .slice(0, index + 1)
    .filter((value) => value.kind === kind).length;
  return `{${TOKEN_STEMS[kind]} ${count}}`;
}

function personSuffix(index: number): string {
  let remaining = index;
  let suffix = "";

  do {
    suffix = String.fromCharCode(65 + (remaining % 26)) + suffix;
    remaining = Math.floor(remaining / 26) - 1;
  } while (remaining >= 0);

  return suffix;
}
