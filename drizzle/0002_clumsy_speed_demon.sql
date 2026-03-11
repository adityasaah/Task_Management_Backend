ALTER TABLE "tasks" ADD COLUMN "target_progress" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "current_progress" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "metric" text DEFAULT 'percentage' NOT NULL;