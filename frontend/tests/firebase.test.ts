import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Firebase & App Check initialization", () => {
  beforeEach(() => {
    vi.resetModules();
    delete (globalThis as { FIREBASE_APPCHECK_DEBUG_TOKEN?: unknown })
      .FIREBASE_APPCHECK_DEBUG_TOKEN;
  });

  it("initializes Firebase once for letterlock-fc6f1, enables debug mode before App Check, avoids ReCaptchaV3Provider in dev, and caches AI", async () => {
    const fakeApp = {
      name: "[DEFAULT]",
      options: {
        projectId: "letterlock-fc6f1",
        appId: "1:356443770936:web:97c271575683e3369c56cd",
      },
    };
    const fakeAi = { app: fakeApp };
    const fakeAppCheck = { app: fakeApp };
    let debugTokenAtInitTime: unknown;

    const initializeAppMock = vi.fn(() => fakeApp);
    const getAppsMock = vi.fn(() => [] as unknown[]);
    const getAppMock = vi.fn(() => fakeApp);
    const initializeAppCheckMock = vi.fn(() => {
      debugTokenAtInitTime = (
        globalThis as { FIREBASE_APPCHECK_DEBUG_TOKEN?: unknown }
      ).FIREBASE_APPCHECK_DEBUG_TOKEN;
      return fakeAppCheck;
    });
    const customProviderMock = vi.fn(function CustomProvider(opts: unknown) {
      return { kind: "custom", opts };
    });
    const recaptchaProviderMock = vi.fn(function ReCaptchaV3Provider(
      siteKey: string,
    ) {
      return { kind: "recaptcha", siteKey };
    });
    const getAiMock = vi.fn(() => fakeAi);
    const googleAiBackendMock = vi.fn(function GoogleAIBackend() {
      return { kind: "google-ai" };
    });

    vi.doMock("firebase/app", () => ({
      initializeApp: initializeAppMock,
      getApps: getAppsMock,
      getApp: getAppMock,
    }));
    vi.doMock("firebase/app-check", () => ({
      initializeAppCheck: initializeAppCheckMock,
      CustomProvider: customProviderMock,
      ReCaptchaV3Provider: recaptchaProviderMock,
    }));
    vi.doMock("firebase/ai", () => ({
      getAI: getAiMock,
      GoogleAIBackend: googleAiBackendMock,
    }));
    vi.doMock("../src/config/env", () => ({
      env: {
        VITE_FIREBASE_API_KEY: "test-api-key",
        VITE_FIREBASE_AUTH_DOMAIN: "letterlock-fc6f1.firebaseapp.com",
        VITE_FIREBASE_PROJECT_ID: "letterlock-fc6f1",
        VITE_FIREBASE_STORAGE_BUCKET: "letterlock-fc6f1.firebasestorage.app",
        VITE_FIREBASE_MESSAGING_SENDER_ID: "356443770936",
        VITE_FIREBASE_APP_ID: "1:356443770936:web:97c271575683e3369c56cd",
      },
      missingEnvVars: [],
    }));

    const { getFirebaseAi } = await import("../src/inference/firebase");

    const ai1 = getFirebaseAi();
    const ai2 = getFirebaseAi();

    expect(ai1).toBe(fakeAi);
    expect(ai2).toBe(ai1);
    expect(initializeAppMock).toHaveBeenCalledTimes(1);
    expect(initializeAppMock).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "letterlock-fc6f1",
        appId: "1:356443770936:web:97c271575683e3369c56cd",
      }),
    );
    expect(initializeAppCheckMock).toHaveBeenCalledTimes(1);
    expect(debugTokenAtInitTime).toBe(true);
    expect(customProviderMock).toHaveBeenCalledTimes(1);
    expect(recaptchaProviderMock).not.toHaveBeenCalled();
    expect(getAiMock).toHaveBeenCalledTimes(1);
  });
});
