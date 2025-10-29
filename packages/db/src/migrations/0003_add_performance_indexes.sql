-- Add indexes for frequently queried columns to improve query performance

-- Index for attempts table - frequently queried by exam_id
CREATE INDEX IF NOT EXISTS "idx_attempts_exam_id" ON "attempts" ("exam_id");

-- Index for attempts table - frequently queried by student_id
CREATE INDEX IF NOT EXISTS "idx_attempts_student_id" ON "attempts" ("student_id");

-- Index for responses table - frequently queried by attempt_id
CREATE INDEX IF NOT EXISTS "idx_responses_attempt_id" ON "responses" ("attempt_id");

-- Index for responses table - frequently queried by question_id
CREATE INDEX IF NOT EXISTS "idx_responses_question_id" ON "responses" ("question_id");

-- Index for verification_artifacts table - frequently queried by attempt_id
CREATE INDEX IF NOT EXISTS "idx_verification_artifacts_attempt_id" ON "verification_artifacts" ("attempt_id");

-- Index for exam_questions table - frequently queried by exam_id
CREATE INDEX IF NOT EXISTS "idx_exam_questions_exam_id" ON "exam_questions" ("exam_id");

-- Index for mcq_options table - frequently queried by question_id
CREATE INDEX IF NOT EXISTS "idx_mcq_options_question_id" ON "mcq_options" ("question_id");

-- Index for coding_test_cases table - frequently queried by question_id
CREATE INDEX IF NOT EXISTS "idx_coding_test_cases_question_id" ON "coding_test_cases" ("question_id");

-- Index for logs table - frequently queried by student_email
CREATE INDEX IF NOT EXISTS "idx_logs_student_email" ON "logs" ("student_email");

-- Index for logs table - frequently queried by exam_code
CREATE INDEX IF NOT EXISTS "idx_logs_exam_code" ON "logs" ("exam_code");

-- Composite index for exams table - frequently queried by prof_email and status
CREATE INDEX IF NOT EXISTS "idx_exams_prof_email_status" ON "exams" ("prof_email", "status");

-- Index for exams table - frequently queried by exam_code
CREATE INDEX IF NOT EXISTS "idx_exams_exam_code" ON "exams" ("exam_code");
