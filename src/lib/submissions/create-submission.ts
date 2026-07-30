import type { SubmissionRecord } from "./repository";

export type SubmitScratchpadWorkDeps = {
  storeWork: (svgMarkup: string) => Promise<{ url: string }>;
  insertSubmission: (input: {
    problemId: string;
    childId: string;
    workImageUrl: string;
  }) => Promise<SubmissionRecord>;
};

export type SubmitScratchpadWorkInput = {
  problemId: string;
  childId: string;
  svgMarkup: string;
};

export async function submitScratchpadWork(
  input: SubmitScratchpadWorkInput,
  deps: SubmitScratchpadWorkDeps,
): Promise<SubmissionRecord> {
  if (!input.problemId) {
    throw new Error("problemId is required");
  }
  if (!input.svgMarkup || input.svgMarkup.trim().length === 0) {
    throw new Error("Scratchpad work is empty");
  }

  const uploaded = await deps.storeWork(input.svgMarkup);

  return deps.insertSubmission({
    problemId: input.problemId,
    childId: input.childId,
    workImageUrl: uploaded.url,
  });
}
