import { describe, expect, it } from "vitest";
import { buildQuestBoard } from "@/lib/problems/board";

const bookMath = { id: "book-1", title: "Math Workbook", subject: "Math" };
const bookReading = {
  id: "book-2",
  title: "Reading Comprehension",
  subject: "Reading",
};

describe("buildQuestBoard", () => {
  it("groups quests by book (sorted by title) and by difficulty within a book", () => {
    const groups = buildQuestBoard(
      [bookReading, bookMath],
      [
        {
          id: "p1",
          bookId: "book-1",
          imageUrl: "img1",
          difficulty: "gold",
          tags: "fractions",
        },
        {
          id: "p2",
          bookId: "book-1",
          imageUrl: "img2",
          difficulty: "bronze",
          tags: null,
        },
        {
          id: "p3",
          bookId: "book-2",
          imageUrl: "img3",
          difficulty: "silver",
          tags: "owl,story",
        },
      ],
      [],
    );

    expect(groups.map((group) => group.book.title)).toEqual([
      "Math Workbook",
      "Reading Comprehension",
    ]);
    expect(groups[0].quests.map((quest) => quest.difficulty)).toEqual([
      "bronze",
      "gold",
    ]);
    expect(
      groups[0].quests.every((quest) => quest.status === "unattempted"),
    ).toBe(true);
    expect(groups[1].quests[0].tags).toEqual(["owl", "story"]);
  });

  it("marks a quest in-progress when its latest submission is pending or rejected", () => {
    const groups = buildQuestBoard(
      [bookMath],
      [
        {
          id: "p1",
          bookId: "book-1",
          imageUrl: "img1",
          difficulty: "bronze",
          tags: null,
        },
      ],
      [
        {
          id: "s1",
          problemId: "p1",
          childId: "child-1",
          workImageUrl: "work1",
          status: "rejected",
          submittedAt: new Date("2026-01-01"),
        },
        {
          id: "s2",
          problemId: "p1",
          childId: "child-1",
          workImageUrl: "work2",
          status: "pending",
          submittedAt: new Date("2026-01-02"),
        },
      ],
    );

    expect(groups[0].quests[0].status).toBe("in-progress");
  });

  it("marks a quest solved when its latest submission is verified", () => {
    const groups = buildQuestBoard(
      [bookMath],
      [
        {
          id: "p1",
          bookId: "book-1",
          imageUrl: "img1",
          difficulty: "bronze",
          tags: null,
        },
      ],
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
          problemId: "p1",
          childId: "child-1",
          workImageUrl: "work2",
          status: "verified",
          submittedAt: new Date("2026-01-02"),
        },
      ],
    );

    expect(groups[0].quests[0].status).toBe("solved");
  });

  it("excludes books that have no problems", () => {
    const groups = buildQuestBoard([bookMath, bookReading], [], []);
    expect(groups).toEqual([]);
  });
});
