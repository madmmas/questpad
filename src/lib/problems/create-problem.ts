import {
  buildTaggedProblemDraft,
  validateProblemImage,
  type ProblemImageMeta,
} from "./tagging";
import type { Difficulty, ProblemTagInput } from "./types";

export type UploadedImage = {
  url: string;
};

export type BookRecord = {
  id: string;
  title: string;
  subject: string | null;
};

export type ProblemRecord = {
  id: string;
  bookId: string;
  imageUrl: string;
  difficulty: Difficulty;
  tags: string | null;
};

export type CreateTaggedProblemDeps = {
  uploadImage: (
    file: ProblemImageMeta & { data: ArrayBuffer },
  ) => Promise<UploadedImage>;
  findOrCreateBook: (input: {
    title: string;
    subject: string;
  }) => Promise<BookRecord>;
  insertProblem: (input: {
    bookId: string;
    imageUrl: string;
    difficulty: Difficulty;
    tags: string | null;
  }) => Promise<ProblemRecord>;
};

export type CreateTaggedProblemInput = {
  image: ProblemImageMeta & { data: ArrayBuffer };
  tags: ProblemTagInput;
};

export type CreateTaggedProblemResult = {
  book: BookRecord;
  problem: ProblemRecord;
};

export async function createTaggedProblem(
  input: CreateTaggedProblemInput,
  deps: CreateTaggedProblemDeps,
): Promise<CreateTaggedProblemResult> {
  validateProblemImage(input.image);
  const draft = buildTaggedProblemDraft(input.tags);

  const uploaded = await deps.uploadImage(input.image);
  const book = await deps.findOrCreateBook({
    title: draft.bookTitle,
    subject: draft.subject,
  });
  const problem = await deps.insertProblem({
    bookId: book.id,
    imageUrl: uploaded.url,
    difficulty: draft.difficulty,
    tags: draft.tags,
  });

  return { book, problem };
}
