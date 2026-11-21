# MVP and Demo Plan

What Letterlock must do to be demo-ready for #BuildHybridAI 2026, how to show it in under 3 minutes, and what to cut if time runs short. Features are numbered as in `featurelist.md` and screens as in `wireframe.md`.

**Deadline:** Dec 1, 2026 at 3:30am GMT+5:30. Plan to submit by the evening of Mon Nov 30 so there is a buffer.

## The MVP

The MVP is every **Must** feature in `featurelist.md`. In one sentence: a user pastes a story in Chrome, the device replaces private details with placeholders, the user reviews and approves the exact outgoing text, the cloud writes a letter from the placeholders, and the device puts the real details back and shows where each step ran.

**Demo goal.** In 3 minutes, prove three things:

1. The user gets a strong, usable letter.
2. Private details stay on the device unless the user approves them, and the user can see and control what is sent.
3. Hybrid inference is used on purpose: on-device for detection, cloud for drafting, with no silent fallback.

**The MVP is demo-ready when** all of these are true (they come from the success criteria in `project-overview.md`):

- [ ] A sample story produces a review screen with placeholders before any cloud request is made.
- [ ] The network tools show none of the original values in the outgoing request.
- [ ] A missed detail can be added and a wrong one removed, and the outgoing text changes.
- [ ] The returned letter has every placeholder, and every original value is restored in the right place.
- [ ] With no local model, detection makes no cloud request, runs the rules only and shows the limited-detection notice.
- [ ] The badge matches what actually ran.
- [ ] The repo is public with a detectable open-source license and calls Firebase AI Logic at runtime.
- [ ] The video is 3 minutes or less and public on YouTube.

## Cut line

Build in the order in `featurelist.md`. If you fall behind, cut in this order and never cut a Must:

1. F18 Insurance claim and medical bill prompts. Demo deposit disputes only, and remove the other two types from the scope in `project-overview.md`.
2. F33 Phone layouts.
3. F12 Select text to add a redaction.
4. F20 Cancel on the writing screen.
5. F13 Nothing-found notice and F8 Finding-details screen.
6. F25 Start over confirmation. Keep a plain Start over that clears everything.
7. F34 Accessibility beyond the basics (labels, contrast, focus on dialogs).

F29 (hosted URL) is a Should, but the hackathon strongly encourages it. Cut it last.

## Schedule to the deadline

A proposal. Adjust it to your time.

| Dates | Focus | Features |
| ----- | ----- | -------- |
| Sat Nov 21 to Sun Nov 22 | Feasibility spike and app setup. **Decision gate:** does the on-device model work in on-device-only mode? | F26, F27, F5 |
| Mon Nov 23 to Tue Nov 24 | Redaction logic with tests, and the rules-based checks | F7, F14, F19, F22, F35, F6 |
| Wed Nov 25 to Thu Nov 26 | Input and review screens | F1 to F4, F9 to F11, F15 |
| Fri Nov 27 | Cloud drafting, errors, badge and letter screen | F16, F17, F21, F23, F24 |
| Sat Nov 28 | Shoulds, hosting, license and README | F29, F30, the Shoulds |
| Sun Nov 29 | Rehearse, record the video, write the Devpost text, test on a clean browser | F31, F32 |
| Mon Nov 30 | Submit, with time to spare | — |

## Demo story and data

Use invented data only. This is the story used in the wireframes:

> I moved out of 14 Oak Street on 3 June. My landlord, Mr Rao, has kept my deposit of 1,200 and has stopped replying. My name is Priya Sharma, lease ref LS-20418. You can call me on 98765 43210.

- Expected detections: Priya Sharma (Person A), 14 Oak Street (Address 1), Mr Rao (Person B), 3 June (Date 1), 1,200 (Amount 1), LS-20418 (Lease 1), 98765 43210 (Phone 1).
- **The missed-detail moment:** pick one detail that the app really misses when you rehearse (for example a shop or a nickname you add to the story) and add it by hand on camera. Do not stage a miss the app doesn't make. The demo should show the review screen doing its job on a real miss.

## The 3-minute script

Aim for about 2:50. Only the first 3 minutes are judged, so end with room to spare.

| Time | Screen | On screen | Voiceover |
| ---- | ------ | --------- | --------- |
| 0:00 to 0:15 | Title | Thumbnail or title card | "This is Priya. Her landlord is keeping her deposit and ignoring her messages. She needs a firm letter, but she doesn't want to paste her name, address and bank details into a chatbot." |
| 0:15 to 0:35 | S1 | Top bar shows the model is ready. Paste the story and keep Deposit dispute selected. | "This is Letterlock. She pastes her story exactly as it happened, real names and numbers included. The on-device model is ready, and her story stays on her device." |
| 0:35 to 1:05 | S2, S3, S4 | Detection runs, then the review screen. Point to the left and right panels. Add the missed detail. | "Letterlock finds the private details on her device and swaps them for placeholders. On the left is her story. On the right is the exact text that would leave her device. The app missed one detail, so she adds it, and it is replaced everywhere." |
| 1:05 to 1:25 | S3 | Open the browser's network tools, then press Approve. Show the request. | "Nothing has been sent yet. When she approves, only the right-hand text goes to the cloud. Here is the request in Chrome's network tab: placeholders only, no real name and no address." |
| 1:25 to 1:50 | S5, S6 | The writing screen, then the letter with the badge. Press Copy. | "The cloud model writes the letter using the placeholders. Back on her device, her real details are put back in. The badge shows what ran where: on the device, in the cloud, on the device." |
| 1:50 to 2:20 | S1 | The limited-detection notice on a device or profile with no local model. | "This is hybrid inference with Firebase AI Logic. Detection is set to run on the device only, so it can never fall back to the cloud. With no local model, Letterlock says so and uses simple rules instead. Only the writing step uses the cloud." |
| 2:20 to 2:45 | Title | Short list: deposits, insurance claims, medical bills | "Insurance claims and medical bills have the same problem, with details just as private. People shouldn't have to choose between a good letter and their privacy." |
| 2:45 to 3:00 | Title | Name, tagline, repo and app links | "Letterlock. Write the letter. Keep the details. The code is open source, and you can try it at the link below." |

Notes:

- If F18 is cut, change the 2:20 segment to talk only about deposits and say other disputes are next.
- Show the no-model case from a second Chrome profile or device that has no local model. Do not add a hidden switch to the app just for the demo unless you decide it is worth building.
- In the 1:05 segment, filter the network tools to the Firebase AI Logic request so the placeholder text is easy to read. Rehearse this, because it is the proof that makes the privacy claim believable.
- The voiceover must be in English, or the video needs English subtitles.
- Detection now ends on a scan screen with a Proceed to Review button, so allow a second or two for that click in the 0:35 segment.
- The network tools will also show font, icon and image requests to Google hosts. Filtering to the Firebase AI Logic request in the 1:05 segment hides them. If someone asks, say those are static assets and carry no story text.

## What the demo shows for each judging criterion

| Criterion | What the demo shows |
| --------- | ------------------- |
| Technological implementation | A different inference mode for each step: on-device only for detection, cloud for drafting. The no-model case. The badge built from what actually ran. |
| Design | A complete flow from paste to finished letter, with a review screen, errors and a clear badge. |
| Potential impact | Priya, a real problem for a real audience, and the network request as proof of the privacy claim. |
| Quality of the idea | Hybrid inference used so that privacy is something the user can see and check, instead of something promised. |

## Risks and fallbacks

| Risk | What to do |
| ---- | ---------- |
| The on-device model doesn't work in Chrome by the Nov 22 gate | Ask in #hackathon-help on the Devpost Discord. If it stays blocked, rely on the rules-based checks for detection and be honest about that in the demo and the description. The review screen still gives the user control. |
| On-device detection is slow | Keep the demo story short and warm up the model before recording. |
| The cloud letter comes back missing a placeholder | Tune the prompt. Rehearse with the demo story until it works every time, and keep Try again ready. |
| The demo runs over 3 minutes | Rehearse with a timer. Cut the 2:20 segment first, then shorten the 0:00 segment. |
| Network problems while recording | Record on a stable connection and record more than one take. |
| The hosted app behaves differently from local | Test the hosted URL in a fresh browser profile before submitting. |

## Before you record

- [ ] Chrome with the on-device model ready, and a clean profile with no other tabs open.
- [ ] The demo story, and the one detail you will add by hand, ready to paste.
- [ ] The network tools prepared and filtered, and the font size readable on screen.
- [ ] One full rehearsal with a timer, with the whole flow working end to end.
- [ ] The second profile or device with no local model ready for the 1:50 segment.

## Before you submit

- [ ] The repo is public, has a detectable open-source license and its README explains how to run it.
- [ ] The code calls Firebase AI Logic at runtime.
- [ ] The hosted URL works in a fresh browser, and App Check works there too.
- [ ] Fonts, icons and the two images load in a fresh browser, and the screens still look right if one fails to load.
- [ ] The video is public on YouTube, 3 minutes or less, in English or with subtitles, and its link is in the Devpost form.
- [ ] The Devpost text sections match what was actually built, including the platform you selected (Web or Chrome).
- [ ] No real personal data in the repo, the video or the screenshots. No App Check debug token committed.