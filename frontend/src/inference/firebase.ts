// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAI, GoogleAIBackend, type AI } from "firebase/ai";
import {
  CustomProvider,
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from "firebase/app-check";
import { env, missingEnvVars } from "../config/env";

let appCheck: AppCheck | null = null;
let firebaseAi: AI | null = null;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

export function getFirebaseAi(): AI {
  if (firebaseAi) {
    return firebaseAi;
  }

  if (!env) {
    throw new Error(
      `Firebase configuration is missing: ${missingEnvVars.join(", ")}`,
    );
  }

  const firebaseApp: FirebaseApp = getApps().length
    ? getApp()
    : initializeApp({
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

      appCheck = initializeAppCheck(firebaseApp, {
        provider: new CustomProvider({
          getToken: () =>
            Promise.reject(
              new Error("App Check debug mode should handle token generation."),
            ),
        }),
        isTokenAutoRefreshEnabled: true,
      });
    } else {
      const siteKey = env.VITE_FIREBASE_APPCHECK_SITE_KEY;
      if (!siteKey) {
        throw new Error(
          "Firebase App Check is missing: VITE_FIREBASE_APPCHECK_SITE_KEY",
        );
      }

      appCheck = initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
    }
  }

  firebaseAi = getAI(firebaseApp, {
    backend: new GoogleAIBackend(),
  });

  return firebaseAi;
}
