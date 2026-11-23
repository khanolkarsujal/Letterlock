# Feature List

Every Letterlock feature, with its priority, the screen it appears on (S1 to S9, from `wireframe.md`) and a check for when it is done. Scope follows `project-overview.md`. Update the Status column as work is finished, and keep `progress-tracker.md` in step.

**Priority**

- **Must** — needed for the core flow, the privacy promise or the hackathon submission. Together these are the minimum demo.
- **Should** — makes the demo and the product noticeably stronger. Build after the Musts.
- **Could** — nice to have. Only if time is left.

**Status:** Not started, In progress, Done. All features are Not started as of Nov 21, 2026.

† Added in `wireframe.md` or the HTML prototype and not yet in `project-overview.md`. Confirm or cut.

## A. Input and setup

| ID | Feature | Priority | Screen | Done when | Status |
| -- | ------- | -------- | ------ | --------- | ------ |
| F1 | Paste your story | Must | S1 | A story can be pasted or typed and is held in memory only. Reloading the page clears it. | Not started |
| F2 | Dispute type choice | Must | S1 | The user can choose deposit dispute, insurance claim or medical bill appeal. Deposit dispute is the default, and the choice selects the letter prompt. | Not started |
| F3 | On-device model status | Must | Top bar, S1 | The top bar shows ready, preparing or unavailable. A progress bar shows while preparing if the browser reports progress. | Not started |
| F4 | Limited-detection notice | Must | S1 | With no local model, the notice appears and detection uses the rules-based checks only. | Not started |

## B. Private detail detection

| ID | Feature | Priority | Screen | Done when | Status |
| -- | ------- | -------- | ------ | --------- | ------ |
| F5 | On-device detection | Must | S2 | Gemini Nano 4 finds names, addresses, lease references, account numbers, phone numbers, emails, amounts and dates in a sample story. The call is set to on-device only and makes no cloud request. | Done |
| F6 | Rules-based checks | Must | S2 | Phone numbers, emails and account numbers in sample stories are found without the on-device model. | Done |
| F7 | Placeholder map | Must | S2 | Each detected value gets a stable placeholder such as Person A or Address 1. The same value always gets the same placeholder. The map exists only in memory. | Not started |
| F8 | Privacy scan screen | Should | S2 | A waiting screen shows while detection runs, with the live swap list, a progress value and the text "Nothing has been sent." The user continues with Proceed to Review. | Not started |

## C. Review and control

| ID | Feature | Priority | Screen | Done when | Status |
| -- | ------- | -------- | ------ | --------- | ------ |
| F9 | Review screen | Must | S3 | Two panels show the user's story with detected values highlighted and the exact text that would be sent. The right panel updates live. | Not started |
| F10 | Detected details list | Must | S3 | The list shows type, original value and placeholder. Removing a detail puts the original value back in the text that would be sent. | Not started |
| F11 | Add a missed detail | Must | S4 | The user can add a value and a type. Every match in the story is replaced, and both panels and the list update. | Not started |
| F12 | Select text to add a redaction † | Should | S3, S4 | Selecting text in the left panel offers an action that opens the dialog with the text filled in. | Not started |
| F13 | Nothing-found notice | Should | S3 | If nothing is detected, a notice asks the user to check their story or add details. | Not started |
| F14 | Pre-send check and blocked state | Must | S3 | If any original value remains in the outgoing text, no request is made and the value is marked in the right panel. | Not started |
| F15 | Approval step | Must | S3 | Nothing is sent to the cloud until the user presses Approve and write letter. | Not started |

## D. Letter drafting

| ID | Feature | Priority | Screen | Done when | Status |
| -- | ------- | -------- | ------ | --------- | ------ |
| F16 | Cloud drafting | Must | S5 | Only the approved placeholder text is sent through Firebase AI Logic, in cloud mode, and a letter comes back. The call accepts no raw story text. | Not started |
| F17 | Deposit dispute prompt | Must | S5 | The prompt produces a firm, well-structured deposit dispute letter that keeps every placeholder exactly as written. | Not started |
| F18 | Insurance claim and medical bill prompts | Should | S5 | Each prompt produces a suitable letter with every placeholder kept. If time runs short, demo deposit disputes only and trim the other two from the scope. | Not started |
| F19 | Returned-placeholder check | Must | S5, S7 | A returned letter is accepted only if it contains every placeholder. Otherwise the app shows error variant B. | Not started |
| F20 | Writing screen with Cancel † | Should | S5 | A waiting screen shows the badge while the letter is written. Cancel returns to the review screen with everything kept. | Not started |
| F21 | Error screen and Try again | Must | S7 | Failed requests and incomplete letters show a clear message. Try again sends exactly the approved text. Back to review keeps everything. | Not started |

## E. Restore and proof

| ID | Feature | Priority | Screen | Done when | Status |
| -- | ------- | -------- | ------ | --------- | ------ |
| F22 | Restore real details | Must | S6 | After the letter passes the check, the original values are put back on the device in the right places. | Not started |
| F23 | Local/cloud badge | Must | S3, S5, S6 | The badge shows where each step actually ran, taken from what the SDK reports. It always has a text label and an icon. | Not started |
| F24 | Letter screen and Copy letter | Must | S6 | The finished letter shows on the paper surface. Copy Full Letter copies it and a confirmation toast appears. | Not started |
| F25 | Start over with confirmation † | Should | S8 | A confirmation dialog appears. Clear everything wipes the story, the placeholder map and the letter from memory and returns to an empty S1. | Not started |

## F. Platform and compliance

| ID | Feature | Priority | Screen | Done when | Status |
| -- | ------- | -------- | ------ | --------- | ------ |
| F26 | Hybrid inference with a mode per step | Must | All | Detection is on-device only and drafting uses the cloud. The mode is set explicitly for every call, and nothing falls back to the cloud silently. | Not started |
| F27 | App Check | Must | All | Firebase AI Logic calls work with App Check, using a debug token for development and the submission. The token is not committed to the repository. | Not started |
| F28 | No third-party scripts, limited third-party assets | Must | All | No analytics or third-party scripts load. React, React Router and Tailwind are bundled from npm. Fonts, icons and the two images load only from the hosts listed in `architecture.md`, with fallbacks, and receive no page content. | Not started |
| F29 | Hosted app URL | Should | — | The app runs at a public URL so judges can try it. The hackathon strongly encourages this. | Not started |
| F30 | Public open-source repository | Must | — | The repo is public with a detectable license, and the code calls Firebase AI Logic at runtime. | Not started |
| F31 | Demo video | Must | — | A video of 3 minutes or less, showing the app working in Chrome, is public on YouTube. | Not started |
| F32 | Devpost description | Must | — | The text sections match what was actually built and say how Firebase AI Logic is used. | Not started |

## G. Quality

| ID | Feature | Priority | Screen | Done when | Status |
| -- | ------- | -------- | ------ | --------- | ------ |
| F33 | Phone layouts † | Should | S9 | All screens work at phone width. Panels stack and the approval bar stays reachable. | Not started |
| F34 | Accessibility | Should | All | Focus moves to the heading on each screen. Dialogs trap focus and close with Escape. Status changes are announced. Text meets 4.5:1 contrast. | Not started |
| F35 | Tests for redaction and checks | Must | — | Unit tests cover replace, restore, the pre-send check and the returned-placeholder check, using invented sample stories only. | Done |

## H. Added by the HTML prototype

These appear in the prototype but not in `project-overview.md`. Confirm or cut each one.

| ID | Feature | Priority | Screen | Done when | Status |
| -- | ------- | -------- | ------ | --------- | ------ |
| F36 † | Download letter as .txt | Could | S6 | The restored letter downloads as a text file and a toast confirms it. | Not started |
| F37 † | Print letter | Could | S6 | The button opens the browser print dialog with the restored letter. | Not started |
| F38 † | Intake hero, explainer cards and feature cards | Could | S1 | The hero, the three "What is Letterlock?" cards and the three feature cards show on S1. Copy must not claim "works offline" or "backed by law". | Not started |
| F39 † | Letter summary tiles and "What to do next" | Could | S6 | Tiles show amount, recipient and privacy status. The statutory deadline tile and the escalation step conflict with the out-of-scope list (no legal deadlines, no escalation guidance), so cut them or change the scope first. | Not started |
| F40 † | Toast confirmations | Could | S6 | A short toast confirms Copy and Download, and is announced to screen readers. | Not started |

## Not in this version

These match the out-of-scope list in `project-overview.md`.

- User accounts, saved case history and any server-side storage
- Uploading documents, screenshots or other evidence
- Legal advice, and jurisdiction-specific citations or deadlines
- Evidence checklists, follow-up letters and reminders, and escalation guidance
- Editing the letter inside the app, and exporting to PDF
- Sending the letter on the user's behalf
- Android and iOS apps

## Suggested build order

1. F26, F27 and F5 as a feasibility spike: confirm the on-device model works in on-device-only mode in Chrome.
2. F7, F14, F19, F22 and F35: the redaction logic, with tests, before any screen depends on it.
3. F6 and the full F5: detection.
4. F1 to F4 and F9 to F11 and F15: the input and review screens.
5. F16, F17 and F21: cloud drafting and errors.
6. F23 and F24: the badge and the letter screen.
7. The Shoulds, then F28, F30, F31 and F32 for the submission.