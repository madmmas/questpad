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
  const [aiReviewing, setAiReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  if (queue.length === 0) {
    return (
      <p className="text-sm text-fg-dim">No submissions waiting for review.</p>
    );
  }

  const selected =
    queue.find((item) => item.submission.id === selectedId) ?? queue[0];

  function selectItem(id: string) {
    setSelectedId(id);
    setNotes("");
    setReviewError(null);
  }

  function removeFromQueue(submissionId: string) {
    setQueue((prev) => {
      const next = prev.filter((item) => item.submission.id !== submissionId);
      setSelectedId(next[0]?.submission.id ?? null);
      return next;
    });
    setNotes("");
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

      removeFromQueue(selected.submission.id);
    } catch (error) {
      setReviewError(
        error instanceof Error ? error.message : "Failed to review submission",
      );
    } finally {
      setReviewing(false);
    }
  }

  async function handleAiReview() {
    setReviewError(null);
    setAiReviewing(true);
    try {
      const response = await fetch(
        `/api/submissions/${selected.submission.id}/ai-review`,
        { method: "POST" },
      );
      const payload = (await response.json()) as {
        error?: string;
        verdict?: { decision: string; notes: string; provider: string };
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to run AI review");
      }
      removeFromQueue(selected.submission.id);
    } catch (error) {
      setReviewError(
        error instanceof Error ? error.message : "Failed to run AI review",
      );
    } finally {
      setAiReviewing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="eyebrow">Pending review — {queue.length}</p>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {queue.map((item) => (
          <button
            key={item.submission.id}
            type="button"
            onClick={() => selectItem(item.submission.id)}
            aria-pressed={item.submission.id === selected.submission.id}
            className={`w-40 flex-none rounded-[var(--radius-md)] border p-3 text-left ${
              item.submission.id === selected.submission.id
                ? "border-green bg-panel"
                : "border-border bg-panel"
            }`}
          >
            <div className="h-16 overflow-hidden rounded-[10px] bg-panel-2">
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
            <p className="text-[11px] text-fg-faint">
              Submitted {formatRelativeTime(item.submission.submittedAt)}
            </p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <p className="eyebrow">Source problem</p>
          <div className="mt-2 h-56 overflow-hidden rounded-[var(--radius-md)] bg-panel-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail source can be a same-origin local upload or a Vercel Blob URL, so a static remotePatterns allowlist doesn't fit here */}
            <img
              src={selected.problem.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <p className="mt-2 text-sm text-fg-dim">
            {selected.book.title} · {selected.problem.difficulty}
          </p>
        </div>

        <div className="card">
          <p className="eyebrow">Submitted work</p>
          <div className="mt-2 h-56 overflow-hidden rounded-[var(--radius-md)] bg-panel-2">
            {selected.submission.workImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- thumbnail source can be a same-origin local upload or a Vercel Blob URL, so a static remotePatterns allowlist doesn't fit here
              <img
                src={selected.submission.workImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <p className="mt-2 text-sm text-fg-dim">
            Submitted {formatRelativeTime(selected.submission.submittedAt)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="review-notes" className="eyebrow">
          Notes for your child (optional)
        </label>
        <textarea
          id="review-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="e.g. Great work on the fractions! Double check question 3."
          className="field min-h-20"
        />
      </div>

      {reviewError ? (
        <p className="text-sm text-coral" role="alert">
          {reviewError}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => void handleAiReview()}
          disabled={reviewing || aiReviewing}
          className="btn-secondary"
        >
          {aiReviewing ? "AI reviewing…" : "Ask AI to review"}
        </button>
        <button
          type="button"
          onClick={() => handleReview("rejected")}
          disabled={reviewing || aiReviewing}
          className="btn-danger"
        >
          Needs revision
        </button>
        <button
          type="button"
          onClick={() => handleReview("verified")}
          disabled={reviewing || aiReviewing}
          className="btn-primary"
        >
          {reviewing ? "Saving…" : "Verify quest"}
        </button>
      </div>
    </div>
  );
}
