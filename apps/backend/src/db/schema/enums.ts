import { pgEnum } from 'drizzle-orm/pg-core'

/**
 * 菜譜類型 ENUM
 * - main: 主菜
 * - side: 配菜
 * - soup: 湯品
 * - dessert: 甜點
 */
export const recipeTypeEnum = pgEnum('recipe_type', ['main', 'side', 'soup', 'dessert'])

/**
 * 主食材 ENUM
 * - pork: 豬肉
 * - beef: 牛肉
 * - chicken: 雞肉
 * - lamb: 羊肉
 * - shrimp: 蝦類
 * - egg: 蛋類
 * - fish: 魚類
 * - vegetable: 蔬菜
 * - other: 其他
 */
export const mainIngredientEnum = pgEnum('main_ingredient_type', [
  'pork',
  'beef',
  'chicken',
  'lamb',
  'shrimp',
  'egg',
  'fish',
  'vegetable',
  'other'
])
