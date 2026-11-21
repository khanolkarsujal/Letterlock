# Wireframes

Low-fidelity layouts for every Letterlock screen, updated to match the current HTML design prototype (`letterlock_privacy_first_dispute_letter_prototype.html`). They show structure, content and states, not final visuals. Colors, type, radii and component styles are defined in `ui-context.md`, the flow follows `project-overview.md`, and the behavior rules follow `architecture.md`. All names, addresses and numbers in these wireframes are invented sample data.

## Legend

| Mark | Meaning |
| ---- | ------- |
| `[ Button ]` | A button (pill-shaped in the design) |
| `(o)` and `( )` | A selected and an unselected radio card |
| `[[text]]` | A detected value, highlighted in the user's story |
| `{Person A}` | A placeholder chip |
| `>>text<<` | A value that was not replaced (error highlight) |
| `<lock>` `<device>` `<cloud>` `<check>` `<alert>` `<shield>` | Icons (Material Symbols) |
| `[1 Paste]` | The current step in the header step indicator |
| `v` | A dropdown |
| `(img)` | An illustration |

## Screen inventory

| ID | Screen | Route | Step shown | When it is shown |
| -- | ------ | ----- | ---------- | ---------------- |
| S1 | Intake (paste your story) | `/` | 1 Paste | First screen, and after Start over |
| S2 | Privacy scan | `/scan` | 1 Paste | While on-device detection runs |
| S3 | Pre-flight review | `/review` | 2 Review | After detection |
| S4 | Add a missed detail | dialog on S3 | 2 Review | Opened from S3 |
| S5 | Generating (drafting) | `/generating` | 3 Letter | While the cloud model drafts the letter |
| S6 | Letter ready | `/letter` | 3 Letter | After the letter returns and details are restored |
| S7 | Connection paused (error) | `/connection-error` | 3 Letter | When drafting fails or the returned letter is incomplete |
| S8 | Start over | dialog on S6 | 3 Letter | Opened from S6 |
| S9 | Phone layouts | n/a | n/a | S1, S3 and S6 at phone width |

The router is a `MemoryRouter`, so these routes never appear in the address bar.

## Flow

```text
S1 Intake --> S2 Scan --> S3 Review --> S5 Generating --> S6 Letter
                            |   ^            |                |
                            v   |            v                v
                      S4 Add a missed   S7 Connection    S8 Start over
                          detail         paused          (clears memory,
                                       (retry or          returns to S1)
                                        go back)
```

## Shared shell (every screen)

```text
+------------------------------------------------------------------------------------------+
| (lock) Letterlock [LOCAL]       [1 Paste] > 2 Review > 3 Letter       (o) Privacy shield Active |
+------------------------------------------------------------------------------------------+
|                                                                                          |
|                                    ...screen content...                                  |
|                                                                                          |
+------------------------------------------------------------------------------------------+
| (o) Letterlock . Detection on your device                 <lock> Your story stays on this device until you approve what is sent |
+------------------------------------------------------------------------------------------+
```

- **Header:** fixed at the top, 80px high. Left: a dark circular lock mark, the "Letterlock" wordmark and a violet "LOCAL" pill. Centre: the step indicator (hidden on phones). Right: a "Privacy shield Active" pill with a pulsing dot.
- **Footer:** a quiet row at the bottom with the wordmark, "Detection on your device" and the line about the story staying on the device.
- **Toast:** a violet pill at the bottom right that appears for about 3 seconds after actions such as Copy and Download.
- The step indicator shows progress only. Back buttons are used to move back.

## S1 Intake

The starting screen. A hero, three explainer cards, one workspace card and three feature cards.

```text
+------------------------------------------------------------------------------------------+
|                                    (shared header)                                       |
+------------------------------------------------------------------------------------------+
|  +--------------------------------------------------------------------------------+      |
|  | Write the letter.                                              +--------------+ |      |
|  | Keep the details.                                              |    (img)     | |      |
|  | Turn a messy dispute story into a firm, professional letter    | envelope +   | |      |
|  | without sending your real name, address or numbers to the cloud.| shield      | |      |
|  +--------------------------------------------------------------------------------+      |
|                                                                                          |
|  What is Letterlock?        A privacy-first letter writer that keeps your details local. |
|  +------------------+  +----------------------+  +----------------------+                |
|  | 1. Paste your    |  | 2. Private details   |  | 3. Get a firm letter |                |
|  |    story         |  |    stay here         |  |    (dark card)       |                |
|  | (light card)     |  | (dark card)          |  |                      |                |
|  +------------------+  +----------------------+  +----------------------+                |
|                                                                                          |
|  +--------------------------------------------------------------------------------+      |
|  | What is it about?                                                              |      |
|  | (o) Deposit dispute     ( ) Insurance claim      ( ) Medical bill appeal       |      |
|  |     Tenancy & Security     Denied Coverage &        Overcharges & Coding Error |      |
|  |     Bond                   Delays                                              |      |
|  |                                                                                |      |
|  | Your story [STAYS ON YOUR DEVICE]            Reset Demo   48 words . 215 chars |      |
|  | +----------------------------------------------------------------------------+ |      |
|  | | I moved out of 14 Oak Street on 3 June. My landlord, Mr Rao, has kept my   | |      |
|  | | deposit of 1,200 and has stopped replying. My name is Priya Sharma, lease  | |      |
|  | | ref LS-20418. You can call me on 98765 43210.                              | |      |
|  | +----------------------------------------------------------------------------+ |      |
|  | <shield> Detected details: 7 items protected locally   (Address) (Landlord name)|     |
|  |                                                (Your name) (Phone & Ref #)     |      |
|  | ------------------------------------------------------------------------------ |      |
|  | <lock> Private: your story stays on this device     [ Find private details > ]|   |
|  +--------------------------------------------------------------------------------+      |
|                                                                                          |
|  +----------------+  +--------------------+  +----------------------+                    |
|  | SAFE PLACEHOLDERS |  | BACKED BY LAW     |  | RUNS IN YOUR BROWSER        |                    |
|  | Private details   |  | Firm & professional|  | Nothing saved or     |                    |
|  | swapped           |  |                    |  | tracked              |                    |
|  +----------------+  +--------------------+  +----------------------+                    |
+------------------------------------------------------------------------------------------+
```

**Contents**

- A hero with a two-colour headline, a short promise line and an illustration.
- Three "What is Letterlock?" cards: Paste your story (light), Private details stay here (dark), Get a firm letter (dark).
- The workspace card: three dispute radio cards (Deposit dispute selected by default), the story text area with a word and character count, a "Reset Demo" link, a strip of detected-type tags, a privacy line and one primary button.
- Three feature cards under the workspace: Safe Placeholders, Backed by Law, Runs in your browser.

**Behavior**

- The button is disabled while the text area is empty. Helper text while empty: "Paste your story to continue."
- Pressing the button shows a short "Parsing Sensitive Entities..." state with a spinner and then goes to S2.
- The story is held in memory only. Reloading the page clears it.
- "Reset Demo" restores the sample story. It is a prototype helper and is removed from the real app.

## S2 Privacy scan

A waiting screen that shows the swap happening, so the user sees the local work before anything is sent.

```text
+------------------------------------------------------------------------------------------+
|                          (shared header, step 1 active)                                  |
+------------------------------------------------------------------------------------------+
|  +--------------------------------------------------------------------------------+      |
|  | (o) STEP 2: GUARDIAN IN ACTION                                  +--------------+ |      |
|  | Locking your secrets.                                           |    (img)     | |      |
|  | Right on this device.                                           | guardian     | |      |
|  | Right now on your computer, your (real name), (address)... are  | cloud mascot | |      |
|  | swapped for safe placeholders.                                  +--------------+ |      |
|  | [<lock> On-device] [Zero cloud tracking] [Full legal dispute tone] Locked & Protected |  |
|  +--------------------------------------------------------------------------------+      |
|                                                                                          |
|  +--- LIVE TRANSFORMATION ---------------------+  +--- Scan Progress ----------- 92% -+   |
|  | Your Story Details Being Swapped  (Live Shield)|  | [=========================>  ]  |   |
|  | (person) Priya Sharma   -> {Person A}        |  |  (check) Analyzing dispute story |   |
|  | (home)   14 Oak Street  -> {Address 1}       |  |          Done                    |   |
|  | (person) Mr Rao         -> {Person B}        |  |  (sync)  Replacing 7 private     |   |
|  | (money)  1,200          -> {Amount 1}        |  |          details  In progress    |   |
|  | (phone)  98765 43210    -> {Phone 1}         |  |  (eye)   Preparing clean preview |   |
|  | (check) 7 personal details safely hidden     |  |          Up next                 |   |
|  +----------------------------------------------+  +----------------------------------+   |
|                                                    | <shield> Your privacy is guaranteed |  |
|                                                    +----------------------------------+   |
|                                                                                          |
|  [ < Back to story ]                              [ Cancel scan ]  [ Proceed to Review > ]|
+------------------------------------------------------------------------------------------+
```

**Behavior**

- No network request is made on this screen.
- The progress value rises while detection runs. When it finishes, the user continues with "Proceed to Review".
- "Back to story" and "Cancel scan" return to S1 with the story kept in memory.
- If the on-device model fails while running, the app continues with the rules-based checks only and shows the limited-detection notice on S3 (see "States not yet in the prototype").

## S3 Pre-flight review

The most important screen. It is where the user sees and controls exactly what leaves the device.

```text
+------------------------------------------------------------------------------------------+
|                          (shared header, step 2 active)                                  |
+------------------------------------------------------------------------------------------+
|  (o) STEP 3: PRE-FLIGHT PRIVACY CHECK                                                    |
|  Review what will leave your device                                                      |
|  Left is your original story. Right is the exact anonymized text that will be sent.      |
|                                                                                          |
|  +- Your original story ---+  +- Sent to cloud -------+  +- WHERE EACH STEP RUNS ----+   |
|  | (On your device)        |  | (Sanitized payload)   |  | (dark card)               |   |
|  | I moved out of          |  | I moved out of        |  | Find private details      |   |
|  | [[14 Oak Street]] on    |  | {Address 1} on        |  |        (On your device)   |   |
|  | [[3 June]]. My landlord,|  | {Date 1}. My landlord,|  | Write the letter          |   |
|  | [[Mr Rao]], has kept my |  | {Person B}, has kept  |  |        (In the cloud)     |   |
|  | deposit of [[1,200]]... |  | my deposit of         |  | Put details back          |   |
|  |                         |  | {Amount 1}...         |  |        (On your device)   |   |
|  | <check> Stays local     |  | <shield> Placeholders |  | <info> note               |   |
|  +-------------------------+  +-----------------------+  +---------------------------+   |
|                                                                                          |
|  +--------------------------------------------------------------------------------+      |
|  | Detected private details (7)                         [ + Add a missed detail ] |      |
|  | Check what was flagged or add any sensitive detail we missed.                  |      |
|  | [ text to protect.............. ] [ Category v ] [ Add Protection ]            |      |
|  |                                                                                |      |
|  | ORIGINAL VALUE   CATEGORY            PLACEHOLDER   DEVICE STATUS      ACTION   |      |
|  | Priya Sharma     Tenant / Full Name  {Person A}    (Protected locally)  [ x ]  |      |
|  | 14 Oak Street    Rental Prop. Address{Address 1}   (Protected locally)  [ x ]  |      |
|  | Mr Rao           Landlord Name       {Person B}    (Protected locally)  [ x ]  |      |
|  | 3 June           Dispute Date        {Date 1}      (Protected locally)  [ x ]  |      |
|  | 1,200            Withheld Bond Amount{Amount 1}    (Protected locally)  [ x ]  |      |
|  | LS-20418         Lease Ref #         {Lease 1}     (Protected locally)  [ x ]  |      |
|  | 98765 43210      Private Contact     {Phone 1}     (Protected locally)  [ x ]  |      |
|  +--------------------------------------------------------------------------------+      |
|                                                                                          |
|  +--------------------------------------------------------------------------------+      |
|  | [ < Back to story ]  (<shield> Only substituted tokens leave your machine)     |      |
|  |                                          [ Approve and write letter > ]        |      |
|  +--------------------------------------------------------------------------------+      |
+------------------------------------------------------------------------------------------+
```

**Contents**

- Three cards in one row on wide screens: *Your original story* (values highlighted, "On your device"), *Sent to cloud* (placeholders only, "Sanitized payload") and the dark *Where each step runs* card with the local/cloud labels.
- A details card with an inline add row (text, category dropdown, "Add Protection") and an "Add a missed detail" button that opens S4. Below is a table with the original value, category, placeholder, device status and a Remove control.
- A bottom action bar with Back, a plain sentence that only substituted tokens leave the device, and the primary approve button.

**Behavior**

- The action bar sits at the bottom of the page content. It is not fixed to the screen in the current prototype. On phones it should stay reachable (see S9).
- Removing a detail puts the original value back as plain text in the middle card.
- The inline add row and S4 both add a detail. The inline row uses the category chosen in the dropdown.
- "Back to story" returns to S1 with the story kept in memory.
- "Approve and write letter" runs the pre-send check. If it passes, go to S5. If it fails, show the blocked state described under "States not yet in the prototype".

## S4 Add a missed detail

A dialog over S3, opened from the "Add a missed detail" button.

```text
+------------------------------------------------------------------------------------------+
|   (S3 dimmed and blurred behind the dialog)                                              |
|                                                                                          |
|          +- (o) MANUAL REDACTION ----------------------------------------- [ x ] -+      |
|          | Add a missed detail                                                    |      |
|          | Type or paste any sensitive text that was missed. We will replace      |      |
|          | every match in your story with a safe placeholder.                     |      |
|          |                                                                        |      |
|          | Text to protect   [ the shop on Oak Lane                      ]        |      |
|          | Detail type       [ Address                                  v ]        |      |
|          |                                                                        |      |
|          | Outgoing placeholder preview:   replaces with  {Address 2}             |      |
|          | <shield> Stays on your device                                          |      |
|          |                                                                        |      |
|          |                                        [ Cancel ]  [ <check> Add detail ] |   |
|          +------------------------------------------------------------------------+      |
+------------------------------------------------------------------------------------------+
```

**Behavior**

- It is a native dialog: focus moves into it and Escape closes it.
- The type list is: Person, Address, Date, Amount, Phone, Account / Reference. Add Email and Other if the rules-based checks produce them.
- The preview shows the next placeholder for the chosen type before the user confirms.
- Add detail replaces every match in the story, assigns the next placeholder for that type and returns to S3 with the table updated. Cancel returns to S3 unchanged.

## S5 Generating (drafting)

Shown while the cloud model drafts the letter from the approved placeholder text.

```text
+------------------------------------------------------------------------------------------+
|                          (shared header, step 3 active)                                  |
+------------------------------------------------------------------------------------------+
|                  (o) WRITING IN THE CLOUD                                                |
|          Drafting your letter. Without exposing your private details.                    |
|          [<lock> ...] [No accounts] [Runs in your browser]                               |
|                                                                                          |
|  +--- Live Letter Drafting ------------------- 72% ---+  +---------------------------+   |
|  | [==================>                    ]          |  |        (img)              |   |
|  | +-- DRAFT PREVIEW ----------------- (live) ------+ |  | Letterlock Privacy        |   |
|  | | TO: {Person B}                                | |  | Guardian                  |   |
|  | | REGARDING: Residential Tenancy at {Address 1} | |  +---------------------------+   |
|  | | ...deposit of {Amount 1} ... {Date 1} ...     | |  | Locked details (7)        |   |
|  | +-----------------------------------------------+ |  | Tenant name   <lock>      |   |
|  | <check> Private details replaced with safe tags   |  | Rental property <lock>    |   |
|  |         Completed on your device       (Protected)|  | Landlord      <lock>      |   |
|  | (sync)  Writing firm, persuasive draft            |  | Withheld amount <lock>    |   |
|  |         Running in the cloud using placeholders   |  | Why this matters: ...     |   |
|  |         (In Progress)                             |  +---------------------------+   |
|  | ( )     Restoring your real name and numbers      |                                  |
|  |         Up next on your device        (Next step) |                                  |
|  +---------------------------------------------------+                                  |
|                                                                                          |
|  [ x Cancel ]                                       (<wifi_off> simulate error)  (o) ... |
+------------------------------------------------------------------------------------------+
```

**Behavior**

- Only the placeholder text is shown in the draft preview, because only that exists in the cloud.
- The locked-details card shows the real values for the user's reassurance. They are shown from device memory and are never part of the request.
- Cancel stops waiting and returns to S3 with everything kept.
- When the letter returns, the app checks that every placeholder is present. If it is, the real details are put back on the device and the app goes to S6. If not, go to S7 variant B.
- If the request fails, go to S7 variant A.
- The "simulate error" control is a prototype helper for showing S7 and is removed from the real app.

## S6 Letter ready

The result. The letter is on a white paper card, with summary tiles and guidance beside it.

```text
+------------------------------------------------------------------------------------------+
|                          (shared header, step 3 active)                                  |
+------------------------------------------------------------------------------------------+
|              (task_alt) FORMAL DISPUTE LETTER READY                                      |
|              Your formal dispute letter is ready to send.                                |
|              Your personal details never left this computer.                             |
|  +-------------+ +-------------+ +--------------------+ +----------------------+        |
|  | Disputed    | | Recipient   | | Statutory deadline | | Privacy status       |        |
|  | amount      | | Mr Rao      | | 19 October 2026    | | <check> Protected locally |        |
|  | 1,200.00    | | Landlord    | | 7 Business Days    | | 7 restored on device |        |
|  +-------------+ +-------------+ +--------------------+ +----------------------+        |
|                                                                                          |
|  +- What to do next -------+  +- Formal Legal Notice -------------------------------+    |
|  | 1 Copy or print letter  |  | Deposit Return Notice              12 October 2026 |    |
|  | 2 Send to your landlord |  |                                    Ref: LS-20418   |    |
|  | 3 Escalate if necessary |  | To: Mr Rao            Property: 14 Oak Street      |    |
|  +-------------------------+  |                       Disputed sum: 1,200.00       |    |
|  | <shield> Complete Local |  | Dear Mr Rao,                                       |    |
|  | Privacy                 |  | I am writing to formally demand the return of my   |    |
|  +-------------------------+  | deposit of 1,200.00 ...                            |    |
|  | Active Session          |  | [ ... the letter continues ... ]                   |    |
|  | [ Start over ]          |  | Sincerely,  Priya Sharma                           |    |
|  +-------------------------+  |                                                    |    |
|                               | [ Start Over ] [ Download .txt ] [ Print Letter ]  |    |
|                               |                         [ Copy Full Letter ]       |    |
|                               +----------------------------------------------------+    |
+------------------------------------------------------------------------------------------+
```

**Behavior**

- "Copy Full Letter" is the primary action. It copies the restored letter to the clipboard, shows a toast and announces the change to screen readers.
- "Download .txt" saves the letter as a text file and shows a toast. "Print Letter" opens the browser print dialog.
- "Start Over" (in either place) opens S8.
- The letter text can be selected. Editing the letter in the app is outside this version.
- The deadline and date in the sample are illustrative. The real app only shows a deadline if the letter contains one.

## S7 Connection paused (error)

A full-screen error with reassurance tiles and a memory card. Three variants.

```text
+------------------------------------------------------------------------------------------+
|                          (shared header, step 3 active)                                  |
+------------------------------------------------------------------------------------------+
|  +--------------------------------------------------------------------------------+      |
|  | (wifi_off)  (o) CONNECTION PAUSED                         (<shield> Details safe) |      |
|  |             We couldn't reach the letter formatting service                    |      |
|  |             Your story and personal details are completely safe on this device.|      |
|  |             Nothing was leaked. We only tried to send your placeholder text.   |      |
|  |                                                                                |      |
|  |  +------------------+  +------------------+  +------------------------+        |      |
|  |  | 0 Private Bytes  |  | Protected locally   |  | Timed out after 15s    |        |      |
|  |  | Sent             |  | Safe in device   |  | Cloud server too slow  |        |      |
|  |  | Anonymized tags  |  | memory           |  |                        |        |      |
|  |  +------------------+  +------------------+  +------------------------+        |      |
|  |                                                                                |      |
|  |  [ Try again ]  [ Back to review ]   <lock> Try again resends only the approved|      |
|  |                                      anonymous placeholders.                   |      |
|  +--------------------------------------------------------------------------------+      |
|                                                                                          |
|  +--------------------------------------------------------------------------------+      |
|  | (box) Your story and details are preserved in memory        (7 Redactions Ready)|     |
|  | {Person A} . {Address 1} . {Person B} . {Amount 1} . {Date 1} . {Lease 1}       |     |
|  | <info> note                                                                    |      |
|  +--------------------------------------------------------------------------------+      |
+------------------------------------------------------------------------------------------+
```

| Variant | When | Message | Buttons |
| ------- | ---- | ------- | ------- |
| A | The cloud request fails: no connection, timeout, or the service refuses the request | "We couldn't reach the letter formatting service. Nothing more was sent." | Try again, Back to review |
| B | The letter returns without every placeholder | "The letter came back incomplete, so we didn't use it." | Try again, Back to review |
| C | The pre-send check finds an original value | Shown on S3 as the sending-blocked state, not on this screen | Fix on S3 |

- Try again sends exactly the text the user approved. It never sends different text.
- Back to review returns to S3 with everything kept.
- The memory card shows placeholders only. It must not show the real values on this screen. (The prototype shows sample names here and should be changed.)

## S8 Start over

A confirmation dialog over S6, used because the action clears everything and cannot be undone.

```text
+------------------------------------------------------------------------------------------+
|   (S6 dimmed and blurred behind the dialog)                                              |
|                                                                                          |
|          +- (trash) (o) CLEAR EVERYTHING ------------------------------- [ x ] -+        |
|          | Start over and clear everything?                                     |        |
|          | This will permanently clear your story, all detected private        |        |
|          | details and your generated letter from this computer's memory.       |        |
|          |                                                                      |        |
|          | What happens when you clear:                                         |        |
|          |  <lock>   Your story and letter are erased immediately               |        |
|          |  <shield> Nothing is saved in the cloud, a database or cookies       |        |
|          |  <check>  You return to Step 1 with a clean, blank slate             |        |
|          |                                                                      |        |
|          | Tip: copy or download your letter before clearing.                   |        |
|          |                                        [ Cancel ]  [ Clear & Restart ] |      |
|          +----------------------------------------------------------------------+        |
+------------------------------------------------------------------------------------------+
```

**Behavior**

- Cancel closes the dialog. "Clear & Restart" wipes the story, the placeholder map and the letter from memory, then returns to S1 empty (not with the sample story).
- The confirm button uses the error color and a text label.

## States not yet in the prototype

`architecture.md` requires these states, but the HTML prototype does not draw them yet. Build them in the same style as the screens above.

- **S1 model preparing:** a notice card under the text area with a device icon, "Getting the on-device model ready...", a progress bar if the browser reports progress, and "Your story is not sent anywhere while this runs." The "Find private details" button is disabled until the model is ready. The header status pill reads "Device model: Preparing".
- **S1 model unavailable:** a notice card with an amber border and an alert icon: "This device has no on-device model, so detection is limited. Only phone numbers, emails and account numbers are found automatically. Please check the review screen carefully." The button stays enabled and detection uses the rules-based checks only. Nothing falls back to the cloud.
- **S3 nothing found:** an amber notice above the cards: "We didn't find any private details. Check your story before approving, or add details yourself." Approve stays enabled, because the user decides what is sent.
- **S3 sending blocked:** an error-colored notice with an icon and text: "We stopped before sending. A value from your story is still in the text that would be sent (marked below). Add it as a detail, then try again." The unreplaced value is marked `>>like this<<` in the Sent to cloud card. No request is made.
- **S6 local/cloud badge:** the prototype letter screen has none, but success criterion 6 and F23 require it. Add the "Where each step ran" card (Find private details: On your device, Write the letter: In the cloud, Put your details back: On your device, each with a check) between the summary tiles and the letter, built from what actually ran.
- **Header model status:** the prototype shows "Privacy shield Active" on the right. The real app also needs the on-device model status (Ready, Preparing, Unavailable). Show it as a small pill beside or inside the shield pill.

## S9 Phone layouts

Phone width (about 390px). Panels stack, buttons go full width and the approval bar stays reachable. S2, S5 and S7 stack the same way. The dialogs (S4 and S8) become bottom-aligned sheets. The header step indicator is hidden on phones, so show the current step as a short label under the wordmark.

### S1 Intake

```text
+------------------------------------------+
| (lock) Letterlock [LOCAL]     (o) Shield |
+------------------------------------------+
| Write the letter.                        |
| Keep the details.                        |
| Turn a messy story into a firm letter... |
| (img)                                    |
|                                          |
| What is Letterlock?                      |
| +--------------------------------------+ |
| | 1. Paste your story                  | |
| +--------------------------------------+ |
| | 2. Private details stay here         | |
| +--------------------------------------+ |
| | 3. Get a firm letter                 | |
| +--------------------------------------+ |
|                                          |
| What is it about?                        |
| (o) Deposit dispute                      |
| ( ) Insurance claim                      |
| ( ) Medical bill appeal                  |
|                                          |
| Your story [STAYS ON YOUR DEVICE]        |
| +--------------------------------------+ |
| | I moved out of 14 Oak Street on      | |
| | 3 June. My landlord, Mr Rao...       | |
| +--------------------------------------+ |
| <shield> 7 items protected locally       |
| <lock> Protected locally                      |
|                                          |
|     [ Find private details > ]           |
+------------------------------------------+
```

### S3 Review

```text
+------------------------------------------+
| (lock) Letterlock [LOCAL]     (o) Shield |
+------------------------------------------+
| (o) STEP 3: PRE-FLIGHT PRIVACY CHECK     |
| Review what will leave your device       |
|                                          |
| +- Your original story ---------------+  |
| | I moved out of [[14 Oak Street]]... |  |
| +-------------------------------------+  |
| +- Sent to cloud ---------------------+  |
| | I moved out of {Address 1}...       |  |
| +-------------------------------------+  |
| +- WHERE EACH STEP RUNS --------------+  |
| | Find details    (On your device)    |  |
| | Write letter    (In the cloud)      |  |
| | Put back        (On your device)    |  |
| +-------------------------------------+  |
| +- Detected private details (7) -------+ |
| | Priya Sharma  {Person A}      [ x ]  | |
| | 14 Oak Street {Address 1}     [ x ]  | |
| | Mr Rao        {Person B}      [ x ]  | |
| | + 4 more                             | |
| | [ + Add a missed detail ]            | |
| +--------------------------------------+ |
| <shield> Only substituted tokens leave   |
| your machine.                            |
| [ < Back to story ]                      |
| [ Approve and write letter > ]           |
+------------------------------------------+
```

The detected-details table becomes a list with three rows and a "+ 4 more" control that expands it. The approval bar stays reachable at the bottom of the screen on phones.

### S6 Letter

```text
+------------------------------------------+
| (lock) Letterlock [LOCAL]     (o) Shield |
+------------------------------------------+
| (task_alt) FORMAL DISPUTE LETTER READY   |
| Your formal dispute letter is ready.     |
|                                          |
| +- Disputed amount ------- 1,200.00 ---+ |
| +- Recipient -------------- Mr Rao ----+ |
| +- Deadline ---------- 19 October 2026 + |
| +- Privacy status -------- Protected locally + |
|                                          |
| +- What to do next --------------------+ |
| | 1 Copy or print  2 Send  3 Escalate  | |
| +--------------------------------------+ |
| +- Deposit Return Notice --------------+ |
| | Dear Mr Rao,                         | |
| | I am writing to formally demand...   | |
| | [ ... continues ... ]                | |
| | Sincerely, Priya Sharma              | |
| +--------------------------------------+ |
|                                          |
| [ Copy Full Letter ]                     |
| [ Download .txt ]                        |
| [ Print Letter ]                         |
| [ Start Over ]                           |
+------------------------------------------+
```

## Shared behavior and accessibility

- The header and footer are on every screen. The step indicator shows progress and is not a navigation control.
- Nothing is saved. Reloading the page returns to S1 and clears everything.
- When the screen changes, focus moves to the screen heading. Status changes such as "Finding private details", "Copied" and the toast are announced through a polite live region.
- Dialogs use the native dialog element, trap focus and close with Escape.
- Every control is a real button, link or labeled input. Placeholder chips contain their text (for example "Person A"), so they read correctly to a screen reader.
- The local/cloud labels always show a text label and an icon, never color alone.
- Motion is limited to short fades, pulses on live dots and spinners on in-progress steps, and all of it stops when the user prefers reduced motion.
- Copy to change before building: "Backed by Law" and the statutory deadline and escalation text (out of scope in `project-overview.md`), "100% On-Device Synthesized", "never leaves your computer" and "Works Offline". Claim wording is "stays on your device" and "nothing is sent without your approval".
- Prototype-only helpers to remove in the real app: "Reset Demo" on S1, the "simulate error" control on S5, and the sample deadline and date text on S6.