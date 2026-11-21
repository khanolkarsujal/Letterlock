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
