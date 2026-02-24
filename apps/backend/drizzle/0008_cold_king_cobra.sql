ALTER TABLE "recipes" ALTER COLUMN "main_ingredient" SET DATA TYPE text;--> statement-breakpoint
UPDATE "recipes"
SET "main_ingredient" = CASE
  WHEN "main_ingredient" = '豬' THEN 'pork'
  WHEN "main_ingredient" = '牛' THEN 'beef'
  WHEN "main_ingredient" = '雞' THEN 'chicken'
  WHEN "main_ingredient" = '羊' THEN 'lamb'
  WHEN "main_ingredient" = '蝦' THEN 'shrimp'
  WHEN "main_ingredient" = '蛋' THEN 'egg'
  WHEN "main_ingredient" = '魚' THEN 'fish'
  WHEN "main_ingredient" = '菜' THEN 'vegetable'
  WHEN "main_ingredient" = '其他' THEN 'other'
  WHEN "main_ingredient" IN ('pork', 'beef', 'chicken', 'lamb', 'shrimp', 'egg', 'fish', 'vegetable', 'other')
    THEN "main_ingredient"
  ELSE 'other'
END;--> statement-breakpoint
DROP TYPE "public"."main_ingredient_type";--> statement-breakpoint
CREATE TYPE "public"."main_ingredient_type" AS ENUM('pork', 'beef', 'chicken', 'lamb', 'shrimp', 'egg', 'fish', 'vegetable', 'other');--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "main_ingredient" SET DATA TYPE "public"."main_ingredient_type" USING "main_ingredient"::"public"."main_ingredient_type";
