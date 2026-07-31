import { describe, expect, it, vi } from "vitest";
import { parseDemoDataset } from "@/lib/seed/dataset";
import { assertDemoSeedAllowed } from "@/lib/seed/guard";
import { seedDemo } from "@/lib/seed/seed-demo";
import { DEFAULT_CHILD_ID } from "@/lib/submissions/constants";
import booksJson from "../../public/mock-data/books.json";
import problemsJson from "../../public/mock-data/problems.json";
import submissionsJson from "../../public/mock-data/submissions.json";

describe("parseDemoDataset", () => {
  it("accepts the checked-in mock-data files", () => {
    const dataset = parseDemoDataset({
      books: booksJson,
      problems: problemsJson,
      submissions: submissionsJson,
    });

    expect(dataset.books.length).toBeGreaterThanOrEqual(2);
    expect(dataset.problems.length).toBeGreaterThanOrEqual(3);
    expect(dataset.submissions.some((s) => s.status === "pending")).toBe(true);
    expect(dataset.submissions.some((s) => s.status === "verified")).toBe(true);
    expect(dataset.submissions.some((s) => s.status === "rejected")).toBe(true);
    expect(
      dataset.submissions.every((s) => s.childId === DEFAULT_CHILD_ID),
    ).toBe(true);
    expect(
      new Set(dataset.problems.map((p) => p.difficulty)).size,
    ).toBeGreaterThanOrEqual(3);
  });

  it("rejects submissions that reference unknown problems", () => {
    expect(() =>
      parseDemoDataset({
        books: booksJson,
        problems: problemsJson,
        submissions: [
          {
            ...submissionsJson[0],
            problemId: "99999999-9999-4999-8999-999999999999",
          },
        ],
      }),
    ).toThrow(/unknown problem/);
  });
});

describe("assertDemoSeedAllowed", () => {
  it("requires ALLOW_DEMO_SEED=1", () => {
    expect(() =>
      assertDemoSeedAllowed({
        DATABASE_URL: "postgresql://questpad:questpad@localhost:5433/questpad",
      }),
    ).toThrow(/ALLOW_DEMO_SEED/);
  });

  it("refuses production", () => {
    expect(() =>
      assertDemoSeedAllowed({
        ALLOW_DEMO_SEED: "1",
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://questpad:questpad@localhost:5433/questpad",
      }),
    ).toThrow(/production/);
  });

  it("refuses remote Neon hosts without override", () => {
    expect(() =>
      assertDemoSeedAllowed({
        ALLOW_DEMO_SEED: "1",
        DATABASE_URL: "postgresql://user:pass@ep-x.us-east-1.aws.neon.tech/db",
      }),
    ).toThrow(/remote/);
  });

  it("allows local Compose URLs when flagged", () => {
    expect(() =>
      assertDemoSeedAllowed({
        ALLOW_DEMO_SEED: "1",
        DATABASE_URL: "postgresql://questpad:questpad@localhost:5433/questpad",
      }),
    ).not.toThrow();
  });
});

describe("seedDemo", () => {
  it("clears then inserts books, problems, and submissions in order", async () => {
    const dataset = parseDemoDataset({
      books: booksJson,
      problems: problemsJson,
      submissions: submissionsJson,
    });

    const order: string[] = [];
    const clearAll = vi.fn(async () => {
      order.push("clear");
    });
    const insertBook = vi.fn(async () => {
      order.push("book");
    });
    const insertProblem = vi.fn(async () => {
      order.push("problem");
    });
    const insertSubmission = vi.fn(async () => {
      order.push("submission");
    });

    const result = await seedDemo(dataset, {
      clearAll,
      insertBook,
      insertProblem,
      insertSubmission,
    });

    expect(clearAll).toHaveBeenCalledOnce();
    expect(insertBook).toHaveBeenCalledTimes(dataset.books.length);
    expect(insertProblem).toHaveBeenCalledTimes(dataset.problems.length);
    expect(insertSubmission).toHaveBeenCalledTimes(dataset.submissions.length);
    expect(order[0]).toBe("clear");
    expect(
      order.slice(1, 1 + dataset.books.length).every((s) => s === "book"),
    ).toBe(true);
    expect(result).toEqual({
      books: dataset.books.length,
      problems: dataset.problems.length,
      submissions: dataset.submissions.length,
    });
  });
});
