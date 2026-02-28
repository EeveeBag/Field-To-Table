import { pgEnum } from 'drizzle-orm/pg-core'

/**
 * 菜譜類型 ENUM
 * - main: 主菜
 * - side: 配菜
 * - soup: 湯品
 * - dessert: 甜點
 * - drink: 飲料
 * - other: 其他
 */
export const recipeTypeEnum = pgEnum('recipe_type', [
  'main', 'side', 'soup', 'dessert', 'drink', 'other'
])

/**
 * 主食材 ENUM
 * - pork: 豬肉
 * - beef: 牛肉
 * - chicken: 雞肉
 * - lamb: 羊肉
 * - seafood: 海鮮
 * - egg: 蛋
 * - vegetable: 蔬菜
 * - tofu: 豆腐
 * - mushroom: 菇類
 * - fruit: 水果
 * - dairy: 乳製品
 * - flour: 麵粉
 * - tea: 茶
 * - other: 其他
 */
export const mainIngredientEnum = pgEnum('main_ingredient_type', [
  'pork', 'beef', 'chicken', 'lamb', 'seafood', 'egg', 'vegetable',
  'tofu', 'mushroom', 'fruit', 'dairy', 'flour', 'tea', 'other'
])
