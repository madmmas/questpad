import type { BookRecord, ProblemRecord } from "@/lib/problems/create-problem";
import { DIFFICULTIES, type Difficulty } from "@/lib/problems/types";
import type { SubmissionRecord } from "@/lib/submissions/repository";

const HEATMAP_DAYS = 182;
const RECENT_ACTIVITY_LIMIT = 5;

// Milestone thresholds are product decisions, not derived from any spec —
// picked to roughly match the reference mockup's example badges.
const STREAK_BADGE_DAYS = 7;
const QUEST_BUILDER_SOLVED = 10;
const HUNDRED_DAYS_ACTIVE = 100;

export type DifficultyProgress = {
  difficulty: Difficulty;
  solved: number;
  total: number;
};

export type BadgeId = "streak-7" | "quest-builder" | "hundred-days";

export type Badge = {
  id: BadgeId;
  label: string;
  earned: boolean;
};

export type RecentActivityItem = {
  submissionId: string;
  bookTitle: string;
  difficulty: Difficulty;
  submittedAt: Date;
};

export type HeatmapDay = {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
};

export type DashboardStats = {
  solvedTotal: number;
  problemsTotal: number;
  byDifficulty: DifficultyProgress[];
  currentStreak: number;
  maxStreak: number;
  activeDays: number;
  badges: Badge[];
  recentActivity: RecentActivityItem[];
  heatmap: HeatmapDay[];
};

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function levelForCount(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

export function buildDashboardStats(
  problems: ProblemRecord[],
  books: BookRecord[],
  submissions: SubmissionRecord[],
  now: Date = new Date(),
): DashboardStats {
  const problemsById = new Map(
    problems.map((problem) => [problem.id, problem]),
  );
  const booksById = new Map(books.map((book) => [book.id, book]));

  const solvedProblemIds = new Set(
    submissions
      .filter((submission) => submission.status === "verified")
      .map((submission) => submission.problemId),
  );

  const byDifficulty: DifficultyProgress[] = DIFFICULTIES.map((difficulty) => {
    const inTier = problems.filter(
      (problem) => problem.difficulty === difficulty,
    );
    return {
      difficulty,
      total: inTier.length,
      solved: inTier.filter((problem) => solvedProblemIds.has(problem.id))
        .length,
    };
  });

  const solvedTotal = byDifficulty.reduce((sum, tier) => sum + tier.solved, 0);
  const problemsTotal = problems.length;

  const countsByDay = new Map<string, number>();
  for (const submission of submissions) {
    const key = toDateKey(submission.submittedAt);
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }
  const activeDayKeys = new Set(countsByDay.keys());
  const activeDays = activeDayKeys.size;

  let maxStreak = 0;
  for (const key of activeDayKeys) {
    const dayStart = new Date(`${key}T00:00:00.000Z`);
    const previousKey = toDateKey(addDays(dayStart, -1));
    if (activeDayKeys.has(previousKey)) continue; // not the start of a run

    let streak = 1;
    let cursor = dayStart;
    for (;;) {
      cursor = addDays(cursor, 1);
      if (!activeDayKeys.has(toDateKey(cursor))) break;
      streak += 1;
    }
    maxStreak = Math.max(maxStreak, streak);
  }

  let currentStreak = 0;
  let streakCursor = new Date(`${toDateKey(now)}T00:00:00.000Z`);
  if (!activeDayKeys.has(toDateKey(streakCursor))) {
    streakCursor = addDays(streakCursor, -1);
  }
  while (activeDayKeys.has(toDateKey(streakCursor))) {
    currentStreak += 1;
    streakCursor = addDays(streakCursor, -1);
  }

  const badges: Badge[] = [
    {
      id: "streak-7",
      label: "7-day streak",
      earned: maxStreak >= STREAK_BADGE_DAYS,
    },
    {
      id: "quest-builder",
      label: "Quest builder",
      earned: solvedTotal >= QUEST_BUILDER_SOLVED,
    },
    {
      id: "hundred-days",
      label: "100 days",
      earned: activeDays >= HUNDRED_DAYS_ACTIVE,
    },
  ];

  const recentActivity = [...submissions]
    .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
    .map((submission): RecentActivityItem | null => {
      const problem = problemsById.get(submission.problemId);
      const book = problem ? booksById.get(problem.bookId) : undefined;
      if (!problem || !book) return null;

      return {
        submissionId: submission.id,
        bookTitle: book.title,
        difficulty: problem.difficulty,
        submittedAt: submission.submittedAt,
      };
    })
    .filter((item): item is RecentActivityItem => item !== null)
    .slice(0, RECENT_ACTIVITY_LIMIT);

  const heatmap: HeatmapDay[] = [];
  let heatmapCursor = addDays(
    new Date(`${toDateKey(now)}T00:00:00.000Z`),
    -(HEATMAP_DAYS - 1),
  );
  for (let i = 0; i < HEATMAP_DAYS; i++) {
    const key = toDateKey(heatmapCursor);
    heatmap.push({
      date: key,
      level: levelForCount(countsByDay.get(key) ?? 0),
    });
    heatmapCursor = addDays(heatmapCursor, 1);
  }

  return {
    solvedTotal,
    problemsTotal,
    byDifficulty,
    currentStreak,
    maxStreak,
    activeDays,
    badges,
    recentActivity,
    heatmap,
  };
}
