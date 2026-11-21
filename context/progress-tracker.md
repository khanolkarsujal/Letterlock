# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Planning and documentation. No code has been written yet. (As of Nov 21, 2026.)

## Current Goal

- Prove the core technical bet works before building anything else: in Chrome, call Gemini Nano 4 through Firebase AI Logic in on-device-only mode, and see what happens when no local model is available.

## Completed

- Chose the idea: a privacy-first AI letter writer for sensitive disputes (deposit, insurance claim, medical bill appeal), with on-device redaction and cloud drafting.
- Proposed the name Letterlock and the tagline "Write the letter. Keep the details." Neither is confirmed yet.
- Made a 16:9 thumbnail: https://claude.ai/artifact/49qoV7U9WncDMDWATXU4XE
- Drafted the Devpost text sections: Inspiration, What it does, and How we built it. "How we built it" describes the planned design and must be corrected to match what actually gets built.
- Filled in project-overview.md and architecture.md.
- Collected the #BuildHybridAI 2026 requirements, judging criteria and deadline.
- Built an HTML design prototype (light purple style, Ethereal Bloom Fintech board) and rewrote ui-context.md, wireframe.md and architecture.md to match it (Nov 21, 2026). Added featurelist.md, mvpdemo.md and ai-workflow-rules.md.

## In Progress

- None yet.

## Next Up

1. **First unit to build: the feasibility spike.** In Chrome, confirm Gemini Nano 4 is available and can be called through Firebase AI Logic in on-device-only mode. Record what happens on a device with no local model.
2. Set up the Vite + TypeScript app with Firebase and App Check (debug token).
3. Build the redaction module (placeholder map, replace, restore, pre-send check, returned-placeholder check) and test it on sample stories.
4. Build detection: on-device model plus the rules-based checks.
5. Build the review screen with add and remove redactions.
6. Connect cloud drafting, with a prompt per dispute type.
7. Build restoration and the local/cloud badge.
8. Add an open-source license, publish the repo, host the app, record the 3-minute demo video and submit.

## Open Questions

- Is the name Letterlock final?
- Is it a Chrome web app or a Chrome extension? The documents currently say web app.
- Which cloud model will write the letter?
- What is the exact Firebase AI Logic setting for on-device-only, and does it behave as expected in Chrome?
- On a device with no local model, do we run only the rules-based checks, or tell the user the device is not supported?
- Do we demo all three dispute types, or one fully worked type (deposit) with the others as prompt options?
- What do we use as the test set for detection, and what detection rate can we honestly report? The 90% on 10 stories in project-overview.md is a placeholder target.
- Which open-source license? Apache is preferred by the hackathon.
- Are Vite, React and Firebase Hosting the final choices? They are suggestions in architecture.md. React Router 6 (MemoryRouter) and Tailwind CSS 3 were added from the prototype.
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