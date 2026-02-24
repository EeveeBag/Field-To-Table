CREATE TYPE "public"."main_ingredient_type" AS ENUM('豬', '牛', '雞', '羊', '蝦', '蛋', '魚', '菜', '其他');--> statement-breakpoint
UPDATE "recipes"
SET "main_ingredient" = '其他'
WHERE "main_ingredient" NOT IN ('豬', '牛', '雞', '羊', '蝦', '蛋', '魚', '菜', '其他');--> statement-breakpoint
ALTER TABLE "recipes"
ALTER COLUMN "main_ingredient" SET DATA TYPE "public"."main_ingredient_type"
USING "main_ingredient"::"public"."main_ingredient_type";
