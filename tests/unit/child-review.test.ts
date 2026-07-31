import { describe, expect, it } from "vitest";
import { buildChildReviewFeed } from "@/lib/submissions/child-review";

describe("buildChildReviewFeed", () => {
  it("pairs submissions with book titles and newest first", () => {
    const items = buildChildReviewFeed(
      [
        {
          id: "s1",
          problemId: "p1",
          childId: "c1",
          workImageUrl: "/w1.svg",
          status: "pending",
          reviewer: null,
          reviewNotes: null,
          submittedAt: new Date("2026-01-01T00:00:00Z"),
          reviewedAt: null,
        },
        {
          id: "s2",
          problemId: "p1",
          childId: "c1",
          workImageUrl: "/w2.svg",
          status: "verified",
          reviewer: "parent",
          reviewNotes: "Nice work",
          submittedAt: new Date("2026-01-02T00:00:00Z"),
          reviewedAt: new Date("2026-01-02T01:00:00Z"),
        },
      ],
      [
        {
          id: "p1",
          bookId: "b1",
          difficulty: "bronze",
          imageUrl: "/p1.png",
        },
      ],
      [{ id: "b1", title: "Math Workbook" }],
    );

    expect(items).toHaveLength(2);
    expect(items[0]?.submission.id).toBe("s2");
    expect(items[0]?.bookTitle).toBe("Math Workbook");
    expect(items[0]?.submission.reviewNotes).toBe("Nice work");
  });
});
