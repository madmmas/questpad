import type { Difficulty } from "@/lib/problems/types";
import type { SubmissionRecord } from "@/lib/submissions/repository";

export type ChildReviewItem = {
  submission: SubmissionRecord;
  bookTitle: string;
  difficulty: Difficulty;
  imageUrl: string;
};

export function buildChildReviewFeed(
  submissions: SubmissionRecord[],
  problems: Array<{
    id: string;
    bookId: string;
    difficulty: string;
    imageUrl: string;
  }>,
  books: Array<{ id: string; title: string }>,
): ChildReviewItem[] {
  const problemById = new Map(problems.map((problem) => [problem.id, problem]));
  const bookById = new Map(books.map((book) => [book.id, book]));

  return submissions
    .slice()
    .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
    .flatMap((submission) => {
      const problem = problemById.get(submission.problemId);
      if (!problem) return [];
      const book = bookById.get(problem.bookId);
      return [
        {
          submission,
          bookTitle: book?.title ?? "Unknown book",
          difficulty: problem.difficulty as Difficulty,
          imageUrl: problem.imageUrl,
        },
      ];
    });
}
