# Architecture Context

## Stack

| Layer              | Technology                                        | Role                                                                                              |
| ------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Framework          | Vite + TypeScript                                 | Builds a client-side web app for Chrome. There is no backend of our own.                          |
| UI                 | React 18                                          | Screens, state, review flow and the local/cloud badge.                                            |
| Routing            | React Router 6 (`MemoryRouter`)                   | Moves between screens. The route is kept in memory, so nothing about the flow appears in the URL or browser history. |
| Styling            | Tailwind CSS 3 (with the forms and container-queries plugins) | Utility classes. The colour, radius and font tokens from `ui-context.md` live in the Tailwind config. |
| Fonts              | Plus Jakarta Sans, Playfair Display, JetBrains Mono (Google Fonts) | Loaded from Google Fonts, as in the prototype. See Third-Party Resources.            |
| Icons              | Material Symbols Outlined (Google Fonts)          | Icon font, as in the prototype. See Third-Party Resources.                                        |
| Images             | Two hosted illustrations (Google-hosted)          | Hero envelope-and-shield image and the guardian cloud mascot. See Third-Party Resources.          |
| Inference SDK      | Firebase AI Logic hybrid inference SDK (web)      | Runs every model call. Each step picks its own mode: on-device only for detection, cloud for drafting. |
| On-device model    | Gemini Nano 4 in Chrome                           | Finds private details in the pasted story, on the device.                                         |
| Cloud model        | A cloud model reached through Firebase AI Logic   | Writes the letter from the placeholder-only text.                                                 |
| Detection rules    | TypeScript pattern checks                         | Catches structured identifiers (phone numbers, emails, account numbers). Works without the local model. |
| Abuse protection   | Firebase App Check                                | Required by Firebase AI Logic. Debug tokens are used in development and for the submission.       |
| Auth               | None                                              | No user accounts.                                                                                 |
| Database           | None                                              | Nothing is persisted.                                                                             |
| Hosting            | Firebase Hosting                                  | Serves the static app so judges can try it.                                                       |

## System Boundaries

- `src/detection` — Finds private details in the pasted story. Calls the on-device model (on-device only) and runs the rules-based checks. Returns a list of found values with a type for each. It never talks to the cloud.
- `src/redaction` — Owns the placeholder map and the text transforms. Replaces values with placeholders, restores real values into the returned letter, and runs the pre-send check and the returned-placeholder check. It is the only place that can produce text approved for the cloud.
- `src/inference` — Sets up Firebase AI Logic and App Check, and exposes two calls: one for on-device detection and one for cloud drafting. It chooses the inference mode for each call and reports where each call actually ran.
- `src/prompts` — The letter prompts for each dispute type. They tell the model to keep every placeholder exactly as written.
- `src/ui` — Screens and state for intake, scan, review, generating, connection error, result and the badge. It shows what was detected and what will be sent, and it holds the user's approval. It owns the router and the Tailwind setup.
- `src/lib` — Small shared helpers, with no access to the placeholder map or the raw story.

## Screens and Routes

The router is a `MemoryRouter`, so these paths never reach the address bar.

| Route               | Screen            |
| ------------------- | ----------------- |
| `/`                 | Intake (paste)    |
| `/scan`             | Privacy scan      |
| `/review`           | Pre-flight review |
| `/generating`       | Drafting          |
| `/connection-error` | Connection paused |
| `/letter`           | Finished letter   |

## Third-Party Resources

The prototype was built with these resources, and the real app uses the same ones so it can be recreated exactly. They are static look-and-feel assets. None of them is ever given the story, the placeholder map or the letter.

| Resource                    | Where it comes from                                   | Used for                                           |
| --------------------------- | ----------------------------------------------------- | -------------------------------------------------- |
| Plus Jakarta Sans (400 to 800), Playfair Display (600, italic 500 and 600), JetBrains Mono (400 to 600) | `fonts.googleapis.com` and `fonts.gstatic.com` | All text, serif accent, placeholder tags |
| Material Symbols Outlined   | `fonts.googleapis.com` and `fonts.gstatic.com`        | All icons                                          |
| Hero illustration (envelope and shield in lilac flora) | `lh3.googleusercontent.com` (URL from the prototype) | Intake screen |
| Guardian cloud mascot       | `lh3.googleusercontent.com` (URL from the prototype)  | Scan and generating screens                        |
| React 18, React Router 6.3, Tailwind CSS 3 | npm packages, bundled by Vite               | The app itself (the prototype loaded these from unpkg and the Tailwind CDN; a Vite build installs the same libraries from npm instead) |

Rules for these resources:

- Only the hosts listed above may be contacted for assets. No other third-party host is added.
- The app sets a Content Security Policy that allows scripts only from the app's own origin and Firebase, and fonts, styles and images only from the hosts in the table.
- The two hosted images are the least stable resource, because their URLs are not under our control. Each image has an `alt` text and a plain fallback (a soft lilac block) so the screen still works if one fails to load.
- Fonts and icons use `font-display: swap` and a real fallback stack, so text and layout stay usable if the font host is slow or blocked.
- These requests reveal the visitor's IP address and browser details to the asset hosts, as any hosted font or image does. They never carry page content.

## Storage Model

- **In memory (browser tab only)**: The original story, the placeholder map, the cleaned text, the returned letter and the restored letter. All of it is cleared when the user starts over or closes the tab.
- **Nothing persisted**: There is no database, no local storage, no cloud storage and no server-side record of stories, mappings or letters. The only data that leaves the device is the approved placeholder text for the drafting call. What the cloud provider does with that text is governed by its own terms.

## Auth and Access Model

- There is no sign-in. The app is public and anonymous.
- Everything belongs to the current tab session. There are no shared or saved records, so there is no ownership to manage.
- Firebase App Check protects the calls to Firebase AI Logic.
- Inside the code, the cloud drafting call only accepts text that the redaction module has produced after the user approved it and the pre-send check passed. The types make it impossible to pass raw story text to that call.

## Invariants

1. The raw story and the placeholder map never leave the device. Only approved placeholder text is passed to the cloud call.
2. The detection step always runs in on-device-only mode and never falls back to the cloud. If no local model is available, only the rules-based checks run and the app says detection is limited.
3. A cloud request is made only after the user explicitly approves the review screen and the pre-send check finds none of the original values in the outgoing text.
4. The placeholder map and raw story are never logged, persisted, put in a URL or sent to analytics. The app loads no analytics and no third-party scripts. The only third-party requests are the font, icon and image assets listed under Third-Party Resources, and none of them receives page content.
5. A returned letter is accepted only if it contains every placeholder. Otherwise the user sees an error and can retry. Real details are restored only after that check passes.
6. The local/cloud badge is built from where each step actually ran, as reported at runtime, and is never hard-coded.