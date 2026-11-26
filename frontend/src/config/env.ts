import { z } from "zod";

const envVars = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  VITE_FIREBASE_APP_ID: z.string().min(1),
  VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  VITE_FIREBASE_APPCHECK_SITE_KEY: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
});

const parsedEnv = envVars.safeParse(import.meta.env);

/**
 * Firebase is optional while the app runs local rules-only detection.
 */
export const env = parsedEnv.success ? parsedEnv.data : null;

export const missingEnvVars = parsedEnv.success
  ? []
  : parsedEnv.error.issues
      .map((issue) => issue.path[0])
      .filter((name): name is string => typeof name === "string");
