// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAI, GoogleAIBackend } from "firebase/ai";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from "firebase/app-check";
import { env, missingEnvVars } from "../config/env";

let appCheck: AppCheck | null = null;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

export function getFirebaseAi() {
  if (!env) {
    throw new Error(
      `Firebase configuration is missing: ${missingEnvVars.join(", ")}`,
    );
  }

  const firebaseApp = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  });

  if (!appCheck) {
    if (import.meta.env.DEV) {
      const debugGlobal = globalThis as typeof globalThis & {
        FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean;
      };
      debugGlobal.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    const siteKey = env.VITE_FIREBASE_APPCHECK_SITE_KEY;
    if (!import.meta.env.DEV && !siteKey) {
      throw new Error(
        "Firebase App Check is missing: VITE_FIREBASE_APPCHECK_SITE_KEY",
      );
    }

    appCheck = initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaV3Provider(siteKey ?? "app-check-debug"),
      isTokenAutoRefreshEnabled: true,
    });
  }

  return getAI(firebaseApp, {
    backend: new GoogleAIBackend(),
  });
}
