import Link from "next/link";
import type { QuestBoardGroup } from "@/lib/problems/board";
import type { Difficulty, QuestStatus } from "@/lib/problems/types";

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};

const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  bronze: "bg-coral/20 text-coral",
  silver: "bg-silver/20 text-silver",
  gold: "bg-gold/20 text-gold",
};

const STATUS_LABEL: Record<QuestStatus, string> = {
  unattempted: "Not started",
  "in-progress": "In progress",
  solved: "Solved",
};

const STATUS_CLASS: Record<QuestStatus, string> = {
  unattempted: "text-fg-faint",
  "in-progress": "text-blue",
  solved: "text-green",
};

export function QuestBoard({ groups }: { groups: QuestBoardGroup[] }) {
  if (groups.length === 0) {
    return (
      <p className="text-sm text-fg-dim">
        No quests yet — ask a parent to upload one.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <section key={group.book.id} className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">
              {group.book.title}
            </h2>
            {group.book.subject ? (
              <p className="text-sm text-fg-faint">{group.book.subject}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
            {group.quests.map((quest) => (
              <Link
                key={quest.id}
                href={`/quest/${quest.id}`}
                className="card flex flex-col gap-2.5 !p-4 transition-colors hover:border-green/40"
              >
                <div
                  className="flex h-[90px] items-center justify-center overflow-hidden rounded-[var(--radius-md)]"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--panel-2), #161822)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail source can be a same-origin local upload or a Vercel Blob URL, so a static remotePatterns allowlist doesn't fit here */}
                  <img
                    src={quest.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <span
                  className={`self-start rounded-lg px-2.5 py-1 text-[11px] font-bold ${DIFFICULTY_CLASS[quest.difficulty]}`}
                >
                  {DIFFICULTY_LABEL[quest.difficulty]}
                </span>
                {quest.tags.length > 0 ? (
                  <p className="text-xs text-fg-faint">
                    {quest.tags.join(", ")}
                  </p>
                ) : null}
                <span
                  className={`mt-auto text-[13px] font-bold ${STATUS_CLASS[quest.status]}`}
                >
                  {STATUS_LABEL[quest.status]}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
