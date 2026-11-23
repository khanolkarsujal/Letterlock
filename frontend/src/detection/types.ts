import type { PlaceholderKind } from "../redaction";

/** Which detector produced a value. Rules always run, on-device may not. */
export type DetectionSource = "rules" | "on_device";

/** Half-open range `[start, end)` inside the original story. */
export interface TextRange {
  readonly start: number;
  readonly end: number;
}

export interface DetectedValue {
  /** Canonical text exactly as it appears in the story. */
  readonly value: string;
  readonly kind: PlaceholderKind;
  /** Every occurrence of the value in the story, with real offsets. */
  readonly occurrences: readonly TextRange[];
  readonly sources: readonly DetectionSource[];
}

export type OnDeviceStatus = "available" | "preparing" | "unavailable";

export interface DetectionResult {
  readonly values: readonly DetectedValue[];
  readonly status: OnDeviceStatus;
  /**
   * True when the on-device model did not contribute to the result. The UI
   * must show the limited-detection notice in that case.
   */
  readonly limited: boolean;
}

/** A value returned by the on-device model, before it is located in the story. */
export interface RawDetection {
  readonly value: string;
  readonly kind: PlaceholderKind;
}

/** A match found by a local rule, already located in the story. */
export interface RuleMatch {
  readonly value: string;
  readonly kind: PlaceholderKind;
  readonly start: number;
  readonly end: number;
}
