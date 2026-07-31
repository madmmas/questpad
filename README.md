# QuestPad

[![CI](https://github.com/madmmas/questpad/actions/workflows/ci.yml/badge.svg)](https://github.com/madmmas/questpad/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A single-family learning tracker. A parent uploads scanned book pages as
"quests." A child picks one, works it out on a scratchpad (Apple Pencil
supported), submits it, and gets feedback from a parent and/or an AI
reviewer. Progress shows on a gamified, LeetCode-style dashboard: XP,
levels, streaks, badges, and a submission heatmap.

This is an MVP built for one family, open-sourced under the MIT license.
Not a SaaS product (yet) — see `docs/PRD.md` for scope and roadmap.

## Tech stack

- Next.js (App Router) + TypeScript
- Postgres via Neon + Drizzle ORM
- Vercel Blob for image storage
- Custom canvas scratchpad built on `perfect-freehand` (MIT, no
  commercial license required)
- Auth.js (NextAuth) with PIN-based profiles
- Claude API for optional AI review of submissions
- Telegram Bot API for parent notifications
- Tailwind CSS + shadcn/ui
- Vitest (unit) + Playwright (e2e)

Full rationale for each choice is in `docs/PRD.md`.

## Getting started

### Option A — Docker Compose (recommended for a full local stack)

Needs Docker Desktop / Docker Engine. Starts **Postgres** plus the **Next.js
app** (UI and API routes — the same handlers that become Vercel Functions
when deployed):

```bash
make up          # or: docker compose up --build -d
make smoke       # once ready: HTTP checks for /board, /dashboard, …
make logs        # follow container output
make down        # stop
```

Open http://localhost:3000/login with the demo accounts:

| Username | Role   | Password    |
| -------- | ------ | ----------- |
| `parent` | parent | `parent123` |
| `child`  | child  | `child123`  |

Then use the role-specific tabs (parent: Dashboard / Quest Board / Submit
Review / Add Quest; child: Dashboard / Quest Board / Start Quest /
Scratchpad / Review).

`make help` lists all targets. Postgres data and local uploads live in Docker
volumes (`make clean` deletes them).

### Option B — Host Node + Compose Postgres only

```bash
make db-only
cp .env.example .env.local
# DATABASE_URL=postgresql://questpad:questpad@localhost:5433/questpad
# DATABASE_DRIVER=postgres
npm install
npm run dev
```

(Compose publishes Postgres on host port **5433** so it does not collide with a
local Postgres on 5432. Inside the Compose network the app still uses
`db:5432`.)

### Option C — Hosted Neon (no Docker DB)

```bash
npm install
cp .env.example .env.local   # set DATABASE_URL to your Neon URL
npm run db:push              # push schema if the Neon DB is empty
npm run dev
```

Leave `BLOB_READ_WRITE_TOKEN` empty to store images under `uploads/` locally.

## Project structure

```
src/
  app/                # Next.js routes (App Router)
  components/
    dashboard/         # XP ring, streak, badges, heatmap, activity feed
    quest-board/        # browse/pick a quest (problem)
    scratchpad/          # drawing canvas (perfect-freehand)
  lib/
    db/                # Drizzle schema + client
    ai/                 # Claude API review integration
    telegram/            # notification helper
drizzle/               # generated SQL migrations
docs/                  # PRD and project instructions
tests/
  unit/                # Vitest
  e2e/                  # Playwright
```

## Testing

```bash
npm run test        # unit tests (Vitest)
npm run test:e2e     # end-to-end tests (Playwright)
```

## Docs

- `docs/PRD.md` — product requirements, data model, tech stack rationale
- `DEVLOG.md` — GitHub issue progress tracker
- `CLAUDE.md` — repo-level instructions for Claude Code

## Contributing

See `CONTRIBUTING.md`. This is a young, personal project — issues and
small PRs are welcome, response times may be slow.

## License

MIT — see `LICENSE`.
