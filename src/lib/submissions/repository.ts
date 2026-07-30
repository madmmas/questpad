import { getDb } from "@/lib/db/client";
import { submissions } from "@/lib/db/schema";

export type SubmissionStatus = "pending" | "verified" | "rejected";

export type SubmissionRecord = {
  id: string;
  problemId: string;
  childId: string;
  status: SubmissionStatus;
  submittedAt: Date;
};

export async function listSubmissions(): Promise<SubmissionRecord[]> {
  const db = getDb();
  const rows = await db.select().from(submissions);

  return rows.map((row) => ({
    id: row.id,
    problemId: row.problemId,
    childId: row.childId,
    status: row.status as SubmissionStatus,
    submittedAt: row.submittedAt,
  }));
}

export async function insertSubmission(input: {
  problemId: string;
  childId: string;
  workImageUrl: string;
}): Promise<SubmissionRecord> {
  const db = getDb();
  const [created] = await db
    .insert(submissions)
    .values({
      problemId: input.problemId,
      childId: input.childId,
      workImageUrl: input.workImageUrl,
    })
    .returning();

  return {
    id: created.id,
    problemId: created.problemId,
    childId: created.childId,
    status: created.status as SubmissionStatus,
    submittedAt: created.submittedAt,
  };
}
