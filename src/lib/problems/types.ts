export const DIFFICULTIES = ["bronze", "silver", "gold"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export type ProblemTagInput = {
  bookTitle: string;
  subject: string;
  difficulty: Difficulty;
  tags?: string[];
};

export type TaggedProblemDraft = {
  bookTitle: string;
  subject: string;
  difficulty: Difficulty;
  tags: string | null;
};
