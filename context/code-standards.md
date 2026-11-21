# Code Standards

## General

- Keep modules small and single-purpose. The code that handles private data lives in a few clearly named modules and is not spread across the app.
- Fix root causes. Do not layer workarounds on top of a broken check or a wrong placeholder.
- Do not mix unrelated concerns in one module or component. Detection, redaction, inference and UI stay separate.
- Never write raw story text, original sensitive values or the placeholder map to logs, errors, analytics or URLs.
- Write tests for the redaction module and its checks before the UI depends on them.
- Update progress-tracker.md after every meaningful change, and keep project-overview.md and architecture.md accurate.

## TypeScript

- Strict mode is required throughout the project.
- Avoid `any`. Use explicit interfaces, narrowly scoped types, or `unknown` with narrowing.
- Validate unknown external input before trusting it. Output from either model is external input: check its shape, the types of detected values and that every position falls inside the story text before using it.
- Use distinct types for raw text and approved outbound text. Only the redaction module can create approved outbound text, so the compiler rejects raw text passed to the cloud call.
- Use exhaustive checks on unions such as placeholder types and where a step ran, so a new case cannot be missed.
- Do not use non-null assertions (`!`) without a comment explaining why the value cannot be null.

## React and Vite

- Use function components and hooks. Keep components presentational. Detection, redaction and inference logic lives in its own modules.
- Components never call Firebase AI Logic directly. They go through `src/inference`.
- Keep the raw story and the placeholder map in in-memory state only. Never put them in the URL, local storage, session storage, IndexedDB, cookies or any third-party script.
- Handle each state of the on-device model explicitly in the UI: available, still preparing, and unavailable. Never leave the user guessing.
- Use React Router's `MemoryRouter`, so routes never appear in the URL or browser history.
- Load no third-party analytics or scripts that could read page content. React, React Router and Tailwind are installed from npm and bundled by Vite, not loaded from CDNs. The only third-party requests are the font, icon and image assets listed in `architecture.md`, and none of them receives page content.

## Styling

- Use Tailwind CSS. Colors, radii and fonts are tokens defined once in the Tailwind config and `src/ui/styles/tokens.css` (see `ui-context.md`). Components use the token class names, never arbitrary values such as `bg-[#5b46e8]` or hardcoded hex.
- Third-party fonts, icons and images are allowed only from the hosts listed in `architecture.md`. Fonts need a real fallback stack, icons must not be the only carrier of meaning, and every image needs `alt` text and a plain fallback block in case it fails to load.
- UI copy about privacy says what is true: private details "stay on your device" and nothing is sent without approval. Do not write "never leaves", "100% private", "100% on-device" or "works offline", because the drafting step uses the cloud.
- Meet WCAG AA contrast, 4.5:1 for normal text.
- Use real buttons, links and labeled inputs. Icon-only controls need an `aria-label`.
- The local/cloud badge must use a text label as well as color and icons, so it is readable without telling colors apart.
- Show placeholders on the review screen in a clearly distinct style, so the user can see at a glance what was replaced.

## Inference Calls

There are no API routes, because the app has no backend of its own. These rules apply to every call to Firebase AI Logic.

- All model calls go through `src/inference`.
- Set the inference mode explicitly for every call. Never rely on the default. Detection is on-device only. Drafting uses the cloud.
- The cloud drafting call accepts only approved outbound text.
- Never fall back silently to the cloud. If the on-device model is unavailable, run the rules-based checks only and tell the user detection is limited.
- Never retry a failed cloud call with different text than the user approved.
- Every call reports where it actually ran. The badge is built from that report and is never hard-coded.
- Handle failures (model unavailable, timeout, App Check failure, a letter missing placeholders) with a clear message to the user and no partial result shown as final.
- Use App Check on all Firebase AI Logic calls. Do not commit debug tokens to the repository.
- Keep prompts in `src/prompts`, not inline in components.

## Data and Storage

- Nothing is persisted. The story, placeholder map, cleaned text and letters live in memory only and are cleared when the user starts over.
- The placeholder map lives only inside the redaction module.
- Do not store original sensitive values anywhere except the in-memory story and map.
- Test data and the demo use invented names, addresses and numbers only. The public repository contains no real personal details.

## File Organization

- `src/detection/` — On-device detection and the rules-based checks. Never calls the cloud.
- `src/redaction/` — The placeholder map, replace and restore, the pre-send check and the returned-placeholder check. The only place that can produce approved outbound text.
- `src/inference/` — Firebase AI Logic and App Check setup, the per-step inference calls and the report of where each call ran.
- `src/prompts/` — The letter prompts for each dispute type.
- `src/ui/` — Screens, components, the badge and the style tokens.
- `src/lib/` — Small shared helpers with no access to the raw story or the placeholder map.
- `tests/` — Unit tests for redaction, the checks and the detection rules, using invented sample stories.
- Repository root — `LICENSE` (open source), `README.md`, and the project docs: project-overview.md, architecture.md, progress-tracker.md and code-standards.md.