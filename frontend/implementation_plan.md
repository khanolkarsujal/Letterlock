## Goal Description
Port the single‑file HTML prototype **letterlock_privacy_first_dispute_letter_prototype.html** into a clean Vite + React 18 + TypeScript project while keeping the visual output, copy, and interactive behavior **exactly** as it appears in the original prototype. No back‑end, analytics, storage, or new features will be added. The resulting codebase will be ready for a backend developer to plug in real detection/redaction/inference logic later.

## User Review Required
> [!IMPORTANT] **Do not merge or run any code until you approve this plan.**
> The plan creates a full project scaffold, moves a large amount of HTML/JS into React components, and adds numerous files. Please review the folder layout, state design, and any assumptions listed under *Open Questions*.

## Open Questions
> [!WARNING] **Font loading** – The prototype links three Google Font families (Plus Jakarta Sans, Playfair Display, JetBrains Mono) and a Material Symbols Outlined stylesheet. Do you want these linked in `index.html` exactly as in the prototype, or should we import them via `@import` in CSS? The requirement says *keep the Google Fonts links* – I will preserve the `<link>` tags in `index.html`.

> [!WARNING] **Arbitrary Tailwind values** – The HTML contains several arbitrary class values (e.g., `bg-[#5b46e8]`). Tailwind will need `safelist` or `content` configuration to avoid purge. I will copy the exact `theme.extend` block from the HTML into `tailwind.config.ts` and ensure `safelist` includes `bg-[#5b46e8]` etc.

> [!QUESTION] **Naming of the AppContext state** – The prototype keeps state in global JS variables (`story`, `disputeType`, `entities`, etc.). I will expose the same shape via a React context (`AppContext`). If any naming differs from the prototype you prefer, let me know.

> [!QUESTION] **Exact JSX conversion of inline `style` attributes** – Some elements use `style="width: 200px"` (or similar). I will convert them to `style={{ width: "200px" }}`. If any values should stay as strings, confirm.

## Proposed Changes
---
### Project Scaffold (new files)
#### [NEW] package.json
```json
{
  "name": "letterlock-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.3.0",
    "@tailwindcss/forms": "^0.5.0",
    "@tailwindcss/container-queries": "^0.1.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

#### [NEW] vite.config.ts
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { open: true },
});
```

#### [NEW] tailwind.config.ts
```ts
import type { Config } from "tailwindcss";

export default <Config>{
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}", "./src/**/*.css"],
  theme: {
    extend: {
      // <-- copy the entire `theme.extend` block from the prototype HTML here -->
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/container-queries")],
  safelist: [
    "bg-[#5b46e8]",
    // add any other arbitrary values that appear in class names
  ],
};
```

#### [NEW] index.html
* Keep the original `<head>` font `<link>` tags and Material Symbols link.
* Remove all CDN `<script>` tags for React, ReactDOM, Babel, etc.
* Add a `<div id="root"></div>` for Vite to mount the app.

#### [NEW] src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* custom CSS from the original <style> block */
/* hidden scrollbar */
::-webkit-scrollbar { display: none; }
/* subtlePulse keyframes */
@keyframes subtlePulse { ... }
.animate-gentle-pulse { animation: subtlePulse 2s infinite; }
/* overscroll-behavior */
body { overscroll-behavior-y: contain; }
```

#### [NEW] src/main.tsx
```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### [NEW] src/App.tsx
* Wrap the router in a `MemoryRouter` with the six routes defined.
* Provide `AppProvider` (from `src/ui/state/AppContext.tsx`).
* Render `GlobalDialogs` once.

#### [NEW] src/ui/state/AppContext.tsx
* Create `AppContext` with the same state shape used by the prototype.
* Export `useApp` hook.
* Include actions: `resetAll`, `removeEntity`, `addEntity`, handling toast and wipe‑modal flags.

#### [NEW] src/ui/state/mockData.ts
* Export `defaultStory` and `defaultEntities` extracted verbatim from the prototype.

#### [NEW] src/ui/components/Header.tsx, Footer.tsx, Icon.tsx, GlobalDialogs.tsx
* Directly translate the corresponding HTML sections into functional components.
* `Icon` simply wraps `<span className="material-symbols-outlined">{name}</span>`.

#### [NEW] src/ui/screens/*
* Create six screen components matching the routes and UI of the prototype.
* Use Tailwind classes exactly as they appear in the HTML.
* Convert any inline JS event handling to React state updates via the context.
* Preserve timers, toasts, modals, copy‑to‑clipboard, download, print actions – all using browser APIs (no storage).

#### [NEW] detection/README.md, redaction/README.md, inference/README.md, prompts/README.md, lib/README.md, tests/README.md
* One‑line stub files as described.

#### [NEW] docs/design/letterlock_privacy_first_dispute_letter_prototype.html
* Copy the original prototype HTML into this path unchanged – it serves as design reference.

#### [NEW] README.md
* Include the required sections (project description, run instructions, mock data location, route list, known prototype items to change later).

---
### Verification Plan
1. **Automated build** – `npm run build` must succeed with `tsc` showing zero errors.
2. **Dev server** – `npm run dev` should start Vite; manually visit `http://localhost:5173`.
3. **Route sanity** – Verify each of the six routes renders without console errors.
4. **Behavioral check** – Walk through the full user flow (Intake → Scan → Review → Generating → Letter) and confirm UI elements (modals, toast, copy/download/print) work as in the prototype.
5. **Code audit** – Grep for `localStorage|sessionStorage|IndexedDB|cookie` – none should appear.
6. **External scripts** – Search `index.html` for any `<script src=…>` besides the Google Font/Material Symbol links – none should remain.

---
### Acceptance Checklist (what will be reported back to you)
- Build passes, dev server runs, all routes render.
- Visual comparison notes of any unavoidable differences.
- Confirmation that no storage APIs or CDN scripts exist.
- List of any ambiguous prototype bits left unchanged (with notes).

Please review the plan above. If you see any issue or want a modification, let me know. Once you approve, I will start executing the steps.
