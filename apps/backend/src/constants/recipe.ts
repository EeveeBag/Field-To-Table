/**
 * 菜譜相關常量定義
 */

// 菜譜類型映射
export const RECIPE_TYPE_MAP = {
  main: '主菜',
  side: '副菜',
  soup: '湯',
  dessert: '甜點'
} as const

export type RecipeType = keyof typeof RECIPE_TYPE_MAP

export const RECIPE_TYPES = Object.keys(RECIPE_TYPE_MAP) as RecipeType[]

export const RECIPE_TYPE_DESCRIPTION = Object.entries(RECIPE_TYPE_MAP)
  .map(([key, value]) => `${key}(${value})`)
  .join('、')

// 主食材映射
export const MAIN_INGREDIENT_MAP = {
  pork: '豬肉',
  beef: '牛肉',
  chicken: '雞肉',
  lamb: '羊肉',
  shrimp: '蝦類',
  egg: '蛋類',
  fish: '魚類',
  vegetable: '蔬菜',
  other: '其他'
} as const

export type MainIngredient = keyof typeof MAIN_INGREDIENT_MAP

export const MAIN_INGREDIENT_DESCRIPTION = Object.entries(MAIN_INGREDIENT_MAP)
  .map(([key, value]) => `${key}(${value})`)
  .join('、')

// 單位映射（未來可能用到）
export const UNIT_MAP = {
  公克: 'g',
  毫升: 'ml',
  個: 'piece',
  包: 'package',
  大匙: 'tbsp',
  小匙: 'tsp'
} as const

export type Unit = keyof typeof UNIT_MAP
