CREATE TABLE "exams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"prof_email" text NOT NULL,
	"exam_link" text NOT NULL,
	"date_time_start" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"exam_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"exam_code" text NOT NULL,
	"student_name" text NOT NULL,
	"student_email" text NOT NULL,
	"tab_change_count" integer DEFAULT 0 NOT NULL,
	"key_press_count" integer DEFAULT 0 NOT NULL,
	"mobile_found" boolean DEFAULT false NOT NULL,
	"prohibited_object_found" boolean DEFAULT false,
	"face_not_visible" boolean DEFAULT false NOT NULL,
	"multiple_faces_found" boolean DEFAULT false NOT NULL,
	"eyes_off_screen" boolean DEFAULT false NOT NULL,
	"focus_score" integer DEFAULT 100,
	"focus_status" text DEFAULT 'focused',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "user_type" text DEFAULT 'student' NOT NULL;