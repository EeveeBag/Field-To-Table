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
  豬: '豬肉',
  牛: '牛肉',
  雞: '雞肉',
  羊: '羊肉',
  蝦: '蝦類',
  蛋: '蛋類',
  魚: '魚類',
  菜: '蔬菜',
  其他: '其他'
} as const

export type MainIngredient = keyof typeof MAIN_INGREDIENT_MAP

export const MAIN_INGREDIENTS = Object.keys(MAIN_INGREDIENT_MAP) as MainIngredient[]

export const isMainIngredient = (value: string): value is MainIngredient =>
  MAIN_INGREDIENTS.includes(value as MainIngredient)

export const coerceMainIngredient = (value: string): MainIngredient =>
  isMainIngredient(value) ? value : '其他'

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
