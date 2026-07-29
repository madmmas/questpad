import { z } from "zod";
import {
  DIFFICULTIES,
  type ProblemTagInput,
  type TaggedProblemDraft,
} from "./types";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const problemTagSchema = z.object({
  bookTitle: z
    .string()
    .trim()
    .min(1, "Book title is required")
    .max(200, "Book title is too long"),
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(100, "Subject is too long"),
  difficulty: z.enum(DIFFICULTIES, {
    error: "Difficulty must be bronze, silver, or gold",
  }),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
});

export type ProblemImageMeta = {
  name: string;
  type: string;
  size: number;
};

export function normalizeTags(tags: string[] | undefined): string | null {
  if (!tags || tags.length === 0) return null;

  const unique = [
    ...new Set(
      tags
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0),
    ),
  ];

  return unique.length > 0 ? unique.join(",") : null;
}

export function parseTagsField(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export function buildTaggedProblemDraft(
  input: ProblemTagInput,
): TaggedProblemDraft {
  const parsed = problemTagSchema.parse(input);
  return {
    bookTitle: parsed.bookTitle,
    subject: parsed.subject,
    difficulty: parsed.difficulty,
    tags: normalizeTags(parsed.tags),
  };
}

export function validateProblemImage(file: ProblemImageMeta): void {
  if (!file.name || file.size <= 0) {
    throw new Error("Image file is required");
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Image must be JPEG, PNG, WebP, or GIF");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 10MB or smaller");
  }
}

export { MAX_IMAGE_BYTES, ALLOWED_IMAGE_TYPES };
