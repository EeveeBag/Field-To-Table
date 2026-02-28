ALTER TABLE "recipes" ALTER COLUMN "main_ingredient" SET DATA TYPE text;--> statement-breakpoint
UPDATE "recipes" SET "main_ingredient" = 'seafood' WHERE "main_ingredient" IN ('shrimp', 'fish');--> statement-breakpoint
DROP TYPE "public"."main_ingredient_type";--> statement-breakpoint
CREATE TYPE "public"."main_ingredient_type" AS ENUM('pork', 'beef', 'chicken', 'lamb', 'seafood', 'egg', 'vegetable', 'tofu', 'mushroom', 'fruit', 'dairy', 'flour', 'tea', 'other');--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "main_ingredient" SET DATA TYPE "public"."main_ingredient_type" USING "main_ingredient"::"public"."main_ingredient_type";
