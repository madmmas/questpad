import type {
  DemoDataset,
  SeedBook,
  SeedProblem,
  SeedSubmission,
} from "./types";

export type SeedDemoDeps = {
  clearAll: () => Promise<void>;
  insertBook: (book: SeedBook) => Promise<void>;
  insertProblem: (problem: SeedProblem) => Promise<void>;
  insertSubmission: (submission: SeedSubmission) => Promise<void>;
};

export type SeedDemoResult = {
  books: number;
  problems: number;
  submissions: number;
};

/**
 * Wipe demo tables and insert the validated dataset. Side effects are
 * injected so unit tests can assert call order without a real DB.
 */
export async function seedDemo(
  dataset: DemoDataset,
  deps: SeedDemoDeps,
): Promise<SeedDemoResult> {
  await deps.clearAll();

  for (const book of dataset.books) {
    await deps.insertBook(book);
  }
  for (const problem of dataset.problems) {
    await deps.insertProblem(problem);
  }
  for (const submission of dataset.submissions) {
    await deps.insertSubmission(submission);
  }

  return {
    books: dataset.books.length,
    problems: dataset.problems.length,
    submissions: dataset.submissions.length,
  };
}
