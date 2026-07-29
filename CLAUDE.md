# CLAUDE.md

Repo-level instructions for Claude Code sessions on QuestPad. For product
context, personas, and stack rationale, see `docs/PRD.md` first.

## Commands

```bash
npm run dev          # start dev server
npm run lint          # ESLint + Prettier check
npm run test           # Vitest unit tests
npm run test:e2e        # Playwright end-to-end tests
npm run db:generate      # generate Drizzle migration from schema changes
npm run db:push           # push schema to the Neon database
```

## Structure

- `src/app` — Next.js App Router routes
- `src/components/dashboard` — XP ring, streak, badges, heatmap, activity feed
- `src/components/quest-board` — browse/pick a quest (problem)
- `src/components/scratchpad` — drawing canvas built on `perfect-freehand`
- `src/lib/db` — Drizzle schema and client
- `src/lib/ai` — Claude API review integration
- `src/lib/telegram` — notification helper
- `drizzle/` — generated SQL migrations, do not hand-edit
- `public/mock-data` — placeholder problems/submissions for local dev and demos

## Working here

- Two roles use Claude Code on this repo: a developer (writes app code)
  and a tester (manual/automation testing, doesn't write app code).
- Single-family MVP scope — no multi-tenant, billing, or public sign-up
  work unless explicitly requested. See scope guardrails in the PRD.
- Never write real family data (photos, real names) into the repo. Use
  `public/mock-data/` for any example/demo data.
- No dependency requiring a commercial/proprietary license — this is
  why `perfect-freehand` was chosen over `tldraw`.
- Keep responses and diffs concise and focused on the requested change.
