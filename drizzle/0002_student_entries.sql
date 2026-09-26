CREATE TABLE "student_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"date" date NOT NULL,
	"priority" text,
	"overall_level" text,
	"physics_level" text,
	"chemistry_level" text,
	"maths_bio_level" text,
	"average_score" real,
	"last_test_score" real,
	"dpp_completion" real,
	"study_hours" real,
	"backlog_chapters" integer,
	"performance_trend" text,
	"call_count" integer,
	"last_call_date" date,
	"next_call_date" date,
	"mentor_notes" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_entries" ADD CONSTRAINT "student_entries_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "student_entries_student_id_date_index" ON "student_entries" USING btree ("student_id","date");--> statement-breakpoint
-- Carry each student's current tracking values into a first daily row before the columns move.
INSERT INTO "student_entries" ("student_id", "date", "priority", "overall_level", "physics_level", "chemistry_level", "maths_bio_level", "average_score", "last_test_score", "dpp_completion", "study_hours", "backlog_chapters", "performance_trend", "call_count", "last_call_date", "next_call_date", "mentor_notes")
SELECT "user_id", ("updated_at" AT TIME ZONE 'Asia/Kolkata')::date, "priority", "overall_level", "physics_level", "chemistry_level", "maths_bio_level", "average_score", "last_test_score", "dpp_completion", "study_hours", "backlog_chapters", "performance_trend", "call_count", "last_call_date", "next_call_date", "mentor_notes"
FROM "student_profiles";
