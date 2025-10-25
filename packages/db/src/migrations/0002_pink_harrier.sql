CREATE TYPE "public"."exam_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"exam_id" integer NOT NULL,
	"student_id" text NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"submitted_at" timestamp,
	"score" integer,
	"proctoring_summary" jsonb
);
--> statement-breakpoint
CREATE TABLE "coding_test_cases" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"input" text NOT NULL,
	"expected_output" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"exam_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"prompt" text,
	"points" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mcq_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"attempt_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"answer_text" text,
	"answer_json" jsonb,
	"is_correct" boolean,
	"awarded_points" integer
);
--> statement-breakpoint
CREATE TABLE "verification_artifacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"attempt_id" integer NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "status" "exam_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "settings" jsonb;