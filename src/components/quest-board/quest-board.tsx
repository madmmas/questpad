import type { QuestBoardGroup } from "@/lib/problems/board";
import type { Difficulty, QuestStatus } from "@/lib/problems/types";

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};

const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  bronze:
    "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  silver: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  gold: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

const STATUS_LABEL: Record<QuestStatus, string> = {
  unattempted: "Not started",
  "in-progress": "In progress",
  solved: "Solved",
};

const STATUS_CLASS: Record<QuestStatus, string> = {
  unattempted: "text-zinc-500 dark:text-zinc-400",
  "in-progress": "text-blue-600 dark:text-blue-400",
  solved: "text-emerald-600 dark:text-emerald-400",
};

export function QuestBoard({ groups }: { groups: QuestBoardGroup[] }) {
  if (groups.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No quests yet — ask a parent to upload one.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <section key={group.book.id} className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {group.book.title}
            </h2>
            {group.book.subject ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {group.book.subject}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {group.quests.map((quest) => (
              <article
                key={quest.id}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="h-24 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail source can be a same-origin local upload or a Vercel Blob URL, so a static remotePatterns allowlist doesn't fit here */}
                  <img
                    src={quest.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <span
                  className={`self-start rounded-lg px-2.5 py-1 text-xs font-semibold ${DIFFICULTY_CLASS[quest.difficulty]}`}
                >
                  {DIFFICULTY_LABEL[quest.difficulty]}
                </span>
                {quest.tags.length > 0 ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {quest.tags.join(", ")}
                  </p>
                ) : null}
                <span
                  className={`text-sm font-medium ${STATUS_CLASS[quest.status]}`}
                >
                  {STATUS_LABEL[quest.status]}
                </span>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
