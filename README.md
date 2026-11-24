# Letterlock

Letterlock is a Chrome web app that helps users write firm, well‑structured letters for sensitive personal disputes (e.g., withheld rental deposits, denied insurance claims, medical bill appeals) while keeping private details off the cloud.

## Overview
The user pastes their story with real names and numbers. On‑device detection replaces private details with placeholders. After review, only the placeholder‑filled text is sent to a cloud model to draft the letter. The placeholders are then restored on the device, preserving privacy.

## Goals
1. **Privacy first** – No private details are ever sent to the cloud.
2. **Automatic redaction** – Detect at least 90 % of sensitive values automatically.
3. **Fast end‑to‑end flow** – From story to draft in under 3 minutes.
4. **Transparency** – Show clearly which steps run on‑device vs. in the cloud.

## Core User Flow
1. Open Letterlock in Chrome.
2. Paste story and select dispute type.
3. On‑device model (Gemini Nano 4) + rule‑based check replace private data with placeholders.
4. Review screen shows exact text that will be sent; user can add/remove redactions.
5. Approved placeholder text is sent to a cloud model to draft the letter.
6. Returned letter is verified to contain all placeholders, then real details are restored on the device.
7. User copies the final letter.

## Features
- **On‑device private detail detection** using Gemini Nano 4 and rule‑based checks.
- **Editable review screen** for manual redaction adjustments.
- **Cloud drafting** with placeholder‑preserving prompts.
- **Automatic restoration** of real details after drafting.
- **Privacy badges** indicating which steps ran locally or remotely.

## Repository
The source code is open‑source and includes a license file. See the `README.md` for contribution guidelines.

## Local setup

### 1. Install dependencies

Node.js and pnpm are required.

```powershell
cd frontend
pnpm install
```

### 2. Configure Firebase

Copy the environment example:

```powershell
Copy-Item .env.example .env
```

Fill in the Firebase web app values in `frontend/.env`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (optional)

You can find these values in Firebase Console under **Project settings > Your apps > Web app**.

Do not commit `frontend/.env` or any Firebase App Check debug token.

### 3. Enable the Chrome on-device model

Letterlock is intended to run in Chrome with Gemini Nano support.

Open the following Chrome flag and set it to **Enabled**:

```text
chrome://flags/#prompt-api-for-gemini-nano-multimodal-input
```

The flag name may vary or become unavailable depending on the Chrome channel and version. After changing it, restart Chrome and keep at least one compatible model-supported browser profile.

If the on-device model is unavailable, Letterlock still runs rule-based detection and clearly marks detection as limited.

### 4. Configure App Check debug mode

Firebase App Check must be applied to Firebase AI Logic in:

```text
Firebase Console > App Check > APIs
```

In development builds, the app sets `FIREBASE_APPCHECK_DEBUG_TOKEN=true` before initializing App Check.

Start the app:

```powershell
pnpm dev
```

Open `http://localhost:5173`, open Chrome DevTools, and inspect the Console. On the first App Check initialization, look for a message containing:

```text
AppCheck debug token
```

Register that token in:

```text
Firebase Console > App Check > Apps > Manage debug tokens
```

Each computer and browser environment must generate and register its own debug token. The token is specific to development and must not be committed or shared publicly.

For production, register the app with a supported App Check provider, such as reCAPTCHA v3 or reCAPTCHA Enterprise, and set:

```text
VITE_FIREBASE_APPCHECK_SITE_KEY
```

Production builds must not enable or distribute App Check debug mode.

### 5. Run and validate

```powershell
pnpm dev
pnpm test
pnpm build
```

Open `http://localhost:5173` and test a story through paste, detection, review, cloud drafting, restoration and copy.

