import { formatRelativeTime } from "@/lib/format-relative-time";
import type { BadgeId, DashboardStats } from "@/lib/dashboard/stats";
import type { Difficulty } from "@/lib/problems/types";

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};

const DIFFICULTY_DOT_CLASS: Record<Difficulty, string> = {
  bronze: "bg-orange-500",
  silver: "bg-zinc-400",
  gold: "bg-amber-400",
};

const HEATMAP_LEVEL_CLASS: Record<number, string> = {
  0: "bg-zinc-100 dark:bg-zinc-800",
  1: "bg-emerald-200 dark:bg-emerald-950",
  2: "bg-emerald-300 dark:bg-emerald-800",
  3: "bg-emerald-500 dark:bg-emerald-600",
  4: "bg-emerald-600 dark:bg-emerald-400",
};

const BADGE_ICON: Record<BadgeId, string> = {
  "streak-7": "🔥",
  "quest-builder": "🧱",
  "hundred-days": "🏆",
};

const RING_RADIUS = 56;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function Dashboard({ stats }: { stats: DashboardStats }) {
  const ratio =
    stats.problemsTotal === 0 ? 0 : stats.solvedTotal / stats.problemsTotal;
  const dashOffset = RING_CIRCUMFERENCE * (1 - ratio);
  const earnedBadges = stats.badges.filter((badge) => badge.earned).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Quests completed
          </p>
          <div className="flex items-center gap-6">
            <div className="relative h-32 w-32 flex-none">
              <svg
                width="128"
                height="128"
                viewBox="0 0 128 128"
                className="-rotate-90"
              >
                <circle
                  cx="64"
                  cy="64"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="10"
                  className="stroke-zinc-100 dark:stroke-zinc-800"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="10"
                  strokeLinecap="round"
                  className="stroke-emerald-500"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold">{stats.solvedTotal}</span>
                <span className="text-xs text-zinc-500">
                  / {stats.problemsTotal}
                </span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              {stats.byDifficulty.map((tier) => (
                <div
                  key={tier.difficulty}
                  className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900"
                >
                  <span className="text-sm font-semibold">
                    {DIFFICULTY_LABEL[tier.difficulty]}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {tier.solved} / {tier.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Achievements — {earnedBadges}
          </p>
          <div className="flex flex-wrap gap-4">
            {stats.badges.map((badge) => (
              <div
                key={badge.id}
                className="flex w-20 flex-col items-center gap-2"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-xl ${
                    badge.earned
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-950"
                      : "border-zinc-200 bg-zinc-50 opacity-40 dark:border-zinc-800 dark:bg-zinc-900"
                  }`}
                >
                  {BADGE_ICON[badge.id]}
                </div>
                <span className="text-center text-[11px] font-medium text-zinc-500">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Quest calendar
          </p>
          <p className="text-sm text-zinc-500">
            Current streak{" "}
            <b className="text-zinc-900 dark:text-zinc-100">
              {stats.currentStreak} days
            </b>
            {" · "}
            Active days{" "}
            <b className="text-zinc-900 dark:text-zinc-100">
              {stats.activeDays}
            </b>
          </p>
        </div>
        <div className="grid grid-cols-[repeat(26,minmax(0,1fr))] gap-1">
          {stats.heatmap.map((day) => (
            <div
              key={day.date}
              title={day.date}
              className={`aspect-square rounded-sm ${HEATMAP_LEVEL_CLASS[day.level]}`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Recent quests
        </p>
        {stats.recentActivity.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No submissions yet.
          </p>
        ) : (
          <div className="flex flex-col">
            {stats.recentActivity.map((item) => (
              <div
                key={item.submissionId}
                className="flex items-center justify-between border-b border-zinc-100 py-3 text-sm last:border-none dark:border-zinc-800"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${DIFFICULTY_DOT_CLASS[item.difficulty]}`}
                  />
                  {item.bookTitle}
                </div>
                <span className="text-xs text-zinc-400">
                  {formatRelativeTime(item.submittedAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
