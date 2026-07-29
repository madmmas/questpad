import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const books = pgTable("books", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  subject: text("subject"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const problems = pgTable("problems", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookId: uuid("book_id")
    .references(() => books.id)
    .notNull(),
  imageUrl: text("image_url").notNull(),
  difficulty: text("difficulty").notNull(), // "bronze" | "silver" | "gold"
  tags: text("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  problemId: uuid("problem_id")
    .references(() => problems.id)
    .notNull(),
  childId: uuid("child_id").notNull(),
  workImageUrl: text("work_image_url"),
  status: text("status").notNull().default("pending"), // pending | verified | rejected
  reviewer: text("reviewer"), // "parent" | "ai"
  reviewNotes: text("review_notes"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

export const badges = pgTable("badges", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id").notNull(),
  name: text("name").notNull(),
  criteria: text("criteria"),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});
