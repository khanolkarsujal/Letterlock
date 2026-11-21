# UI Context

Source of truth for Letterlock's look and feel. It replaces the earlier dark navy / amber version. It is based on the **Ethereal Bloom Fintech** style board and the working HTML prototype (`letterlock_privacy_first_dispute_letter_prototype.html`). If the prototype and this file disagree, this file wins and the prototype should be updated.

## Theme

Light only. There is no dark mode. The design language is a calm, soft, trustworthy fintech workspace:

- An off-white page (`--bg-base`) with white cards sitting on it.
- A near-black indigo as the main "ink" and button colour.
- One violet accent for brand, "on your device" and replaced values.
- Fully rounded pill shapes for buttons, badges and navigation.
- One dark indigo card is used on purpose to show "where each step runs".
- The finished letter sits on a white "paper" card.

Decoration stays light: soft low-opacity shadows, and blurred lilac glows only on hero areas. Motion is limited to short fades, pulses on live status dots and spinners for in-progress steps. All motion stops when the user prefers reduced motion.

## Colors

Source palette (Ethereal Bloom Fintech board):

| Palette role | Hex       |
| ------------ | --------- |
| Primary      | `#161427` |
| Secondary    | `#7C5CFC` |
| Tertiary     | `#EDE9FE` |
| Neutral      | `#F8F7FC` |

The prototype refines these into the tokens below. Define every token once as a CSS custom property in `src/ui/styles/tokens.css`, and mirror the same values in the Tailwind config (`theme.extend.colors`). Components must use tokens (or the matching Tailwind names) and never hardcoded hex values.

### Core tokens

| Role                         | CSS Variable              | Tailwind name              | Value                |
| ---------------------------- | ------------------------- | -------------------------- | -------------------- |
| Page background              | `--bg-base`               | `surface`                  | `#FAF9FE`            |
| Card surface                 | `--bg-card`               | `surface-container-lowest` | `#FFFFFF`            |
| Soft surface (rows, panels)  | `--bg-soft`               | `surface-container-low`    | `#F4F3F8`            |
| Soft surface, hover          | `--bg-soft-hover`         | `surface-container`        | `#EEEDF2`            |
| Pressed / disabled surface   | `--bg-pressed`            | `surface-container-high`   | `#E8E7EC`            |
| Primary ink (text, buttons)  | `--ink`                   | `primary`                  | `#161427`            |
| Dark card surface            | `--bg-dark`               | `primary-container`        | `#1B192C`            |
| Dark card border             | `--border-dark`           | n/a                        | `#2D2945`            |
| Text on dark                 | `--text-on-dark`          | `on-primary`               | `#FFFFFF`            |
| Muted text on dark           | `--text-muted-on-dark`    | n/a                        | `#C8C3DE`            |
| Body text                    | `--text-primary`          | `on-surface`               | `#161427`            |
| Muted text                   | `--text-muted`            | `on-surface-variant`       | `#5F5C72`            |
| Brand / accent               | `--accent`                | `brand`                    | `#5B46E8`            |
| Accent hover                 | `--accent-hover`          | `brand-hover`              | `#4F3BD4`            |
| Accent tint (badge fills)    | `--accent-tint`           | `brand-light`              | `#EDE8FC`            |
| Accent tint, very light      | `--accent-tint-soft`      | `brand-surface`            | `#F0ECFC`            |
| Text on accent tint          | `--text-on-accent-tint`   | `on-secondary-container`   | `#35159B`            |
| Border (dividers, cards)     | `--border-default`        | `outline-variant`          | `#E2DFEC`            |
| Border (inputs and controls) | `--border-strong`         | `outline`                  | `#78767D`            |
| Focus ring                   | `--focus-ring`            | n/a                        | `#5B46E8`            |
| Error                        | `--state-error`           | `error`                    | `#DC2626`            |
| Error background             | `--state-error-bg`        | `error-container`          | `#FEE2E2`            |
| Success (done, protected)    | `--state-success`         | n/a                        | `#5B46E8`            |

### Local / cloud tokens

| Role                              | CSS Variable        | Value                                 |
| --------------------------------- | ------------------- | ------------------------------------- |
| Step ran on your device           | `--state-local`     | `#5B46E8`                             |
| Step ran in the cloud (on light)  | `--state-cloud`     | `#5F5C72`                             |
| Step ran in the cloud (dark card) | `--state-cloud-on-dark` | `#C8BEFF`                         |
| Local dot on dark card            | `--state-local-on-dark` | `#7857F8`                         |

### Placeholder chips

| Role                             | CSS Variable           | Value     |
| -------------------------------- | ---------------------- | --------- |
| Chip background (outgoing text)  | `--placeholder-bg`     | `#5B46E8` |
| Chip text                        | `--placeholder-text`   | `#FFFFFF` |
| Chip background (in review list) | `--placeholder-soft-bg`| `#EDE8FC` |
| Chip text (in review list)       | `--placeholder-soft-text` | `#5B46E8` |
| Detected value highlight (story) | `--highlight-bg`       | `#EDE8FC` with a 1px border `#5B46E8` at 40% opacity |

### Color rules

- **Dark indigo `#161427`** means the main action (primary buttons, active step, numbered markers). Only one primary button per screen.
- **Violet `#5B46E8`** means "on your device", "protected" or "a replaced value". Never use violet or a lock icon for anything that goes to the cloud. Cloud steps use the muted grey-lilac tokens above and the cloud icon.
- **Red** is only for destructive actions ("Clear & Restart") and connection errors.
- The board's brighter violet `#7C5CFC` is allowed for large fills, icons, progress bars and the circular icon buttons. Do **not** use it for small text or as a text-bearing button fill, because white on `#7C5CFC` is about 4.4:1 and falls short of 4.5:1.
- Never rely on colour alone. Local and cloud badges, placeholders and error states always carry a text label.
- Text must meet 4.5:1 contrast and control borders 3:1. Check each new pairing before using it.
- `--border-default` (`#E2DFEC`) is for decorative dividers and card edges only. Inputs, selects, outlined buttons and radio circles use `--border-strong`. The prototype currently uses pale borders such as `#ECE8F6` on inputs, and these must be changed.
- Use `--text-muted` (`#5F5C72`) for small text. The prototype's `#78767D` and `#9B99A5` are too light for text under 18px.

## Typography

Taken from the style board. The headline, body and label roles all use one family.

| Role                          | Font                       | Variable         |
| ----------------------------- | -------------------------- | ---------------- |
| Headline, body, label, UI     | Plus Jakarta Sans          | `--font-sans`    |
| Optional serif accent         | Playfair Display           | `--font-serif`   |
| Placeholder tags, counters    | JetBrains Mono             | `--font-mono`    |

- Plus Jakarta Sans weights used: 400, 500, 600, 700, 800 (the wordmark uses 800).
- Playfair Display is loaded in the prototype (600, italic 500 and 600) but no screen uses it yet. Keep it only if a letterhead or hero accent needs it. Otherwise drop it.
- JetBrains Mono (400, 500, 600) is used for placeholder tags such as `{Person A}` and `{Address 1}`, plus word and character counts and small uppercase eyebrow labels.
- Give each font a real fallback stack: `'Plus Jakarta Sans', system-ui, sans-serif`; `'Playfair Display', Georgia, serif`; `'JetBrains Mono', ui-monospace, monospace`.
- **Fonts load from Google Fonts**, exactly as in the prototype. They are static assets and never receive story content. See `architecture.md` for the allowed hosts and fallback rules.
- Type scale used in the prototype:

| Use                          | Size                       | Weight        |
| ---------------------------- | -------------------------- | ------------- |
| Page headline (h1)           | 30 / 36 / 40px, tight tracking | 700       |
| Section heading (h2)         | 24 to 30px (cards 17 to 20px)  | 700       |
| Card title                   | 16 to 18px                 | 600 to 700    |
| Body                         | 15 to 16px                 | 400, relaxed line height |
| Small / helper text          | 12 to 14px                 | 400 to 500    |
| Eyebrow and column labels    | 11 to 12px, uppercase, wide tracking | 600 to 700 |

- Body text is at least 16px where it is the main reading text. Text under 14px is for secondary labels only and must use `--text-muted` or darker.
- Text inside the finished letter is 16px or larger with generous line spacing.

## Border Radius

The shapes are soft and pill-heavy, as on the board.

| Context                         | Token            | Value                      |
| ------------------------------- | ---------------- | -------------------------- |
| Small inline items, chips       | `--radius-sm`    | `6px` (`rounded-md`)       |
| Inputs, rows, small cards       | `--radius-md`    | `12px` (`rounded` default) |
| Cards and panels                | `--radius-lg`    | `20px` (`rounded-lg`)      |
| Large cards, hero, letter paper | `--radius-xl`    | `28px` to `32px` (`rounded-xl` / `rounded-2xl`) |
| Modals                          | `--radius-2xl`   | `32px`, or `40px` on the largest (`rounded-3xl`) |
| Buttons, badges, nav, search    | `--radius-pill`  | `9999px` (`rounded-full`)  |

Tailwind config values: `DEFAULT 0.75rem`, `lg 1.25rem`, `xl 1.75rem`, `2xl 2rem`, `3xl 2.5rem`, `full 9999px`. Avoid one-off arbitrary radii such as `rounded-[2rem]`. Use the scale.

## Component Library

None. No component library such as shadcn/ui or MUI.

- **Styling:** Tailwind CSS with `darkMode: "class"` kept off and the tokens above in `theme.extend`. The prototype used the Tailwind CDN script; the real app installs the same Tailwind 3 (with the forms and container-queries plugins) from npm through the Vite build.
- **Framework:** React 18 with React Router 6 using `MemoryRouter`, so no route or story text is ever written to the URL or history. The prototype loaded React 18 and React Router 6.3 from unpkg; the real app installs the same versions from npm through Vite.
- **Components:** small hand-built React components in `src/ui/`. Use semantic HTML first: real `<button>`, `<a>`, `<label>`, `<input>`, `<select>`, `<table>` and a native `<dialog>` for modals.
- **State:** one app context holds the story, dispute type, detected entities, toast message and the "Start over" modal flag. It lives in memory only. Nothing is written to storage.

## Component Styles

Based on the style board's component set.

- **Buttons (all pill-shaped):**
  - *Primary:* `--ink` fill, white text, soft shadow. Hover lightens slightly (`#272346`) or turns violet for the final "Copy Full Letter" action. Press scales to 0.98.
  - *Secondary:* `--bg-soft` fill, `--ink` text, 1px `--border-strong`.
  - *Inverted:* dark grey-indigo fill with white text, for use on light cards when a second dark action is needed.
  - *Outlined:* transparent, 1px `--border-strong`, `--ink` text.
  - *Danger:* `--state-error` fill and white text, only in the "Start over" dialog.
  - Disabled: `--bg-pressed` fill, muted text, no shadow, `cursor-not-allowed`.
- **Search / text field:** pill-shaped, soft grey fill, search icon at the left. In the app, text inputs use `--radius-md`, a `--bg-base` fill and a `--border-strong` border. Focus shows a 2px violet ring.
- **Radio cards (dispute type):** a card with a circle at the left. Selected: `--accent-tint-soft` fill, 2px violet border, a filled violet circle with a check. Unselected: `--bg-base` fill, 1px strong border. Use real `<input type="radio">` inside the label.
- **Pills and badges:** `--accent-tint` fill, violet text, 12px, semibold, with a small violet dot. Used for "LOCAL", "On your device", "Protected locally" and "Live Shield".
- **Placeholder chip:** monospace, 12px, `--radius-sm`, violet fill and white text in the outgoing text. Soft violet fill and violet text in lists.
- **Progress bar:** 10px track in `--bg-pressed`, violet fill, fully rounded.
- **Step indicator (header nav):** a pill-shaped tray (`--bg-soft`, 1px divider border) with three pill items. The active item is `--ink` with white text and a small violet dot.
- **Circular icon buttons:** 36 to 44px circles. Black for the main icon action, violet for a highlighted one, red for delete. Each has an `aria-label`.
- **Cards:** white fill, 1px `--border-default`, `--radius-lg` or larger, a very soft shadow (about `0 4px 20px rgba(22,20,39,0.03)`). Hover may deepen the shadow slightly.
- **Dark card ("Where each step runs"):** `--bg-dark` fill, `--border-dark`, white text. Rows are `white/5` fills with a `white/10` border.
- **Toast:** fixed bottom right, violet pill with a check icon, white text, visible for about 3 seconds.
- **Modals:** a native `<dialog>`, dimmed backdrop (`#161427` at 40%) with a light blur, white panel with `--radius-2xl`. There are two modals: "Start over and clear everything?" (destructive, red confirm) and "Add a missed detail".

## Layout Patterns

The flow is still Paste, Review, Letter, but the prototype adds a scan screen and a generating screen between them.

### Routes and screens

| Route               | Screen             | Purpose                                                                 |
| ------------------- | ------------------ | ----------------------------------------------------------------------- |
| `/`                 | Intake             | Hero, "What is Letterlock?" cards, dispute type, story box, primary button |
| `/scan`             | Privacy scan       | "Locking your secrets" banner, live swap list, scan progress, step list |
| `/review`           | Pre-flight review  | Original story vs sanitized text vs where-each-step-runs, entity table, add-detail modal |
| `/generating`       | Drafting           | Live letter preview with placeholders, progress, restore step           |
| `/connection-error` | Connection paused  | Cloud timeout; details stay in memory; retry or cancel                  |
| `/letter`           | Finished letter    | Summary tiles, "What to do next", the letter, copy/download actions     |

### Shared shell

- **Header:** fixed at the top, 80px high, blurred off-white background (`#FAF9FE` at 90%), 1px bottom divider. Content is centered, max width 1140px. Left: a dark circular lock mark, the "Letterlock" wordmark (extrabold) and a violet "LOCAL" pill. Centre (hidden on phones): the step indicator. Right: a white pill with a pulsing dot and "Privacy shield Active".
- **Footer:** a quiet row with the wordmark, "100% On-Device Privacy" and a lock icon with "Your data never leaves your device".
- **Page width:** content is centered, about 920px on the intake screen, 1120 to 1240px on the scan, review and letter screens. Top padding clears the fixed header.
- **Responsive:** every screen works at phone width. Grids collapse to one column, the step indicator hides on narrow screens, and action rows stack.

### Screen details

- **Intake:** a soft lilac hero with a headline split in two colours ("Write the letter." in ink, "Keep the details." in violet) and an illustration. Then three explainer cards (one light, two dark). Then the workspace card: three dispute radio cards (Deposit, Insurance, Medical bill), a large story text area with a word/char counter and a "Stays on your device" tag, a footer strip listing detected types, and a primary pill button ("Find private details").
- **Scan:** a banner with the headline "Locking your secrets. Right on this device.", then a two-column layout. Left: rows pairing the real value with its placeholder. Right: a progress card with a three-step vertical stepper (done, in progress, up next) and a privacy note.
- **Review:** three side-by-side cards on wide screens, stacked on narrow ones: *Your original story* (values highlighted, "On your device"), *Sent to cloud* (placeholders only, "Sanitized payload"), and the dark *Where each step runs* card (Find private details: on your device; Write the letter: in the cloud; Put details back: on your device). Below is the entity table (original, type, placeholder, status, remove button) with an inline add row and an "Add a missed detail" modal.
- **Review approval bar:** the primary button, the back button and a plain sentence that only the sanitized text is sent. The button stays disabled until the review is ready.
- **Generating:** a live draft card with placeholders, a checklist of steps, a guardian illustration and the locked-details card. Cancel and "simulate connection error" actions sit at the bottom.
- **Connection error:** a red-tinted icon tile, a "Connection Paused" badge, three reassurance tiles (anonymized tags only, 100% protected, timed out after 15s), then retry and cancel buttons. A second card shows the details still held in memory.
- **Letter:** a hero with four summary tiles (amount, recipient, deadline, privacy status). Left column (about 4/12): "What to do next" numbered list, a privacy note and an "Active Session" card with a start-over button. Right column: the letter on a white `--radius-xl` card with a "Formal Legal Notice" eyebrow, a reference and date, a To / Property box, the body, the signature, and the actions (Copy Full Letter as the primary action, Download .txt, Start over).

### Local / cloud badge

Each step (detect, draft, restore) shows a text label ("On your device" or "In the cloud"), an icon and its token colour. It appears on the review screen and the letter screen, and as the compact "LOCAL" pill in the header during the flow.

## Icons

- The prototype uses **Material Symbols Outlined** (`lock`, `shield`, `verified_user`, `cloud_sync`, `visibility_off`, `check`, `check_circle`, `close`, `add`, `arrow_forward`, `arrow_back`, `delete`, `wifi_off`, `description`, and others). It loads them from Google Fonts.
- Icons stay as Material Symbols Outlined loaded from Google Fonts, exactly as in the prototype.
- Sizes: 16px inline, 18 to 20px in buttons, 24px or larger in tiles.
- Decorative icons get `aria-hidden="true"`. An icon that carries meaning gets `role="img"` and a label. An icon-only button gets an `aria-label`.
- Core set: lock, device, cloud, check, alert, plus, close, shield, arrow, delete.

## Imagery

- Two illustrations are used in the prototype: a frosted-glass envelope and shield in lilac flora (intake hero), and a friendly purple guardian cloud mascot (scan and generating screens). They stay hosted at the same URLs as in the prototype. Each needs meaningful `alt` text and a plain lilac fallback block in case it fails to load.
- Keep imagery in the same lilac / indigo range as the palette.

## Accessibility and motion

- Every control has a visible focus state (2px violet ring).
- Radio cards, the dispute choice and the entity table must be fully keyboard operable.
- Toasts and progress changes use `aria-live="polite"`.
- Animations used: pulse on status dots, ping on live indicators, spin on progress icons and a gentle scale pulse on the guardian image. Respect `prefers-reduced-motion` by turning all of these off.

## Known gaps between the prototype and this file

Fix these when moving from prototype to the real app:

1. Fonts, icons and the two images stay on third-party hosts by decision (see `architecture.md`). React, React Router and Tailwind move from CDN scripts to npm packages bundled by Vite.
2. The prototype's brand violet is `#5B46E8`, while the style board lists `#7C5CFC`. This file uses `#5B46E8` for text and controls and allows `#7C5CFC` only for large fills and icons. Confirm this is what you want.
3. Input borders (`#ECE8F6`) and muted text (`#78767D`, `#9B99A5`) fail the contrast rules above.
4. Several different reds appear (`#DC2626`, `#EF4444`, `#BA1A1A`). Use `--state-error` only.
5. The sample data is inconsistent: the currency switches between `$` and `£`, the scan screen says "5 details" while the review lists 7, and the error screen shows different sample people ("Elena Vance", "Apex Mgmt LLC", `$2,450.00`) than the rest of the flow (Priya Sharma, Mr Rao, `£1,200`). Pick one dataset.
6. Radii use many arbitrary values. Move to the scale above.
7. Playfair Display is loaded but unused.