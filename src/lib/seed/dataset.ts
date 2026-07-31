import { demoDatasetSchema, type DemoDataset } from "./types";

export type DemoDatasetFiles = {
  books: unknown;
  problems: unknown;
  submissions: unknown;
};

/**
 * Validate and normalize the demo seed payload (typically loaded from
 * `public/mock-data/*.json`).
 */
export function parseDemoDataset(files: DemoDatasetFiles): DemoDataset {
  const dataset = demoDatasetSchema.parse({
    books: files.books,
    problems: files.problems,
    submissions: files.submissions,
  });

  const bookIds = new Set(dataset.books.map((book) => book.id));
  for (const problem of dataset.problems) {
    if (!bookIds.has(problem.bookId)) {
      throw new Error(
        `Problem ${problem.id} references unknown book ${problem.bookId}`,
      );
    }
  }

  const problemIds = new Set(dataset.problems.map((problem) => problem.id));
  for (const submission of dataset.submissions) {
    if (!problemIds.has(submission.problemId)) {
      throw new Error(
        `Submission ${submission.id} references unknown problem ${submission.problemId}`,
      );
    }
  }

  return dataset;
}
