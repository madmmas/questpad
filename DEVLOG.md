# DEVLOG

Progress log for QuestPad GitHub issues. Newest entries first within each
issue. Update this file when starting, finishing, or blocking work on an
issue.

## Active

### #2 — Quest board browse view (child)

- **Status:** in progress (PR)
- **Branch:** `feat/issue-2-quest-board-browse`
- **Notes:** `/board` page groups problems by book (sorted by title, then
  difficulty within each book) and shows an unattempted/in-progress/solved
  status per quest, derived from the latest submission for that problem
  (`src/lib/problems/board.ts`, pure/unit-tested). Reads live from Drizzle
  (`listBooks`/`listProblems`/`listSubmissions`) — no mock-data wiring.

## Backlog

| Issue                                              | Title                                    | Status      |
| -------------------------------------------------- | ---------------------------------------- | ----------- |
| [#1](https://github.com/madmmas/questpad/issues/1) | Image upload + tagging (parent)          | done        |
| [#2](https://github.com/madmmas/questpad/issues/2) | Quest board browse view (child)          | in progress |
| [#3](https://github.com/madmmas/questpad/issues/3) | Scratchpad with Apple Pencil support     | open        |
| [#4](https://github.com/madmmas/questpad/issues/4) | Submission storage + parent review queue | open        |
| [#5](https://github.com/madmmas/questpad/issues/5) | Manual verify/reject with notes          | open        |
| [#6](https://github.com/madmmas/questpad/issues/6) | Dashboard: XP, streak, heatmap, badges   | open        |
| [#7](https://github.com/madmmas/questpad/issues/7) | AI review integration (Claude API)       | open        |
| [#8](https://github.com/madmmas/questpad/issues/8) | Telegram notifications                   | open        |

## Done

### #1 — Image upload + tagging (parent)

- **Merged:** PR #9 (`feat/issue-1-image-upload-tagging`)
- **Notes:** Parent upload flow at `/parent/upload` with Zod tagging
  validation (subject, bronze/silver/gold, book title), Vercel Blob storage
  (local `uploads/` fallback without `BLOB_READ_WRITE_TOKEN`), and
  Drizzle persistence for books/problems. Unit tests cover tagging +
  create orchestration.
