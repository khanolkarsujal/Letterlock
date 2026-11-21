# Letterlock

## Overview

Letterlock is a Chrome web app that helps people write a firm, well-structured letter about a sensitive personal dispute, such as a withheld rental deposit, a denied insurance claim or a medical bill appeal, without sending their private details to a cloud AI. It is for people who are not confident writers and who are wary of pasting names, addresses, lease or account numbers and bank details into a chatbot. The user pastes their story as it happened. On their own device, the app replaces private details with placeholders and shows exactly what will leave the device. Only the approved, placeholder version goes to a cloud model, which writes the letter. The real details are then restored on the device. The app is built on the Firebase AI Logic hybrid inference SDK, using Gemini Nano 4 in Chrome for the on-device steps and a cloud model for the drafting step.

## Goals

1. **Keep private details off the cloud.** For every test story, the request sent to the cloud contains none of the seeded names, addresses or numbers, and the app blocks the request if it finds one.
2. **Catch most private details automatically and make the rest easy to fix.** On a set of 10 sample dispute stories with known sensitive values, at least 90% of those values are detected automatically, and the user can add any that were missed on the review screen.
3. **Get from a messy story to a usable letter in one flow.** With the on-device model available, a user can go from a pasted story to a finished letter in under 3 minutes.
4. **Make the privacy boundary visible.** Each step shows whether it ran on the device or in the cloud, and what it shows matches what actually ran.

## Core User Flow

1. The user opens Letterlock in Chrome. The app checks whether the on-device model is available and shows the result.
2. The user pastes their story, with real names and numbers included, and chooses the type of dispute.
3. On the device, the app finds the private details and replaces each one with a placeholder, for example "Person A" or "Address 1".
4. The user sees a review screen with the exact text that will be sent, with sensitive parts blanked out. They can add a missed detail or remove a wrong one, then approve.
5. The app checks that none of the original values remain in the outgoing text. The cleaned text is then sent to the cloud model through Firebase AI Logic, and the model writes the letter using the placeholders.
6. The app checks that the returned letter still contains every placeholder.
7. On the device, the app swaps the real details back into the letter.
8. The user sees the finished draft with a badge showing which steps ran on the device and which ran in the cloud, and can copy the letter.

## Features

### Private detail detection (on device)

- Gemini Nano 4 in Chrome reads the pasted story and finds names, addresses, lease and account numbers, and similar details.
- A rules-based check runs alongside it to catch structured identifiers such as phone numbers, emails and account numbers.
- This step is set to run only on the device and never falls back to the cloud. If the device has no local model, only the rules-based check runs and the app clearly says detection is limited.
- Each detected value is mapped to a placeholder. The mapping is held only in memory on the device.

### Review and control

- A review screen shows the exact text that will be sent to the cloud.
- The user can add redactions the app missed and remove ones that are wrong.
- Nothing is sent until the user approves.

### Letter drafting (cloud)

- Only the approved, placeholder text is sent, through Firebase AI Logic, to a cloud model.
- The prompt asks for a firm, professional, well-structured dispute letter that keeps every placeholder exactly as written.
- The app checks the outgoing text before sending and the returned letter before accepting it.

### Restore and proof

- Real details are restored into the letter on the device.
- A badge shows which steps ran on the device and which ran in the cloud.

### Platform and compliance

- Built on the Firebase AI Logic hybrid inference SDK as a Chrome web app.
- Uses Firebase App Check, with debug tokens during development.
- Open-source repository with a license file, in line with the #BuildHybridAI 2026 rules.

## Scope

### In Scope

- A Chrome web app covering the full flow: paste, detect, review, approve, draft, restore, copy.
- On-device detection and restoration, and cloud-only drafting.
- Letter drafting for deposit disputes, insurance claims and medical bill appeals.
- The review screen with editable redactions.
- The local/cloud badge.
- The checks before sending and after the letter returns.

### Out of Scope

- User accounts, and any server-side storage of stories, placeholder mappings or letters.
- Uploading documents, screenshots or other evidence.
- Legal advice, or jurisdiction-specific legal citations and deadlines. Letterlock drafts a letter and is not a substitute for legal advice.
- Sending the letter on the user's behalf.
- Android and iOS apps.
- Evidence checklists, follow-up letters and reminders, and escalation guidance.
- A guarantee that every sensitive detail is found. The review screen is the safeguard, and the user stays in control of what is sent.

## Success Criteria

1. With the on-device model available, pasting a sample story produces a review screen with its sensitive values replaced by placeholders, before any request is made to the cloud.
2. Inspecting the outgoing cloud request in the browser's network tools shows none of the original sensitive values from the test stories.
3. On the review screen, adding a missed redaction and removing a wrong one both change the text that is sent.
4. The returned letter contains every placeholder, and after restoration every original value appears in the right place.
5. On a device with no local model, or with the model switched off, the detection step makes no cloud request, runs only the rules-based check, and shows a limited-detection notice.
6. The badge matches what actually ran for each step.
7. A repository containing the app is public, has a detectable open-source license, and calls Firebase AI Logic at runtime.
8. A demo video of 3 minutes or less, showing the app working in Chrome, is public on YouTube, and the project is submitted before the deadline of Dec 1, 2026 at 3:30am GMT+5:30.