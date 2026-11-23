# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Core Implementation. Feasibility spike confirmed in Chrome and Brave (Nov 21, 2026).

## Current Goal

- Wire detection and redaction into the intake and review screens: live detection on paste, the model-status indicator and limited-detection notice (F1 to F4, F7 to F15).

## Completed

- Chose the idea: a privacy-first AI letter writer for sensitive disputes (deposit, insurance claim, medical bill appeal), with on-device redaction and cloud drafting.
- Proposed the name Letterlock and the tagline "Write the letter. Keep the details." Neither is confirmed yet.
- Made a 16:9 thumbnail: https://claude.ai/artifact/49qoV7U9WncDMDWATXU4XE
- Drafted the Devpost text sections: Inspiration, What it does, and How we built it. "How we built it" describes the planned design and must be corrected to match what actually gets built.
- Filled in project-overview.md and architecture.md.
- Collected the #BuildHybridAI 2026 requirements, judging criteria and deadline.
- Built an HTML design prototype (light purple style, Ethereal Bloom Fintech board) and rewrote ui-context.md, wireframe.md and architecture.md to match it (Nov 21, 2026). Added featurelist.md, mvpdemo.md and ai-workflow-rules.md.
- Implemented the detection engine (`src/detection/`): rules-based checks for emails, phones and account numbers; on-device detection through `runOnDevice` in on-device-only mode; strict `zod` validation of the model output; values located by real offsets in the story; merge/dedupe by longest match; a testable pipeline that reports `available | preparing | unavailable` plus a `limited` flag. No cloud fallback. 22 Vitest tests (F5, F6).
- Implemented the redaction core (`src/redaction/`): in-memory `RedactionMap`, `redactStory` (brands `ApprovedOutboundText` only after the pre-send check), `restoreText`, `findLeaks` and `checkReturnedPlaceholders`, with 19 Vitest tests (F35).
- Hardened the cloud drafting call (`src/inference/cloudDrafting.ts`): model pinned, defensive timeout and cancellation, separate system instruction, SDK error classification and runtime `inferenceSource`. Still not wired to the UI.
- Moved prompts to `src/prompts/`. `ApprovedOutboundText` now belongs to `src/redaction/`.
- Wired live detection into the intake story editor: paste and edits trigger the detection pipeline after a short debounce, detected values replace the intake mock entities, and the UI reports model preparation, availability and limited detection.
- Hardened the intake integration: detection presentation mapping is isolated, unexpected detection failures are shown without exposing story data, and reset invalidates in-flight detection results.
- Made Firebase configuration lazy and optional at startup: an empty local `.env` now allows rules-only detection instead of a Zod crash, while Firebase callers report missing configuration when cloud or local model access is requested.
- Added a development-only console summary for completed detection runs. It reports status, limits, unique value count, occurrence count and counts by kind without logging private text or placeholder maps.
- Added deterministic rules for explicitly introduced full names and titled names, so “My name is Priya Sharma” and “Mr Rao” remain detectable when the on-device model omits them.

## In Progress

- None. Intake detection is wired; the review UI still uses mock redaction behavior.

## Next Up

1. Build the review screen UI with interactive add/remove redactions and wire the redaction module into it (F7, F14, F19, F22).
2. Connect cloud drafting via Firebase AI Logic (`InferenceMode.ONLY_IN_CLOUD`), with the returned-placeholder check before restoration.
3. Build local restoration and real runtime local/cloud badge.
4. Add open-source license, publish repo, deploy to Firebase Hosting, record 3-minute demo video and submit.

## Open Questions

- Is the name Letterlock final?
- Is it a Chrome web app or a Chrome extension? The documents currently say web app.
- Which cloud model will write the letter? **RESOLVED:** `gemini3.8-flash`, pinned in `src/inference/cloudDrafting.ts`. Confirm the exact Firebase AI model id before deployment.
- **RESOLVED in Spike:** What is the exact Firebase AI Logic setting for on-device-only, and does it behave as expected in Chrome?
  - *Answer:* `mode: InferenceMode.ONLY_ON_DEVICE` with `onDeviceParams: { createOptions: { expectedInputs, expectedOutputs } }`. It throws `AIErrorCode.API_NOT_ENABLED` if the local model is missing or unready, preventing silent cloud leakage.
- **RESOLVED in Spike:** On a device with no local model or unready download, we cleanly run local rules-based checks and display the limited-detection notice.
- Do we demo all three dispute types, or one fully worked type (deposit) with the others as prompt options?
- What do we use as the test set for detection, and what detection rate can we honestly report? The 90% on 10 stories in project-overview.md is a placeholder target.
- Which open-source license? Apache 2.0 is preferred by the hackathon.
- **RESOLVED:** Package manager is `pnpm` with Vite, React 18, React Router 6 (MemoryRouter), and Tailwind CSS 3.
- architecture.md invariant 4 now allows third-party font, icon and image assets (Google Fonts, Google-hosted images) while still banning analytics and third-party scripts. This is a change in how the invariant is worded, so confirm it is acceptable. The assets reveal the visitor's IP address to those hosts.
- The prototype letter screen shows a "Statutory Deadline" tile and an "Escalate if necessary / small claims court" step. project-overview.md puts legal deadlines and escalation guidance out of scope. Cut them from the design, or change the scope?
- The prototype copy says "100% Private", "100% On-Device Synthesized", "Your data never leaves your device" and "Works Offline". These contradict the claim wording below and the cloud drafting step. Rewrite the copy.
- The prototype letter screen has no local/cloud badge, which success criterion 6 requires. Add it (see wireframe.md, S6).
- The 16:9 thumbnail was made for the earlier dark navy and amber look. Does it need redoing to match the light purple design?
- Keep or cut the prototype extras: Download .txt, Print Letter, the intake explainer cards and the letter summary tiles (F36 to F40 in featurelist.md).

## Architecture Decisions

- **Each step has its own inference mode; detection is on-device only.** Hybrid inference normally falls back to the cloud when no local model exists, and for detection that would send the raw story to the cloud. Only the drafting step uses the cloud.
- **No accounts and nothing persisted.** The placeholder map and story live only in memory. This keeps the privacy claim simple and removes a database and sign-in from the build.
- **Three safeguards around the cloud call:** the review screen, a pre-send check, and a check that the returned letter has every placeholder. Detection will miss some things, so the user's review is what makes the privacy claim hold.
- **Claim wording:** say private details "stay on your device" and that nothing is sent without the user's approval. Do not say "never leave" or "we catch everything."
- **Local/cloud badge is built from where each step actually ran,** so it is evidence and not a promise.
- **Stack additions from the prototype (Nov 21, 2026):** React Router 6 with MemoryRouter and Tailwind CSS 3, both installed from npm and bundled by Vite. Fonts (Plus Jakarta Sans, Playfair Display, JetBrains Mono), Material Symbols icons and two illustrations stay on third-party hosts so the site matches the prototype. No analytics or third-party scripts.

## Session Notes

- Deadline: Dec 1, 2026 at 3:30am GMT+5:30, about 10 days after Nov 21.
- Submission needs: a working demo, a public repo with a detectable open-source license that calls Firebase AI Logic at runtime, a YouTube video of 3 minutes or less, and a text description. A hosted project URL is strongly encouraged.
- Judging covers technological implementation (use of hybrid inference), design, potential impact and quality of the idea. The Best Web/Chrome App prize is $3,000.
- The Google Account Quota is optional and only needed for advanced features. The last request is Wed Nov 25, 10:00 AM PT.
- project-overview.md and architecture.md include assumptions that are not confirmed: the name, the rules-based check, the folder layout, the stack choices and the numeric goals. Correct them as decisions are made.
