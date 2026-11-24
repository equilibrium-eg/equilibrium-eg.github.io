# Project handoff — الاتزان الكيميائي (Chemical Equilibrium platform)

Read this first. It records every decision made so far, so a new session can continue exactly where the last one stopped.

## What this is
An adaptive learning website for **Egyptian 3rd-year secondary chemistry — Chemical Equilibrium / Le Chatelier's principle**. Project owner: **Miss Arwa Yousef** (teacher; presenting it to her university supervisor). Talk to the people working on it in **Egyptian Arabic**, short and practical.

- Live site: **https://equilibrium-eg.github.io** (GitHub Pages, branch `main`, root). Push to `main` = deploy in ~1–2 min.
- Repo: `equilibrium-eg/equilibrium-eg.github.io` (public, neutral GitHub organization).
- **Keep the project anonymous:** no personal names other than Arwa Yousef anywhere in the site, commits or links.

## Files
| Path | What |
|---|---|
| `index.html` | **Built** single-file site that is served. Never edit by hand. |
| `src/content.js` | Concepts, diagnostic test (`PRETEST`), 6 units (sections, sims, misconceptions, quizzes), enrichment `CHALLENGES`. Equation mini-syntax is documented at the top. |
| `src/hints.js` | Acquire knowledge: `HINTS` (2 hints + per-wrong-option explanation per question), `EXPLAIN` (concept explainers), `KEYS` (keyword → concept). |
| `src/sims.js` | 7 conceptual simulations (dyn, fescn, kc, no2, piston, kp, cat). |
| `src/app.js` | App logic. `CONFIG` at the top (Apps Script URL, review tags, thresholds). |
| `src/art.js`, `src/style.css`, `src/index.template.html` | SVG art, styles, page shell. |
| `build.py` | `python3 build.py` → rebuilds `index.html` from `src/`. **Always rebuild before committing.** |
| `Code.gs` | Google Apps Script backend (logging). Lives in the Google Sheet's Apps Script; this copy is for reference. |
| `docs/presentation/` | PowerPoint deck (`.pptx`) + its generator (`build.js`, `rtlfix.py`, screenshots). |

## Decisions already made (do not reopen without the owner)
- **3 paths** by pre-test %: **علاجي 0–49** (blue, all 6 units in order) · **تصحيحي وداعم 50–79** (green, only weak concepts + misconceptions + reassessment) · **إثرائي 80–100** (purple, critical-thinking challenges + open lab). Student may choose any path; recommended one is highlighted.
- **Login:** email + phone only, with a consent checkbox. Progress also kept in the browser (localStorage).
- **Diagnostic & post-test:** 14 MCQs mapped to 11 concepts; free navigation (number bar, mark-for-review, submit anytime); unanswered = wrong but logged as `skipped`. Questions are drafts **pending teacher approval** (tag shown while `CONFIG.showReviewTags = true`).
- **Assistant name: Acquire.** It is **free and content-based** (no paid AI API — owner does not want to pay). 3-level hints, "why is my answer wrong", concept explainers, activity suggestions from weak concepts, Arabic/English keyword matching, out-of-scope → "ask your teacher". **Disabled during pre/post tests.** `Code.gs` still contains an optional Claude-API chat proxy; it is unused.
- **Branding:** title "الاتزان الكيميائي / Chemical Equilibrium" (old name "الكيمياء في قفص الاتهام" was dropped). Visual design follows the pastel reference (navy nav, blue/green/purple path cards, robot mascot).
- **Hosting:** GitHub Pages. **Netlify was abandoned — `*.netlify.app` is blocked in Egypt (since mid-2026).** Don't move to Netlify.
- **Scientific rules:** follow the teacher's revised scientific spec. HI numerical examples (Kc≈50 vs 55.16, no temperature), K units/rounding, Q, and unapproved extra reactions stay **hidden from students** until the teacher confirms. Simulations are labelled conceptual/illustrative; never invent data.

## Data → Google Sheet
- `CONFIG.API_URL` in `src/app.js` = the Apps Script Web App (`.../exec`) of the Sheet owned by the neutral Google account.
- Every event is POSTed (text/plain JSON `{action:'log', ...}`); failed sends queue in localStorage and retry.
- Sheet tabs created automatically: **Log** (one row per event) and **Students** (one row per student: pre %, path, weak concepts, post %, fixed concepts, units done, Acquire questions).
- Events: login, mood, pretest_complete, path_selected, unit_open, sim, quiz_answer, hint, concept_fixed, unit_complete, chat_open, chat_question, acquire_explain, acquire_unmatched, posttest_complete, logout.
- If `Code.gs` changes: Apps Script → Deploy → Manage deployments → edit → **New version** (URL stays the same).

## How to make a change
1. Edit files in `src/` (content changes usually only touch `content.js` / `hints.js`).
2. `python3 build.py`
3. Test locally (e.g. headless Chrome/Playwright on `index.html`; set `CONFIG.API_URL=''` in the page to avoid writing test rows to the real Sheet).
4. Commit and push to `main`.

## Open items / next steps
- DONE 2026-11-25: teacher approved the 14 diagnostic questions, all review-tagged sections, the 0 °C NO₂ description and the six video scripts → `CONFIG.showReviewTags = false`.
- Unit objectives (`UNIT_EXTRA.obj`) still await approval (`CONFIG.showObjTags = true`).
- HI example ADDED to Unit 3 with Kc = 50 (teacher's choice) + quiz Q3c; rounding = 3 decimal places (teacher). The worked-example concentrations are illustrative and tagged pending approval (`newrev`, shown with `CONFIG.showObjTags`). Still open: whether K is written with units. Q and extra reactions stay hidden.
- Unit story videos (AR/EN) live in `video/`; production files and scripts are outside the repo.
- Owner mentioned a possible **7th lesson** — content not received yet.
- Pilot with students → analyse pre/post + usage from the Sheet (DBR evaluation cycle).
