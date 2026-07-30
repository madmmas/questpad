import { formatRelativeTime } from "@/lib/format-relative-time";
import type { BadgeId, DashboardStats } from "@/lib/dashboard/stats";
import type { Difficulty } from "@/lib/problems/types";

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};

const DIFFICULTY_NAME_CLASS: Record<Difficulty, string> = {
  bronze: "text-coral",
  silver: "text-silver",
  gold: "text-gold",
};

const DIFFICULTY_DOT_CLASS: Record<Difficulty, string> = {
  bronze: "bg-coral",
  silver: "bg-silver",
  gold: "bg-gold",
};

const HEATMAP_LEVEL_CLASS: Record<number, string> = {
  0: "bg-panel-2",
  1: "bg-heatmap-1",
  2: "bg-heatmap-2",
  3: "bg-heatmap-3",
  4: "bg-green",
};

const BADGE_ICON: Record<BadgeId, string> = {
  "streak-7": "🔥",
  "quest-builder": "🧱",
  "hundred-days": "🏆",
};

const BADGE_EARNED_CLASS: Record<BadgeId, string> = {
  "streak-7": "border-coral bg-coral/15",
  "quest-builder": "border-blue bg-blue/15",
  "hundred-days": "border-gold bg-gold/15",
};

const RING_RADIUS = 56;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function Dashboard({ stats }: { stats: DashboardStats }) {
  const ratio =
    stats.problemsTotal === 0 ? 0 : stats.solvedTotal / stats.problemsTotal;
  const dashOffset = RING_CIRCUMFERENCE * (1 - ratio);
  const earnedBadges = stats.badges.filter((badge) => badge.earned).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <div className="card">
          <p className="eyebrow mb-3.5">Quests completed</p>
          <div className="flex items-center gap-5">
            <div className="relative h-[130px] w-[130px] flex-none">
              <svg
                width="130"
                height="130"
                viewBox="0 0 128 128"
                className="-rotate-90"
              >
                <circle
                  cx="64"
                  cy="64"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="10"
                  className="stroke-panel-2"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="10"
                  strokeLinecap="round"
                  className="stroke-green"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-[26px] font-extrabold">
                  {stats.solvedTotal}
                </span>
                <span className="text-[11px] text-fg-dim">
                  / {stats.problemsTotal}
                </span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2.5">
              {stats.byDifficulty.map((tier) => (
                <div
                  key={tier.difficulty}
                  className="flex items-center justify-between rounded-[10px] bg-panel-2 px-3 py-2"
                >
                  <span
                    className={`text-[13px] font-bold ${DIFFICULTY_NAME_CLASS[tier.difficulty]}`}
                  >
                    {DIFFICULTY_LABEL[tier.difficulty]}
                  </span>
                  <span className="text-[13px] font-semibold text-fg-dim">
                    {tier.solved} / {tier.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <p className="eyebrow mb-3.5">Achievements — {earnedBadges}</p>
          <div className="mb-3 flex flex-wrap gap-3.5">
            {stats.badges.map((badge) => (
              <div
                key={badge.id}
                className="flex w-[60px] flex-col items-center gap-2"
              >
                <div
                  className={`flex h-[60px] w-[60px] items-center justify-center rounded-2xl border-2 text-[22px] ${
                    badge.earned
                      ? BADGE_EARNED_CLASS[badge.id]
                      : "border-border bg-panel-2 opacity-40"
                  }`}
                >
                  {BADGE_ICON[badge.id]}
                </div>
                <span className="text-center text-[11px] font-medium text-fg-dim">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
          <p className="eyebrow">Quest calendar</p>
          <p className="text-[15px] text-fg-dim">
            Current streak{" "}
            <b className="font-display text-xl font-bold text-fg">
              {stats.currentStreak} days
            </b>
            {" · "}
            Active days{" "}
            <b className="font-display text-xl font-bold text-fg">
              {stats.activeDays}
            </b>
          </p>
        </div>
        <div className="grid grid-cols-[repeat(26,minmax(0,1fr))] gap-[3px]">
          {stats.heatmap.map((day) => (
            <div
              key={day.date}
              title={day.date}
              className={`aspect-square rounded-[3px] ${HEATMAP_LEVEL_CLASS[day.level]}`}
            />
          ))}
        </div>
      </div>

      <div className="card">
        <p className="eyebrow mb-2">Recent quests</p>
        {stats.recentActivity.length === 0 ? (
          <p className="text-sm text-fg-dim">No submissions yet.</p>
        ) : (
          <div className="flex flex-col">
            {stats.recentActivity.map((item) => (
              <div
                key={item.submissionId}
                className="flex items-center justify-between border-b border-border py-3 text-sm last:border-none"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`h-2 w-2 rounded-full ${DIFFICULTY_DOT_CLASS[item.difficulty]}`}
                  />
                  {item.bookTitle}
                </div>
                <span className="text-xs text-fg-faint">
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
