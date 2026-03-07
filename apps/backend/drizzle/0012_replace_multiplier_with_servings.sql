ALTER TABLE "menu_set_dishes" DROP COLUMN IF EXISTS "multiplier";--> statement-breakpoint
ALTER TABLE "menu_set_dishes" ADD COLUMN "servings" integer DEFAULT 1 NOT NULL;
