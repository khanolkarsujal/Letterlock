import {
  AIError,
  AIErrorCode,
  getGenerativeModel,
  InferenceMode,
  InferenceSource,
  GenerativeModel,
} from "firebase/ai";
import { getFirebaseAi } from "./firebase";

const ON_DEVICE_TIMEOUT_MS = 30_000;

/**
 * True when Chrome exposes the on-device Prompt API.
 */
export function hasOnDeviceLanguageModel(): boolean {
  return typeof globalThis !== "undefined" && "LanguageModel" in globalThis;
}

/**Config model for on-device inference. Created lazily for a safe reason. */
let model: GenerativeModel | null = null;

/**
 * Returns the on-device model, creating it on first use.
 */
export function getOnDeviceModel(): GenerativeModel {
  if (!hasOnDeviceLanguageModel()) {
    throw new AIError(
      AIErrorCode.API_NOT_ENABLED,
      "Local LanguageModel API not available in this environment.",
    );
  }

  if (!model) {
    model = getGenerativeModel(getFirebaseAi(), {
      mode: InferenceMode.ONLY_ON_DEVICE,
      onDeviceParams: {
        createOptions: {
          expectedInputs: [{ type: "text", languages: ["en"] }],
          expectedOutputs: [{ type: "text", languages: ["en"] }],
        },
      },
    });
  }

  return model;
}

/**
 * Sends a prompt to the on-device model with a defensive timeout.
 * @throws if the model is not available or the time is exceeded.
 */
export async function runOnDevice(prompt: string): Promise<string> {
  if (!hasOnDeviceLanguageModel()) {
    throw new AIError(
      AIErrorCode.API_NOT_ENABLED,
      "Local LanguageModel API not available in this environment.",
    );
  }

  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error("ON_DEVICE_TIMEOUT")),
      ON_DEVICE_TIMEOUT_MS,
    );
  });

  try {
    const result = await Promise.race([
      getOnDeviceModel().generateContent(prompt),
      timeoutPromise,
    ]);

    if (result.response.inferenceSource !== InferenceSource.ON_DEVICE) {
      throw new AIError(
        AIErrorCode.UNSUPPORTED,
        "Detection did not run on the device.",
      );
    }

    return result.response.text();
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
