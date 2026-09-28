CREATE TYPE "public"."review_status" AS ENUM('approved', 'changes_requested');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'pending');--> statement-breakpoint
CREATE TABLE "log_columns" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text,
	"type" text,
	"custom" boolean DEFAULT false NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"student_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "log_columns" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audience" "role" NOT NULL,
	"student_id" uuid NOT NULL,
	"actor_id" uuid,
	"message" text NOT NULL,
	"href" text,
	"group_key" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"admissions" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "student_entries" ADD COLUMN "custom" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "section_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "review_status" "review_status";--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "review_note" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "user_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_audience_student_id_read_at_index" ON "notifications" USING btree ("audience","student_id","read_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sections_admissions_index" ON "sections" USING btree ("admissions") WHERE "sections"."admissions";--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
INSERT INTO "sections" ("name", "admissions") VALUES ('New admissions', true);