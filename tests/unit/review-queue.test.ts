import { describe, expect, it } from "vitest";
import { buildReviewQueue } from "@/lib/submissions/review-queue";

const bookMath = { id: "book-1", title: "Math Workbook", subject: "Math" };
const problemGold = {
  id: "p1",
  bookId: "book-1",
  imageUrl: "img1",
  difficulty: "gold" as const,
  tags: null,
};
const problemBronze = {
  id: "p2",
  bookId: "book-1",
  imageUrl: "img2",
  difficulty: "bronze" as const,
  tags: null,
};

describe("buildReviewQueue", () => {
  it("includes only pending submissions, newest first", () => {
    const items = buildReviewQueue(
      [
        {
          id: "s1",
          problemId: "p1",
          childId: "child-1",
          workImageUrl: "work1",
          status: "pending",
          submittedAt: new Date("2026-01-01"),
        },
        {
          id: "s2",
          problemId: "p2",
          childId: "child-1",
          workImageUrl: "work2",
          status: "verified",
          submittedAt: new Date("2026-01-03"),
        },
        {
          id: "s3",
          problemId: "p2",
          childId: "child-1",
          workImageUrl: "work3",
          status: "pending",
          submittedAt: new Date("2026-01-02"),
        },
      ],
      [problemGold, problemBronze],
      [bookMath],
    );

    expect(items.map((item) => item.submission.id)).toEqual(["s3", "s1"]);
  });

  it("attaches the matching problem and book to each item", () => {
    const items = buildReviewQueue(
      [
        {
          id: "s1",
          problemId: "p1",
          childId: "child-1",
          workImageUrl: "work1",
          status: "pending",
          submittedAt: new Date("2026-01-01"),
        },
      ],
      [problemGold],
      [bookMath],
    );

    expect(items[0].problem.difficulty).toBe("gold");
    expect(items[0].book.title).toBe("Math Workbook");
  });

  it("skips a submission whose problem or book can't be found", () => {
    const items = buildReviewQueue(
      [
        {
          id: "s1",
          problemId: "missing-problem",
          childId: "child-1",
          workImageUrl: "work1",
          status: "pending",
          submittedAt: new Date("2026-01-01"),
        },
      ],
      [problemGold],
      [bookMath],
    );

    expect(items).toEqual([]);
  });

  it("returns an empty array when there are no pending submissions", () => {
    const items = buildReviewQueue(
      [
        {
          id: "s1",
          problemId: "p1",
          childId: "child-1",
          workImageUrl: "work1",
          status: "verified",
          submittedAt: new Date("2026-01-01"),
        },
      ],
      [problemGold],
      [bookMath],
    );

    expect(items).toEqual([]);
  });
});
