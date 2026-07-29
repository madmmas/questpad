import type { SubmissionRecord } from "@/lib/submissions/repository";
import type { BookRecord, ProblemRecord } from "./create-problem";
import { parseTagsField } from "./tagging";
import { DIFFICULTIES, type Difficulty, type QuestStatus } from "./types";

export type QuestBoardCard = {
  id: string;
  imageUrl: string;
  difficulty: Difficulty;
  tags: string[];
  status: QuestStatus;
};

export type QuestBoardGroup = {
  book: BookRecord;
  quests: QuestBoardCard[];
};

const DIFFICULTY_RANK = Object.fromEntries(
  DIFFICULTIES.map((difficulty, index) => [difficulty, index]),
) as Record<Difficulty, number>;

function statusFor(submissions: SubmissionRecord[]): QuestStatus {
  if (submissions.length === 0) return "unattempted";

  const latest = submissions.reduce((newest, submission) =>
    submission.submittedAt > newest.submittedAt ? submission : newest,
  );

  return latest.status === "verified" ? "solved" : "in-progress";
}

export function buildQuestBoard(
  books: BookRecord[],
  problems: ProblemRecord[],
  submissions: SubmissionRecord[],
): QuestBoardGroup[] {
  const submissionsByProblem = new Map<string, SubmissionRecord[]>();
  for (const submission of submissions) {
    const list = submissionsByProblem.get(submission.problemId) ?? [];
    list.push(submission);
    submissionsByProblem.set(submission.problemId, list);
  }

  const problemsByBook = new Map<string, ProblemRecord[]>();
  for (const problem of problems) {
    const list = problemsByBook.get(problem.bookId) ?? [];
    list.push(problem);
    problemsByBook.set(problem.bookId, list);
  }

  return books
    .filter((book) => (problemsByBook.get(book.id) ?? []).length > 0)
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((book) => ({
      book,
      quests: (problemsByBook.get(book.id) ?? [])
        .map((problem) => ({
          id: problem.id,
          imageUrl: problem.imageUrl,
          difficulty: problem.difficulty,
          tags: parseTagsField(problem.tags),
          status: statusFor(submissionsByProblem.get(problem.id) ?? []),
        }))
        .sort(
          (a, b) =>
            DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty],
        ),
    }));
}
