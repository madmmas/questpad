"use client";

import { useState } from "react";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { ReviewDecision } from "@/lib/submissions/review-submission";
import type { ReviewQueueItem } from "@/lib/submissions/review-queue";

export function ReviewQueue({ items }: { items: ReviewQueueItem[] }) {
  const [queue, setQueue] = useState(items);
  const [selectedId, setSelectedId] = useState(items[0]?.submission.id ?? null);
  const [notes, setNotes] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  if (queue.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No submissions waiting for review.
      </p>
    );
  }

  const selected =
    queue.find((item) => item.submission.id === selectedId) ?? queue[0];

  function selectItem(id: string) {
    setSelectedId(id);
    setNotes("");
    setReviewError(null);
  }

  async function handleReview(decision: ReviewDecision) {
    setReviewError(null);
    setReviewing(true);
    try {
      const response = await fetch(
        `/api/submissions/${selected.submission.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision, notes }),
        },
      );

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to review submission");
      }

      setQueue((prev) => {
        const next = prev.filter(
          (item) => item.submission.id !== selected.submission.id,
        );
        setSelectedId(next[0]?.submission.id ?? null);
        return next;
      });
      setNotes("");
    } catch (error) {
      setReviewError(
        error instanceof Error ? error.message : "Failed to review submission",
      );
    } finally {
      setReviewing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Pending review — {queue.length}
      </p>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {queue.map((item) => (
          <button
            key={item.submission.id}
            type="button"
            onClick={() => selectItem(item.submission.id)}
            aria-pressed={item.submission.id === selected.submission.id}
            className={`w-40 flex-none rounded-xl border p-3 text-left ${
              item.submission.id === selected.submission.id
                ? "border-emerald-500"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <div className="h-16 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail source can be a same-origin local upload or a Vercel Blob URL, so a static remotePatterns allowlist doesn't fit here */}
              <img
                src={item.problem.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-2 truncate text-xs font-semibold">
              {item.book.title}
            </p>
            <p className="text-[11px] text-zinc-400">
              Submitted {formatRelativeTime(item.submission.submittedAt)}
            </p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Source problem
          </p>
          <div className="mt-2 h-56 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail source can be a same-origin local upload or a Vercel Blob URL, so a static remotePatterns allowlist doesn't fit here */}
            <img
              src={selected.problem.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {selected.book.title} · {selected.problem.difficulty}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Submitted work
          </p>
          <div className="mt-2 h-56 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
            {selected.submission.workImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- thumbnail source can be a same-origin local upload or a Vercel Blob URL, so a static remotePatterns allowlist doesn't fit here
              <img
                src={selected.submission.workImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Submitted {formatRelativeTime(selected.submission.submittedAt)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="review-notes"
          className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
        >
          Notes for your child (optional)
        </label>
        <textarea
          id="review-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="e.g. Great work on the fractions! Double check question 3."
          className="min-h-20 rounded-xl border border-zinc-300 bg-white p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {reviewError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {reviewError}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => handleReview("rejected")}
          disabled={reviewing}
          className="rounded-lg border border-red-400 px-4 py-2 text-sm font-medium text-red-600 disabled:opacity-60 dark:border-red-800 dark:text-red-400"
        >
          Needs revision
        </button>
        <button
          type="button"
          onClick={() => handleReview("verified")}
          disabled={reviewing}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {reviewing ? "Saving…" : "Verify quest"}
        </button>
      </div>
    </div>
  );
}
