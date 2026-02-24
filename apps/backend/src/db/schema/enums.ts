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
 * - 豬: 豬肉
 * - 牛: 牛肉
 * - 雞: 雞肉
 * - 羊: 羊肉
 * - 蝦: 蝦類
 * - 蛋: 蛋類
 * - 魚: 魚類
 * - 菜: 蔬菜
 * - 其他: 其他
 */
export const mainIngredientEnum = pgEnum('main_ingredient_type', [
  '豬',
  '牛',
  '雞',
  '羊',
  '蝦',
  '蛋',
  '魚',
  '菜',
  '其他'
])
