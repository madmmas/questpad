-- QuestPad schema bootstrap for local Docker Postgres.
-- Kept in sync with drizzle/0000_legal_vision.sql (statement-breakpoint markers removed).

CREATE TABLE "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"child_id" uuid NOT NULL,
	"name" text NOT NULL,
	"criteria" text,
	"earned_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"subject" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "problems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"difficulty" text NOT NULL,
	"tags" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid NOT NULL,
	"child_id" uuid NOT NULL,
	"work_image_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewer" text,
	"review_notes" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);

ALTER TABLE "problems" ADD CONSTRAINT "problems_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;
