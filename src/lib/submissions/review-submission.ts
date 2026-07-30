import type { SubmissionRecord } from "./repository";

export type ReviewDecision = "verified" | "rejected";

export type ReviewSubmissionDeps = {
  updateSubmissionReview: (input: {
    id: string;
    status: ReviewDecision;
    reviewer: "parent";
    reviewNotes: string | null;
  }) => Promise<SubmissionRecord>;
};

export type ReviewSubmissionInput = {
  submissionId: string;
  decision: ReviewDecision;
  notes?: string;
};

export async function reviewSubmission(
  input: ReviewSubmissionInput,
  deps: ReviewSubmissionDeps,
): Promise<SubmissionRecord> {
  if (!input.submissionId) {
    throw new Error("submissionId is required");
  }

  const trimmedNotes = input.notes?.trim();

  return deps.updateSubmissionReview({
    id: input.submissionId,
    status: input.decision,
    reviewer: "parent",
    reviewNotes: trimmedNotes && trimmedNotes.length > 0 ? trimmedNotes : null,
  });
}
