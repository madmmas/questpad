# Contributing to QuestPad

This started as a personal project for one family and is now open-source.
Contributions are welcome, but please open an issue before a large PR so
the direction can be agreed on first — see `docs/PRD.md` for current
scope and open decisions.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Use Node.js 20+ (matches CI). `npm install` also installs a Husky
pre-commit hook that runs lint-staged (ESLint + Prettier on staged files).

## Before opening a PR

- `npm run lint` passes (ESLint + Prettier check)
- `npm run test` passes (unit)
- `npm run test:e2e` passes locally if you touched a user-facing flow
- No real personal data, images, or secrets in the diff — use the mock
  data in `public/mock-data/` for anything example-related
- Keep scope tight: this is a single-family MVP, not a SaaS platform
  (see the scope guardrails in `docs/PRD.md`) — feature requests that
  assume multi-tenant/billing are out of scope for now

## Commit style

Plain, descriptive messages (`fix: ...`, `feat: ...`, `docs: ...`) are
fine — no strict convention enforced yet. Pre-commit will reject commits
that leave ESLint errors or Prettier formatting issues in staged files.

## Code style

TypeScript, Tailwind CSS, Prettier + ESLint (run automatically via
`npm run lint` and on commit via Husky). No commercial/proprietary-licensed
dependencies — everything in this repo should be usable by a clone with
zero paid accounts beyond the hosting/API services listed in `.env.example`.
