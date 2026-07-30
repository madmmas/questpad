# DEVLOG

Progress log for QuestPad GitHub issues. Newest entries first within each
issue. Update this file when starting, finishing, or blocking work on an
issue.

## Active

### #5 — Manual verify/reject with notes

- **Status:** in progress (PR)
- **Branch:** `feat/issue-5-verify-reject-notes`
- **Notes:** `ReviewQueue` (`src/components/review/review-queue.tsx`) now
  has a notes textarea plus "Needs revision"/"Verify quest" actions.
  Both call `PATCH /api/submissions/[id]`, which runs a pure
  `reviewSubmission` orchestration function
  (`src/lib/submissions/review-submission.ts`, DI pattern, unit-tested)
  that sets status (verified/rejected), reviewer (`parent`), and trims
  notes to `null` when blank, via a new `updateSubmissionReview`
  repository function. On success the reviewed submission drops out of
  the local queue and the next pending item is selected.

## Backlog

| Issue                                              | Title                                    | Status      |
| -------------------------------------------------- | ---------------------------------------- | ----------- |
| [#1](https://github.com/madmmas/questpad/issues/1) | Image upload + tagging (parent)          | done        |
| [#2](https://github.com/madmmas/questpad/issues/2) | Quest board browse view (child)          | done        |
| [#3](https://github.com/madmmas/questpad/issues/3) | Scratchpad with Apple Pencil support     | done        |
| [#4](https://github.com/madmmas/questpad/issues/4) | Submission storage + parent review queue | done        |
| [#5](https://github.com/madmmas/questpad/issues/5) | Manual verify/reject with notes          | in progress |
| [#6](https://github.com/madmmas/questpad/issues/6) | Dashboard: XP, streak, heatmap, badges   | open        |
| [#7](https://github.com/madmmas/questpad/issues/7) | AI review integration (Claude API)       | open        |
| [#8](https://github.com/madmmas/questpad/issues/8) | Telegram notifications                   | open        |

## Done

### #4 — Submission storage + parent review queue

- **Merged:** PR #19 (`feat/issue-4-submission-review-queue`)
- **Notes:** Submission storage itself landed already as part of #3
  (`insertSubmission`/`listSubmissions` in
  `src/lib/submissions/repository.ts`). This PR added the remaining
  parent-facing piece: `/parent/review` lists pending submissions and
  lets a parent compare each one against its source problem image
  (`src/components/review/review-queue.tsx`). Pairing submissions with
  their problem/book and filtering to `pending`, newest first, is a pure
  `buildReviewQueue` function (`src/lib/submissions/review-queue.ts`,
  unit-tested), following the same pattern as `board.ts`.

### #3 — Scratchpad with Apple Pencil support

- **Merged:** PR #18 (`feat/issue-3-scratchpad-apple-pencil`)
- **Notes:** `/quest/[problemId]` renders `Scratchpad`
  (`src/components/scratchpad/scratchpad.tsx`), an SVG canvas drawn via
  Pointer Events + `perfect-freehand`, capturing pressure and tilt per
  point (Apple Pencil in Safari). Drafts autosave to `localStorage`
  (`src/lib/scratchpad/draft-storage.ts`, pure/unit-tested) and restore on
  mount. Submitting renders the strokes to a standalone SVG
  (`renderScratchpadSvg`), stores it (`storeSubmissionWork`, same
  Blob/local-disk fallback as problem images), and inserts a `pending`
  submission row via `submitScratchpadWork`
  (`src/lib/submissions/create-submission.ts`, DI pattern, unit-tested).
  Quest board cards now link to `/quest/[id]`. No auth/child-profile
  modeling yet, so submissions use a fixed placeholder child id
  (`src/lib/submissions/constants.ts`).

### #2 — Quest board browse view (child)

- **Merged:** PR #17 (`feat/issue-2-quest-board-browse`)
- **Notes:** `/board` page groups problems by book (sorted by title, then
  difficulty within each book) and shows an unattempted/in-progress/solved
  status per quest, derived from the latest submission for that problem
  (`src/lib/problems/board.ts`, pure/unit-tested). Reads live from Drizzle
  (`listBooks`/`listProblems`/`listSubmissions`) — no mock-data wiring.

### #1 — Image upload + tagging (parent)

- **Merged:** PR #9 (`feat/issue-1-image-upload-tagging`)
- **Notes:** Parent upload flow at `/parent/upload` with Zod tagging
  validation (subject, bronze/silver/gold, book title), Vercel Blob storage
  (local `uploads/` fallback without `BLOB_READ_WRITE_TOKEN`), and
  Drizzle persistence for books/problems. Unit tests cover tagging +
  create orchestration.
