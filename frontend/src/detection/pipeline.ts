import { collectModelDetections, collectRuleDetections, mergeDetections } from "./merge";
import { detectWithRules } from "./rules";
import type {
  DetectionResult,
  OnDeviceStatus,
  RawDetection,
} from "./types";

/**
 * Pure detection pipeline.
 *
 * The same flow is used in the app and in tests: rules first, then the local
 * model, then a merge. Nothing here can reach the cloud; the model call is
 * injected by the caller so this file stays free of Firebase.
 */

export interface DetectionDeps {
  /** Resolves to `available` only when the local model can run. */
  readonly prepare: (
    onProgress?: (progressValue: number) => void,
  ) => Promise<OnDeviceStatus>;
  /** Calls the local model and returns its already-validated values. */
  readonly detect: (story: string) => Promise<readonly RawDetection[]>;
  readonly statusChange?: (
    status: OnDeviceStatus,
    progress?: number,
  ) => void;
}

function isUnavailableError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "unavailable"
  );
}

export async function runDetection(
  story: string,
  deps: DetectionDeps,
): Promise<DetectionResult> {
  const ruleValues = collectRuleDetections(detectWithRules(story));

  deps.statusChange?.("preparing");

  let status: OnDeviceStatus;

  try {
    status = await deps.prepare((progress) => {
      deps.statusChange?.("preparing", progress);
    });
  } catch {
    status = "unavailable";
  }

  if (status === "unavailable") {
    deps.statusChange?.("unavailable");
    return {
      values: mergeDetections(ruleValues),
      status,
      limited: true,
    };
  }

  deps.statusChange?.("available");

  try {
    const modelValues = collectModelDetections(await deps.detect(story), story);

    return {
      values: mergeDetections(ruleValues, modelValues),
      status,
      limited: false,
    };
  } catch (err: unknown) {
    const nextStatus = isUnavailableError(err) ? "unavailable" : status;

    if (nextStatus !== status) {
      deps.statusChange?.(nextStatus);
    }

    return {
      values: mergeDetections(ruleValues),
      status: nextStatus,
      limited: true,
    };
  }
}
