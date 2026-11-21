# AI Workflow Rules

## Approach

Build this project incrementally using a spec-driven workflow. The context files define what to build (`project-overview.md`), how to build it (`architecture.md` and `code-standards.md`), and the current state of progress (`progress-tracker.md`). Always implement against these specs — do not infer or invent behavior from scratch.

The privacy invariants in `architecture.md` outrank speed and features. Because of the hackathon deadline, get the core flow working end to end first (paste, detect, review, draft, restore), and add anything else only after that works.

## Scoping Rules

- Work on one feature unit at a time
- Prefer small, verifiable increments over large
  speculative changes
- Do not combine unrelated system boundaries in a
  single implementation step
- Build in the order listed under Next Up in
  `progress-tracker.md` unless told otherwise

## When to Split Work

Split an implementation step if it combines:

- Changes to the privacy-critical modules (`src/detection`, `src/redaction`, `src/inference`) and UI changes
- On-device inference changes and cloud inference changes
- Prompts for more than one dispute type
- Behavior not clearly defined in the context files

If a change cannot be verified end to end quickly,
the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the
  context files
- If a requirement is ambiguous, resolve it in the
  relevant context file before implementing
- If a requirement is missing, add it as an open question
  in `progress-tracker.md` before continuing
- Do not weaken an invariant in `architecture.md` to make a feature work. Raise it as an open question instead.

## Protected Files

Do not modify the following unless explicitly instructed:

- `node_modules/` and any third-party library internals, including the Firebase SDK
- `LICENSE` — the hackathon requires a detectable open-source license
- Lock files, except through the package manager
- Generated build output (for example `dist/`)
- `.env*` files — never read out, print or commit their contents, and never commit App Check debug tokens

## Keeping Docs in Sync

Update the relevant context file whenever implementation
changes:

- System architecture or boundaries
- Storage model decisions
- Code conventions or standards
- Feature scope
- What is sent to the cloud, including the shape of the outgoing request
- The Devpost description, which must match what is actually built

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant defined in `architecture.md` was violated
3. `progress-tracker.md` reflects the completed work
4. `npm run build` passes
5. The tests for the unit pass
6. If the unit touches detection, redaction or inference, the browser's network tools show no original sensitive value in any outgoing request