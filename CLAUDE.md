# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Repo-level instructions for Claude Code sessions on QuestPad. For product
context, personas, and stack rationale, see `docs/PRD.md` first.

QuestPad is a single-family learning tracker MVP (open-source, MIT): a
parent uploads scanned book pages as "problems," a child solves them on a
canvas scratchpad, and a parent/AI reviews the work. Progress renders on a
gamified, LeetCode-style dashboard.

## Next.js version warning

This repo runs Next.js 16, which has breaking changes vs. older training
data (APIs, conventions, file structure may differ from what you expect).
Before writing Next.js code, check `node_modules/next/dist/docs/` for the
current API. This is enforced via `AGENTS.md`.

## Commands

```bash
npm run dev          # start dev server
npm run lint          # ESLint + Prettier check
npm run format          # Prettier write
npm run test           # Vitest unit tests (tests/unit)
npm run test:watch      # Vitest in watch mode
npm run test:e2e        # Playwright e2e (tests/e2e); builds+starts the app in CI, reuses `npm run dev` locally
npm run db:generate      # generate Drizzle migration from schema changes in src/lib/db/schema.ts
npm run db:push           # push schema straight to the Neon database (no migration file)
```

Single test file:

```bash
npx vitest run tests/unit/tagging.test.ts
npx playwright test tests/e2e/home.spec.ts
```

Node 20+ required (`.nvmrc` / CI both pin 20). A Husky pre-commit hook runs
lint-staged (ESLint --fix + Prettier) on staged files — don't bypass it.

## Architecture

**Implementation status**: most of `src/components/{dashboard,quest-board,scratchpad}`
and `src/lib/{ai,telegram}` are empty scaffold directories (`.gitkeep`
only) — the feature areas described in the PRD aren't built yet. The one
fully-implemented vertical slice is **problem upload**
(`src/app/parent/upload` → `src/components/upload` →
`src/app/api/problems` → `src/lib/problems` → `src/lib/db`), and it's the
reference pattern to follow for new features.

**Dependency-injected business logic**: core write flows (e.g.
`src/lib/problems/create-problem.ts`) take their side effects
(`uploadImage`, `findOrCreateBook`, `insertProblem`, ...) as an injected
`deps` object rather than importing the DB/storage modules directly. The
API route (`src/app/api/problems/route.ts`) wires the real implementations
from `src/lib/problems/repository.ts` and `src/lib/storage/blob.ts`; unit
tests (`tests/unit/create-problem.test.ts`) inject `vi.fn()` mocks
instead. Validation (Zod schemas in `src/lib/problems/tagging.ts`) always
runs before any injected side effect fires. Follow this pattern for new
mutations rather than calling `getDb()` directly from business logic.

**Storage fallback**: `src/lib/storage/blob.ts` uses Vercel Blob when
`BLOB_READ_WRITE_TOKEN` is set; otherwise it writes to a local
`uploads/problems/` directory and serves it back through
`src/app/api/uploads/problems/[filename]/route.ts`. This lets upload flows
work in local dev without any Blob credentials — don't assume Blob is
always configured.

**Database**: Neon Postgres in production via `drizzle-orm/neon-http`; local
Docker Compose uses TCP via `drizzle-orm/postgres-js`. Driver selection lives
in `src/lib/db/driver.ts` / `getDb()` (`DATABASE_DRIVER` override, else
infer from host). Throws if `DATABASE_URL` unset. Schema lives in
`src/lib/db/schema.ts`; run `npm run db:generate` after editing it and
never hand-edit generated files under `drizzle/` (Compose bootstrap SQL is
`docker/db/init.sql`). Core tables: `books`, `problems` (difficulty is
`bronze | silver | gold`, not easy/medium/hard), `submissions` (status
`pending | verified | rejected`, reviewer `parent | ai`), `badges`.
`child_id` is a bare UUID column with no `children` table yet (see PRD open
decision on modeling multiple kids). Local stack: `make up` (see Makefile).

**Auth**: `next-auth` is a dependency but no auth code exists yet in
`src/` — there's no session/middleware wiring to reason about currently.

**AI review / notifications**: `src/lib/ai` (Claude API) and
`src/lib/telegram` (Telegram Bot API for parent notifications) are
unimplemented stubs per the PRD, not yet wired to any route.

## Structure

- `src/app` — Next.js App Router routes and API routes
- `src/components/dashboard` — XP ring, streak, badges, heatmap, activity feed (not yet built)
- `src/components/quest-board` — browse/pick a quest/problem (not yet built)
- `src/components/scratchpad` — drawing canvas built on `perfect-freehand` (not yet built)
- `src/components/upload` — parent problem-upload form (implemented)
- `src/lib/problems` — tagging validation, create-problem use case, DB repository
- `src/lib/storage` — Blob/local-disk image storage
- `src/lib/db` — Drizzle schema and client
- `src/lib/ai` — Claude API review integration (not yet built)
- `src/lib/telegram` — notification helper (not yet built)
- `drizzle/` — generated SQL migrations, do not hand-edit
- `public/mock-data` — placeholder problems/submissions for local dev and demos
- `mock-ui/questpad-mockup.html` — static UI mockup/reference, not part of the app build

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
