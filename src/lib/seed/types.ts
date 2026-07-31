import { z } from "zod";
import { DIFFICULTIES } from "@/lib/problems/types";
import { DEFAULT_CHILD_ID } from "@/lib/submissions/constants";

const uuidSchema = z.string().uuid();

export const seedBookSchema = z.object({
  id: uuidSchema,
  title: z.string().trim().min(1).max(200),
  subject: z.string().trim().min(1).max(100).nullable().optional(),
});

export const seedProblemSchema = z.object({
  id: uuidSchema,
  bookId: uuidSchema,
  imageUrl: z.string().trim().min(1),
  difficulty: z.enum(DIFFICULTIES),
  tags: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
});

export const seedSubmissionSchema = z.object({
  id: uuidSchema,
  problemId: uuidSchema,
  childId: uuidSchema,
  workImageUrl: z.string().trim().min(1).nullable(),
  status: z.enum(["pending", "verified", "rejected"]),
  reviewer: z.enum(["parent", "ai"]).nullable(),
  reviewNotes: z.string().nullable(),
  submittedAt: z.string().datetime(),
  reviewedAt: z.string().datetime().nullable(),
});

export const demoDatasetSchema = z.object({
  books: z.array(seedBookSchema).min(1),
  problems: z.array(seedProblemSchema).min(1),
  submissions: z.array(seedSubmissionSchema),
});

export type SeedBook = z.infer<typeof seedBookSchema>;
export type SeedProblem = z.infer<typeof seedProblemSchema>;
export type SeedSubmission = z.infer<typeof seedSubmissionSchema>;
export type DemoDataset = z.infer<typeof demoDatasetSchema>;

export { DEFAULT_CHILD_ID };
