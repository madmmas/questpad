# PRD — QuestPad

Status: draft v0.2. Fill in the [DECIDE] items as they're settled, then move stable ones into Project Knowledge / Instructions.

Repo name: `questpad`.

## 1. Summary

A single-family learning tracker. A parent uploads scanned book pages as "problems." The child picks a problem, works it out on a scratchpad (Apple Pencil), submits, and gets feedback from the parent and/or an AI reviewer. Progress is visualized on a LeetCode-style dashboard: difficulty breakdown, streak/badges, submission heatmap, recent activity.

Not in scope for v1: multi-tenant accounts, billing, public sign-up, multiple children (unless decided otherwise below).

This project will be open-source.

## 2. Personas

**Parent (admin)**
- Scans/uploads book page images.
- Tags each page with metadata (subject, difficulty, book/source).
- Reviews child's submissions; marks verified / needs revision / notes.
- Optionally routes a submission to AI review before or instead of personal review.
- Views the dashboard to see progress trends.

**Child**
- Browses available "problems" (uploaded pages), grouped by book or difficulty.
- Picks one, opens a scratchpad to do the work.
- Submits work (photo/scan of scratchpad or native drawing data, TBD).
- Sees their own dashboard: streak, badges, solved count by difficulty.

**AI reviewer (system actor)**
- Given a submission + the source problem image, produces a pass/fail or scored assessment and notifies the parent.
- [DECIDE] Does AI review replace parent review, gate it, or run in parallel?

## 3. Core user flows

**Upload flow (parent)**
1. Parent scans/photographs book page(s).
2. Uploads to app; assigns metadata (title, difficulty, tags).
3. Page appears in child's problem list.

**Work flow (child)**
1. Child opens app, sees list/grid of available problems (unattempted, in-progress, solved).
2. Picks one → opens scratchpad view.
3. Works with Apple Pencil; work auto-saves as draft.
4. Submits when done.

**Review flow (parent / AI)**
1. Submission appears in a review queue.
2. Parent opens it, compares against source page, marks verified/rejected, optionally leaves a note.
3. Parent can instead (or also) trigger "AI Review" → AI returns a verdict + notification.
4. Verified submissions update the child's stats (solved count, streak, badges).

**Dashboard flow (both)**
- Solved/total ring by difficulty (easy/medium/hard, or whatever taxonomy fits book content).
- Streak + max streak, active days.
- Badges for milestones (e.g., "100 days," matching the reference screenshot).
- Submission heatmap (calendar view, activity over the year).
- Recent activity / recent submissions feed.

## 4. MVP feature list

- [ ] Image upload + basic tagging (parent)
- [ ] Problem list/browse view (child)
- [ ] Scratchpad (Apple Pencil support, save/submit)
- [ ] Submission storage + review queue (parent)
- [ ] Manual verify/reject with notes
- [ ] Dashboard: solved counts, streak, heatmap, badges
- [ ] AI review integration (can be v1.1 if it simplifies launch)
- [ ] Notifications to parent via Telegram bot (submission ready, AI verdict ready)

## 5. Data model draft

- **Book/Source** — id, title, optional author/subject
- **Problem** (a scanned page) — id, book_id, image_url, difficulty, tags, created_at
- **Submission** — id, problem_id, child_id, work_image_or_data, submitted_at, status (pending/verified/rejected), reviewer (parent/ai), review_notes, reviewed_at
- **Streak/Stats** — derived from submissions (active days, current streak, max streak) — likely computed, not stored
- **Badge** — id, name, criteria, earned_at

[DECIDE] Single child now, but worth asking: model `child_id` from day one (cheap) even if there's only one row, so adding a sibling later isn't a schema migration.

## 6. Tech stack (decided)

- **Framework:** Next.js (App Router) + TypeScript — one codebase, works as a web app in iPad Safari, deploys natively to Vercel.
- **Database:** Postgres via Neon (Vercel's native Postgres marketplace integration since mid-2025).
- **ORM:** Drizzle (lighter on serverless/edge cold starts than Prisma; pairs well with Neon's HTTP driver).
- **Image storage:** Vercel Blob.
- **Scratchpad:** Custom canvas built on `perfect-freehand` (MIT-licensed stroke-outline library) + Pointer Events for Apple Pencil pressure/tilt capture in Safari. Rejected `tldraw` — its SDK requires a proprietary license (free hobby tier still needs a watermark, commercial tier is paid), which conflicts with an MIT open-source repo and the "no commercial dependency" requirement. Also rejected: compiling the Rust/WASM port of perfect-freehand up front — the JS version is fast enough for real-time strokes at Apple Pencil sampling rates; revisit only if profiling on-device shows the stroke math (not canvas redraw strategy) is an actual bottleneck. Native PencilKit app remains the fallback if the web canvas approach proves inadequate.
- **Auth:** Auth.js (NextAuth) with Credentials provider, PIN per profile (parent/child) — no OAuth/social login needed.
- **AI review:** Claude API (vision-capable model) called from a Vercel serverless function — compares submission image to source problem image.
- **Notifications:** Telegram Bot API — free, no business verification, single HTTP call from a serverless function on submission/AI-verdict events.
- **UI:** Tailwind CSS + shadcn/ui; Recharts or visx for difficulty rings/stats; `react-calendar-heatmap` (or similar) for the submission heatmap.
- **Testing:** Playwright for e2e (a second person runs these against critical flows), Vitest for unit tests.

## 7. Open decisions

- [DECIDE] AI review: does it replace parent review, gate it, or run in parallel? What exactly does it grade against — an answer key, the source page, both?
- [DECIDE] Difficulty taxonomy: easy/medium/hard like LeetCode, or subject-based (math/reading/etc.)?
- [DECIDE] Model `child_id` from day one even with only one child now, so adding a sibling later isn't a schema migration — recommended default: yes.

## 8. Open source

- **License:** MIT (default recommendation) — simplest, most common for a solo/hobby project. Revisit AGPL only if preventing a hosted SaaS clone of the code becomes a real concern.
- **Never commit real data:** child's scanned book pages, submission photos, or any identifying info must never enter git history. `.gitignore` local uploads; seed the repo with mock/placeholder problems and submissions for anyone who clones it.
- **Secrets:** `.env.example` only, never `.env` — covers Telegram bot token, Claude API key, Neon connection string.
- **Repo scaffolding:** README (what it is, setup steps), LICENSE, `.env.example`, basic CI (lint + test on PR). CONTRIBUTING.md can wait.

## 9. Testing

A second person handles manual/automation testing (doesn't write app code). Once the stack is chosen, define:
- Critical flows to smoke-test each release (upload → assign → submit → verify → dashboard updates).
- Whether to add automated e2e tests (Playwright/Cypress), or manual test scripts to start.

## 10. Someday / not decided (just ideas, not commitments)

- Repo stays `questpad` (open-source, MIT) for the MVP. If a real SaaS opportunity shows up later, it becomes a separate private project under a different name — no naming conflict with this repo since they'd never coexist publicly under the same brand.
- Possible future SaaS market: Canada, or narrower — just British Columbia (BC) — rather than going broad/US-first. Would likely mean aligning content/curriculum tagging to BC's curriculum if pursued. Purely conceptual right now, no action needed.
