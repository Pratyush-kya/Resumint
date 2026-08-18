# Work checkpoint — Resume upload + ATS structural checks

Saved on 2026-08-18.

## Completed

- Added PDF/DOCX upload UI with drag-and-drop, 5MB validation, remove/replace, loading and fallback paste mode.
- Added in-memory `/api/ats/extract` parsing with positioned PDF text and DOCX XML structure metadata.
- Added checks for columns, tables, missing text layers, headers/footers, fonts/characters, text boxes/floating elements, and filename quality.
- Added 60/40 content/structure unified scoring and a score cap for a missing text layer.
- Updated job-description nudges and all identified privacy wording.
- Added extraction/scoring fixtures and restored a working ESLint setup.
- Registered PDF.js's worker module for the Next.js server bundle and preserved upload size metadata before parsing.
- Verified: `npm test` (9 tests pass), `npm run typecheck`, `npm run lint`, `npx next build --webpack`, and a real browser upload/API flow.

## Verification result

The clean browser flow on `http://localhost:3000/ats` now passes:

- `POST /api/ats/extract` returned 200.
- The supplied 3-page PDF produced 206 extracted words, unified score 57, content 36, parseability 88, and visible structural fixes.
- No fresh page errors were reported.

The dev server was cleanly restarted on port 3000 during verification. If it is no longer running, use `npm run dev -- --webpack -p 3000`.
