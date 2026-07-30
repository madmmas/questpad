import type { BookRecord, ProblemRecord } from "@/lib/problems/create-problem";
import type { Difficulty } from "@/lib/problems/types";
import type { SubmissionRecord } from "./repository";

export type ReviewQueueItem = {
  submission: SubmissionRecord;
  problem: {
    id: string;
    imageUrl: string;
    difficulty: Difficulty;
  };
  book: {
    id: string;
    title: string;
  };
};

export function buildReviewQueue(
  submissions: SubmissionRecord[],
  problems: ProblemRecord[],
  books: BookRecord[],
): ReviewQueueItem[] {
  const problemsById = new Map(
    problems.map((problem) => [problem.id, problem]),
  );
  const booksById = new Map(books.map((book) => [book.id, book]));

  return submissions
    .filter((submission) => submission.status === "pending")
    .map((submission): ReviewQueueItem | null => {
      const problem = problemsById.get(submission.problemId);
      const book = problem ? booksById.get(problem.bookId) : undefined;
      if (!problem || !book) return null;

      return {
        submission,
        problem: {
          id: problem.id,
          imageUrl: problem.imageUrl,
          difficulty: problem.difficulty,
        },
        book: {
          id: book.id,
          title: book.title,
        },
      };
    })
    .filter((item): item is ReviewQueueItem => item !== null)
    .sort(
      (a, b) =>
        b.submission.submittedAt.getTime() - a.submission.submittedAt.getTime(),
    );
}
