import { collectRuleDetections, mergeDetections } from "./merge";
import {
  detectWithOnDevice,
  prepareOnDevice,
} from "./onDevice";
import { runDetection } from "./pipeline";
import { detectWithRules } from "./rules";
import type { DetectionResult, OnDeviceStatus } from "./types";

export type {
  DetectedValue,
  DetectionResult,
  DetectionSource,
  OnDeviceStatus,
  RawDetection,
  RuleMatch,
  TextRange,
} from "./types";
export { mergeDetections, locateOccurrences } from "./merge";
export { runDetection } from "./pipeline";
export { detectWithRules } from "./rules";
export { parseDetectionResponse, DetectionParseError } from "./parse";
export {
  prepareOnDevice,
  detectWithOnDevice,
  OnDeviceDetectionError,
} from "./onDevice";

export interface DetectionOptions {
  /**
   * Disable the on-device call (tests, or a future user preference). Rules
   * still run; the result is marked as limited.
   */
  readonly useOnDevice?: boolean;
  /** Reports the local model state so the UI can update the top bar. */
  readonly onStatusChange?: (
    status: OnDeviceStatus,
    progress?: number,
  ) => void;
}

/**
 * Detection entry point.
 *
 * Rules always run. The on-device model is attempted only in on-device-only
 * mode; there is no cloud fallback. If the model is unavailable or its output
 * cannot be trusted, the result keeps the rule detections and is marked
 * `limited`, so the UI shows the limited-detection notice.
 */
export async function detectSensitiveValues(
  story: string,
  options: DetectionOptions = {},
): Promise<DetectionResult> {
  if (options.useOnDevice === false) {
    return detectSensitiveValuesWithRulesOnly(story);
  }

  return runDetection(story, {
    prepare: prepareOnDevice,
    detect: detectWithOnDevice,
    statusChange: options.onStatusChange,
  });
}

/** Rules-only detection, for tests and for a device with no local model. */
export function detectSensitiveValuesWithRulesOnly(
  story: string,
): DetectionResult {
  return {
    values: mergeDetections(collectRuleDetections(detectWithRules(story))),
    status: "unavailable",
    limited: true,
  };
}
