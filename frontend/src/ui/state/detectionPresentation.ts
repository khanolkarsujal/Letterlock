import type { DetectionResult } from "../../detection";
import {
  buildRedactionMap,
  type PlaceholderKind,
  type RedactionMap,
} from "../../redaction";
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
  reference: "ID / Reference",
  other: "Private detail",
};

export function buildMapAndEntities(
  detection: DetectionResult,
): { readonly map: RedactionMap; readonly entities: readonly Entity[] } {
  const map = buildRedactionMap(detection.values);
  return { map, entities: entitiesFromRedactionMap(map) };
}

export function entitiesFromRedactionMap(map: RedactionMap): Entity[] {
  return map.entries.map((entry, index) => ({
    id: index,
    text: entry.value,
    category: CATEGORY_LABELS[entry.kind],
    token: entry.token,
    locked: true,
  }));
}
