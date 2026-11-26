import {
  AIError,
  AIErrorCode,
  getGenerativeModel,
  InferenceMode,
  InferenceSource,
  type GenerativeModel,
} from "firebase/ai";
import { getFirebaseAi } from "./firebase";
import { getSystemPrompt, type DisputeType } from "../prompts";
import { extractPlaceholders, type ApprovedOutboundText } from "../redaction";

export type { DisputeType };

export interface CloudDraftResult {
  /** The letter returned by the model, still containing placeholder tokens. */
  draftWithPlaceholders: string;
  /** The cloud model that produced the draft. */
  modelUsed: string;
  /** Where the SDK actually ran the call, as reported at runtime. */
  inferenceSource: InferenceSource;
}

export type CloudDraftErrorCode =
  | "network"
  | "quota"
  | "content_filter"
  | "timeout"
  | "cancelled"
  | "empty_response"
  | "unknown";

export class CloudDraftError extends Error {
  constructor(
    message: string,
    public readonly code: CloudDraftErrorCode,
  ) {
    super(message);
    this.name = "CloudDraftError";
  }
}

/**
 * Pinned explicitly so the model never changes with a Firebase SDK upgrade.
 * Update this single constant if the Firebase AI model id changes.
 */
const CLOUD_MODEL = "gemini-3.5-flash-lite";

/** Letter drafting can take longer than an interactive UI request. */
const CLOUD_TIMEOUT_MS = 30_000;
export const CLOUD_TIMEOUT_SECONDS = CLOUD_TIMEOUT_MS / 1000;

let cloudModel: GenerativeModel | null = null;

const generationConfig = {
  maxOutputTokens: 768,
};

function getCloudModel(): GenerativeModel {
  cloudModel ??= getGenerativeModel(getFirebaseAi(), {
    mode: InferenceMode.PREFER_IN_CLOUD,
    inCloudParams: {
      model: CLOUD_MODEL,
      generationConfig,
    },
  });
  return cloudModel;
}

// Initializes Firebase App Check and creates the cloud model before the generation screen starts the real letter request.

export function prewarmCloudDrafting(): void {
  getCloudModel();
}

export interface CloudDraftOptions {
  /** Lets the caller cancel the request (for example, a Cancel button). */
  signal?: AbortSignal;
}

/**
 * Draft a dispute letter using the cloud model.
 *
 * This module only performs the cloud call. The redaction module is
 * responsible for the pre-send check and for the returned-placeholder check
 * before the letter is restored.
 *
 * @param anonymizedStory - Text approved by the redaction module, with all PII
 *   replaced by placeholder tokens.
 * @param disputeType - Selects the system prompt for the dispute category.
 * @param options - Optional request controls, such as an abort signal.
 * @returns The drafted letter, still containing placeholder tokens.
 * @throws {CloudDraftError} on network, quota, timeout, cancel, content filter,
 *   empty response or unknown failures.
 */
function wrapUntrustedStory(anonymizedStory: ApprovedOutboundText): string {
  const escaped = anonymizedStory
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return `<UNTRUSTED_USER_STORY>\n${escaped}\n</UNTRUSTED_USER_STORY>`;
}

export async function draftLetterInCloud(
  anonymizedStory: ApprovedOutboundText,
  disputeType: DisputeType,
  options: CloudDraftOptions = {},
): Promise<CloudDraftResult> {
  try {
    const allowedPlaceholders = extractPlaceholders(anonymizedStory);
    const result = await getCloudModel().generateContent(
      {
        systemInstruction: getSystemPrompt(disputeType, allowedPlaceholders),
        contents: [
          {
            role: "user",
            parts: [{ type: "text", text: wrapUntrustedStory(anonymizedStory) }],
          },
        ],
      },
      {
        signal: options.signal,
        timeout: CLOUD_TIMEOUT_MS,
      },
    );

    const draftWithPlaceholders = result.response.text().trim();
    if (!draftWithPlaceholders) {
      throw new CloudDraftError(
        "The cloud model returned an empty draft.",
        "empty_response",
      );
    }

    return {
      draftWithPlaceholders,
      modelUsed: CLOUD_MODEL,
      inferenceSource:
        result.response.inferenceSource ?? InferenceSource.IN_CLOUD,
    };
  } catch (err: unknown) {
    throw toCloudDraftError(err, options.signal);
  }
}

function toCloudDraftError(
  err: unknown,
  signal: AbortSignal | undefined,
): CloudDraftError {
  if (err instanceof CloudDraftError) return err;

  // The SDK reports both timeouts and cancellations as an AbortError.
  if (isAbortError(err)) {
    return signal?.aborted
      ? new CloudDraftError("The cloud request was cancelled.", "cancelled")
      : new CloudDraftError("The cloud request timed out.", "timeout");
  }

  if (err instanceof AIError) {
    const status = err.customErrorData?.status;

    if (status === 401) {
      return asDraftError(
        err,
        "unknown",
        "Firebase App Check rejected the request. Register or refresh the debug token in development.",
      );
    }
    if (status === 429) {
      return asDraftError(err, "quota", "The cloud model is rate-limited.");
    }
    if (status !== undefined && status >= 500) {
      return asDraftError(
        err,
        "network",
        "The cloud service is temporarily unavailable.",
      );
    }
    if (err.code === AIErrorCode.RESPONSE_ERROR) {
      return asDraftError(
        err,
        "content_filter",
        "The cloud model blocked the response.",
      );
    }
    if (err.code === AIErrorCode.FETCH_ERROR) {
      return status === undefined || status === 0
        ? asDraftError(
            err,
            "network",
            "The cloud request could not be completed.",
          )
        : asDraftError(err, "unknown", "The cloud request was rejected.");
    }
    if (err.code === AIErrorCode.ERROR) {
      return asDraftError(
        err,
        "network",
        "The cloud request could not be completed.",
      );
    }
    if (err.code === AIErrorCode.API_NOT_ENABLED) {
      return asDraftError(
        err,
        "unknown",
        "The Firebase AI Logic API is not enabled.",
      );
    }
  }

  // Last resort: classify case-insensitively. Never include request payloads.
  const message = err instanceof Error ? err.message : String(err);
  const normalized = message.toLowerCase();

  if (
    normalized.includes("quota") ||
    normalized.includes("rate limit") ||
    normalized.includes("429")
  ) {
    return new CloudDraftError(message, "quota");
  }
  if (
    normalized.includes("safety") ||
    normalized.includes("blocked") ||
    normalized.includes("content")
  ) {
    return new CloudDraftError(message, "content_filter");
  }
  if (
    normalized.includes("network") ||
    normalized.includes("fetch") ||
    normalized.includes("timeout") ||
    normalized.includes("timed out")
  ) {
    return new CloudDraftError(message, "network");
  }

  return new CloudDraftError(message, "unknown");
}

function isAbortError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name?: unknown }).name === "AbortError"
  );
}

function asDraftError(
  err: unknown,
  code: CloudDraftErrorCode,
  fallbackMessage: string,
): CloudDraftError {
  const message =
    err instanceof Error && err.message ? err.message : fallbackMessage;
  return new CloudDraftError(message, code);
}
