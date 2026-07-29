import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { books, problems } from "@/lib/db/schema";
import type { BookRecord, ProblemRecord } from "@/lib/problems/create-problem";
import type { Difficulty } from "@/lib/problems/types";

export async function findOrCreateBook(input: {
  title: string;
  subject: string;
}): Promise<BookRecord> {
  const db = getDb();
  const existing = await db
    .select()
    .from(books)
    .where(eq(books.title, input.title))
    .limit(1);

  if (existing[0]) {
    return {
      id: existing[0].id,
      title: existing[0].title,
      subject: existing[0].subject,
    };
  }

  const [created] = await db
    .insert(books)
    .values({
      title: input.title,
      subject: input.subject,
    })
    .returning();

  return {
    id: created.id,
    title: created.title,
    subject: created.subject,
  };
}

export async function insertProblem(input: {
  bookId: string;
  imageUrl: string;
  difficulty: Difficulty;
  tags: string | null;
}): Promise<ProblemRecord> {
  const db = getDb();
  const [created] = await db
    .insert(problems)
    .values({
      bookId: input.bookId,
      imageUrl: input.imageUrl,
      difficulty: input.difficulty,
      tags: input.tags,
    })
    .returning();

  return {
    id: created.id,
    bookId: created.bookId,
    imageUrl: created.imageUrl,
    difficulty: created.difficulty as Difficulty,
    tags: created.tags,
  };
}
