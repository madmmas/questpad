import type { BookRecord, ProblemRecord } from "@/lib/problems/create-problem";
import type {
  SubmissionRecord,
  SubmissionReviewer,
} from "@/lib/submissions/repository";
import type { AiReviewProvider, AiReviewVerdict, ReviewImage } from "./types";

export type RunAiReviewDeps = {
  getSubmission: (id: string) => Promise<SubmissionRecord | null>;
  getProblem: (id: string) => Promise<ProblemRecord | null>;
  getBook: (id: string) => Promise<BookRecord | null>;
  loadAsset: (url: string) => Promise<ReviewImage>;
  provider: AiReviewProvider;
  updateSubmissionReview: (input: {
    id: string;
    status: "verified" | "rejected";
    reviewer: SubmissionReviewer;
    reviewNotes: string | null;
  }) => Promise<SubmissionRecord>;
};

export type RunAiReviewResult = {
  submission: SubmissionRecord;
  verdict: AiReviewVerdict;
};

/**
 * Load submission + problem images, ask the configured AI provider, and
 * persist the verdict with reviewer=`ai`. Parent review remains available
 * for any submission still left `pending`.
 */
export async function runAiReview(
  submissionId: string,
  deps: RunAiReviewDeps,
): Promise<RunAiReviewResult> {
  if (!submissionId) {
    throw new Error("submissionId is required");
  }

  const submission = await deps.getSubmission(submissionId);
  if (!submission) {
    throw new Error("Submission not found");
  }
  if (submission.status !== "pending") {
    throw new Error("Only pending submissions can be AI-reviewed");
  }
  if (!submission.workImageUrl) {
    throw new Error("Submission has no work image");
  }

  const problem = await deps.getProblem(submission.problemId);
  if (!problem) {
    throw new Error("Problem not found for submission");
  }

  const book = await deps.getBook(problem.bookId);
  const [problemImage, workImage] = await Promise.all([
    deps.loadAsset(problem.imageUrl),
    deps.loadAsset(submission.workImageUrl),
  ]);

  const verdict = await deps.provider.review({
    submissionId,
    problemImage,
    workImage,
    bookTitle: book?.title,
    difficulty: problem.difficulty,
  });

  const notes = verdict.notes.trim();
  const updated = await deps.updateSubmissionReview({
    id: submissionId,
    status: verdict.decision,
    reviewer: "ai",
    reviewNotes: notes.length > 0 ? notes : null,
  });

  return { submission: updated, verdict };
}
