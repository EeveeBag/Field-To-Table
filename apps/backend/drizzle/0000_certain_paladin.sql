CREATE TYPE "public"."recipe_type" AS ENUM('main', 'side', 'soup', 'dessert');--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "recipe_type" NOT NULL,
	"main_ingredient" text NOT NULL,
	"sub_ingredient" text,
	"servings" integer DEFAULT 2 NOT NULL,
	"ingredients_text" text,
	"steps" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
