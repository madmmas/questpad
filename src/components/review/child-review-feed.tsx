import { formatRelativeTime } from "@/lib/format-relative-time";
import type { ChildReviewItem } from "@/lib/submissions/child-review";

const STATUS_LABEL = {
  pending: "Waiting for parent",
  verified: "Verified",
  rejected: "Needs revision",
} as const;

const STATUS_CLASS = {
  pending: "text-blue",
  verified: "text-green",
  rejected: "text-coral",
} as const;

export function ChildReviewFeed({ items }: { items: ChildReviewItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-fg-dim">
        No submissions yet. Pick a quest and submit your work from the
        scratchpad.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <article key={item.submission.id} className="card flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-bold">
                {item.bookTitle}
              </h2>
              <p className="text-sm capitalize text-fg-dim">
                {item.difficulty} · submitted{" "}
                {formatRelativeTime(item.submission.submittedAt)}
              </p>
            </div>
            <span
              className={`text-sm font-bold ${STATUS_CLASS[item.submission.status]}`}
            >
              {STATUS_LABEL[item.submission.status]}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-40 overflow-hidden rounded-[var(--radius-md)] bg-panel-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail source can be a same-origin local upload or a Vercel Blob URL */}
              <img
                src={item.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="h-40 overflow-hidden rounded-[var(--radius-md)] bg-panel-2">
              {item.submission.workImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- thumbnail source can be a same-origin local upload or a Vercel Blob URL
                <img
                  src={item.submission.workImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <p className="p-3 text-sm text-fg-faint">No work image</p>
              )}
            </div>
          </div>

          {item.submission.reviewNotes ? (
            <p className="rounded-[10px] bg-panel-2 px-3 py-2 text-sm text-fg">
              <span className="font-semibold text-fg-dim">Parent notes: </span>
              {item.submission.reviewNotes}
            </p>
          ) : item.submission.status !== "pending" ? (
            <p className="text-sm text-fg-faint">No notes from parent.</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
