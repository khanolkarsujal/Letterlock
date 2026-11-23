// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAI, GoogleAIBackend } from "firebase/ai";
import { env, missingEnvVars } from "../config/env";

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

  return getAI(firebaseApp, {
    backend: new GoogleAIBackend(),
  });
}
