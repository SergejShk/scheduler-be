ALTER TABLE "tasks" ADD COLUMN "tasks" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN IF EXISTS "date";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN IF EXISTS "labels";