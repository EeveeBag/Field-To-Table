import { pgEnum } from 'drizzle-orm/pg-core'

/**
 * 菜譜類型 ENUM
 * - main: 主菜
 * - side: 配菜
 * - soup: 湯品
 * - dessert: 甜點
 */
export const recipeTypeEnum = pgEnum('recipe_type', ['main', 'side', 'soup', 'dessert'])
