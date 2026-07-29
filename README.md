# QuestPad

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

```bash
npm install
cp .env.example .env.local   # fill in real secrets — never commit this file
npm run dev
```

Open http://localhost:3000.

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
- `CLAUDE.md` — repo-level instructions for Claude Code

## Contributing

See `CONTRIBUTING.md`. This is a young, personal project — issues and
small PRs are welcome, response times may be slow.

## License

MIT — see `LICENSE`.
