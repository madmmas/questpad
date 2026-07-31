import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { submissions } from "@/lib/db/schema";

export type SubmissionStatus = "pending" | "verified" | "rejected";
export type SubmissionReviewer = "parent" | "ai";

export type SubmissionRecord = {
  id: string;
  problemId: string;
  childId: string;
  workImageUrl: string | null;
  status: SubmissionStatus;
  reviewer: SubmissionReviewer | null;
  reviewNotes: string | null;
  submittedAt: Date;
  reviewedAt: Date | null;
};

function mapSubmissionRow(
  row: typeof submissions.$inferSelect,
): SubmissionRecord {
  return {
    id: row.id,
    problemId: row.problemId,
    childId: row.childId,
    workImageUrl: row.workImageUrl,
    status: row.status as SubmissionStatus,
    reviewer: (row.reviewer as SubmissionReviewer | null) ?? null,
    reviewNotes: row.reviewNotes,
    submittedAt: row.submittedAt,
    reviewedAt: row.reviewedAt,
  };
}

export async function listSubmissions(): Promise<SubmissionRecord[]> {
  const db = getDb();
  const rows = await db.select().from(submissions);
  return rows.map(mapSubmissionRow);
}

export async function getSubmissionById(
  id: string,
): Promise<SubmissionRecord | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);
  const row = rows[0];
  return row ? mapSubmissionRow(row) : null;
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
    workImageUrl: created.workImageUrl,
    status: created.status as SubmissionStatus,
    reviewer: (created.reviewer as SubmissionReviewer | null) ?? null,
    reviewNotes: created.reviewNotes,
    submittedAt: created.submittedAt,
    reviewedAt: created.reviewedAt,
  };
}

export async function updateSubmissionReview(input: {
  id: string;
  status: "verified" | "rejected";
  reviewer: SubmissionReviewer;
  reviewNotes: string | null;
}): Promise<SubmissionRecord> {
  const db = getDb();
  const [updated] = await db
    .update(submissions)
    .set({
      status: input.status,
      reviewer: input.reviewer,
      reviewNotes: input.reviewNotes,
      reviewedAt: new Date(),
    })
    .where(eq(submissions.id, input.id))
    .returning();

  return {
    id: updated.id,
    problemId: updated.problemId,
    childId: updated.childId,
    workImageUrl: updated.workImageUrl,
    status: updated.status as SubmissionStatus,
    reviewer: (updated.reviewer as SubmissionReviewer | null) ?? null,
    reviewNotes: updated.reviewNotes,
    submittedAt: updated.submittedAt,
    reviewedAt: updated.reviewedAt,
  };
}
