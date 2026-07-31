import { describe, expect, it } from "vitest";
import { buildDashboardStats } from "@/lib/dashboard/stats";

const bookMath = { id: "book-1", title: "Math Workbook", subject: "Math" };

const problems = [
  {
    id: "p1",
    bookId: "book-1",
    imageUrl: "img1",
    difficulty: "gold" as const,
    tags: null,
  },
  {
    id: "p2",
    bookId: "book-1",
    imageUrl: "img2",
    difficulty: "bronze" as const,
    tags: null,
  },
  {
    id: "p3",
    bookId: "book-1",
    imageUrl: "img3",
    difficulty: "bronze" as const,
    tags: null,
  },
];

function submission(overrides: {
  id: string;
  problemId: string;
  status?: "pending" | "verified" | "rejected";
  submittedAt: string;
}) {
  return {
    id: overrides.id,
    problemId: overrides.problemId,
    childId: "child-1",
    workImageUrl: "work.svg",
    status: overrides.status ?? "verified",
    reviewer: null,
    reviewNotes: null,
    submittedAt: new Date(overrides.submittedAt),
    reviewedAt: null,
  };
}

const now = new Date("2026-01-10T12:00:00.000Z");

describe("buildDashboardStats", () => {
  it("counts solved problems per difficulty from verified submissions", () => {
    const stats = buildDashboardStats(
      problems,
      [bookMath],
      [
        submission({ id: "s1", problemId: "p1", submittedAt: "2026-01-01" }),
        submission({
          id: "s2",
          problemId: "p2",
          status: "rejected",
          submittedAt: "2026-01-02",
        }),
      ],
      now,
    );

    expect(stats.problemsTotal).toBe(3);
    expect(stats.solvedTotal).toBe(1);
    expect(stats.byDifficulty).toEqual([
      { difficulty: "bronze", solved: 0, total: 2 },
      { difficulty: "silver", solved: 0, total: 0 },
      { difficulty: "gold", solved: 1, total: 1 },
    ]);
  });

  it("computes current streak counting back from today", () => {
    const stats = buildDashboardStats(
      problems,
      [bookMath],
      [
        submission({ id: "s1", problemId: "p1", submittedAt: "2026-01-10" }),
        submission({ id: "s2", problemId: "p1", submittedAt: "2026-01-09" }),
        submission({ id: "s3", problemId: "p1", submittedAt: "2026-01-08" }),
      ],
      now,
    );

    expect(stats.currentStreak).toBe(3);
    expect(stats.activeDays).toBe(3);
  });

  it("keeps counting the current streak through a grace day when today has no activity yet", () => {
    const stats = buildDashboardStats(
      problems,
      [bookMath],
      [
        submission({ id: "s1", problemId: "p1", submittedAt: "2026-01-09" }),
        submission({ id: "s2", problemId: "p1", submittedAt: "2026-01-08" }),
      ],
      now,
    );

    expect(stats.currentStreak).toBe(2);
  });

  it("resets the current streak to 0 once a full day has passed with no activity", () => {
    const stats = buildDashboardStats(
      problems,
      [bookMath],
      [submission({ id: "s1", problemId: "p1", submittedAt: "2026-01-07" })],
      now,
    );

    expect(stats.currentStreak).toBe(0);
  });

  it("computes max streak across the longest run, independent of current streak", () => {
    const stats = buildDashboardStats(
      problems,
      [bookMath],
      [
        submission({ id: "s1", problemId: "p1", submittedAt: "2025-12-01" }),
        submission({ id: "s2", problemId: "p1", submittedAt: "2025-12-02" }),
        submission({ id: "s3", problemId: "p1", submittedAt: "2025-12-03" }),
        submission({ id: "s4", problemId: "p1", submittedAt: "2025-12-04" }),
        submission({ id: "s5", problemId: "p1", submittedAt: "2025-12-05" }),
        submission({ id: "s6", problemId: "p1", submittedAt: "2026-01-10" }),
      ],
      now,
    );

    expect(stats.maxStreak).toBe(5);
    expect(stats.currentStreak).toBe(1);
  });

  it("awards badges exactly at their thresholds", () => {
    const submissions = [];
    for (let day = 1; day <= 10; day++) {
      submissions.push(
        submission({
          id: `s${day}`,
          problemId: "p1",
          submittedAt: `2026-01-${String(day).padStart(2, "0")}`,
        }),
      );
    }
    const manyProblems = Array.from({ length: 10 }, (_, i) => ({
      id: `p${i}`,
      bookId: "book-1",
      imageUrl: "img",
      difficulty: "bronze" as const,
      tags: null,
    }));
    const manySubmissions = manyProblems.map((problem, i) =>
      submission({
        id: `verify-${i}`,
        problemId: problem.id,
        submittedAt: `2026-01-${String((i % 9) + 1).padStart(2, "0")}`,
      }),
    );

    const stats = buildDashboardStats(
      manyProblems,
      [bookMath],
      [...submissions, ...manySubmissions],
      new Date("2026-01-10T12:00:00.000Z"),
    );

    expect(stats.badges.find((b) => b.id === "streak-7")?.earned).toBe(true);
    expect(stats.badges.find((b) => b.id === "quest-builder")?.earned).toBe(
      true,
    );
    expect(stats.badges.find((b) => b.id === "hundred-days")?.earned).toBe(
      false,
    );
  });

  it("sorts recent activity newest first and skips submissions with no matching problem", () => {
    const stats = buildDashboardStats(
      problems,
      [bookMath],
      [
        submission({ id: "s1", problemId: "p1", submittedAt: "2026-01-01" }),
        submission({ id: "s2", problemId: "p2", submittedAt: "2026-01-05" }),
        submission({
          id: "s3",
          problemId: "missing",
          submittedAt: "2026-01-06",
        }),
      ],
      now,
    );

    expect(stats.recentActivity.map((item) => item.submissionId)).toEqual([
      "s2",
      "s1",
    ]);
  });

  it("generates a 182-day heatmap ending today with count-based levels", () => {
    const stats = buildDashboardStats(
      problems,
      [bookMath],
      [
        submission({ id: "s1", problemId: "p1", submittedAt: "2026-01-10" }),
        submission({ id: "s2", problemId: "p2", submittedAt: "2026-01-10" }),
      ],
      now,
    );

    expect(stats.heatmap).toHaveLength(182);
    expect(stats.heatmap[stats.heatmap.length - 1]).toEqual({
      date: "2026-01-10",
      level: 2,
    });
    expect(stats.heatmap[0].level).toBe(0);
  });
});
