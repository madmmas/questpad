import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { resolveDatabaseDriver } from "../src/lib/db/driver";
import { badges, books, problems, submissions } from "../src/lib/db/schema";
import { parseDemoDataset } from "../src/lib/seed/dataset";
import { assertDemoSeedAllowed } from "../src/lib/seed/guard";
import { seedDemo } from "../src/lib/seed/seed-demo";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mockDataDir = path.join(root, "public", "mock-data");

function readJson(name: string): unknown {
  return JSON.parse(readFileSync(path.join(mockDataDir, name), "utf8"));
}

async function main() {
  assertDemoSeedAllowed(process.env);

  const databaseUrl = process.env.DATABASE_URL!;
  const driver = resolveDatabaseDriver(
    databaseUrl,
    process.env.DATABASE_DRIVER,
  );
  if (driver !== "postgres") {
    throw new Error(
      `Demo seed requires DATABASE_DRIVER=postgres (got "${driver}"). ` +
        "Neon HTTP is not used for the local seed script.",
    );
  }

  const dataset = parseDemoDataset({
    books: readJson("books.json"),
    problems: readJson("problems.json"),
    submissions: readJson("submissions.json"),
  });

  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client);

  try {
    const result = await seedDemo(dataset, {
      clearAll: async () => {
        // FK order: submissions → problems → books; badges are independent.
        await db.delete(submissions);
        await db.delete(problems);
        await db.delete(badges);
        await db.delete(books);
      },
      insertBook: async (book) => {
        await db.insert(books).values({
          id: book.id,
          title: book.title,
          subject: book.subject ?? null,
        });
      },
      insertProblem: async (problem) => {
        await db.insert(problems).values({
          id: problem.id,
          bookId: problem.bookId,
          imageUrl: problem.imageUrl,
          difficulty: problem.difficulty,
          tags: problem.tags ?? null,
          ...(problem.createdAt
            ? { createdAt: new Date(problem.createdAt) }
            : {}),
        });
      },
      insertSubmission: async (submission) => {
        await db.insert(submissions).values({
          id: submission.id,
          problemId: submission.problemId,
          childId: submission.childId,
          workImageUrl: submission.workImageUrl,
          status: submission.status,
          reviewer: submission.reviewer,
          reviewNotes: submission.reviewNotes,
          submittedAt: new Date(submission.submittedAt),
          reviewedAt: submission.reviewedAt
            ? new Date(submission.reviewedAt)
            : null,
        });
      },
    });

    console.log(
      `Demo seed complete: ${result.books} books, ${result.problems} problems, ${result.submissions} submissions.`,
    );
  } finally {
    await client.end({ timeout: 5 });
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
