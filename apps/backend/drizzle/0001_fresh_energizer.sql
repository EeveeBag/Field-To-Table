CREATE TYPE "public"."dish_role" AS ENUM('main', 'side', 'soup', 'dessert');--> statement-breakpoint
CREATE TABLE "menu_set_dishes" (
	"id" text PRIMARY KEY NOT NULL,
	"menu_set_id" text NOT NULL,
	"recipe_id" text NOT NULL,
	"role" "dish_role" NOT NULL,
	"multiplier" numeric(3, 1) DEFAULT '1.0',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_sets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"servings" integer DEFAULT 4 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menu_set_dishes" ADD CONSTRAINT "menu_set_dishes_menu_set_id_menu_sets_id_fk" FOREIGN KEY ("menu_set_id") REFERENCES "public"."menu_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_set_dishes" ADD CONSTRAINT "menu_set_dishes_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;