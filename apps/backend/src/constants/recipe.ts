/**
 * 菜譜相關常量定義
 */

// 菜譜類型映射
export const RECIPE_TYPE_MAP = {
  main: '主菜',
  side: '配菜',
  soup: '湯',
  dessert: '甜點',
  drink: '飲料',
  other: '其他'
} as const

export const RECIPE_TYPE_DESCRIPTION = Object.entries(RECIPE_TYPE_MAP)
  .map(([key, value]) => `${key}(${value})`)
  .join('、')

// 主食材映射
export const MAIN_INGREDIENT_MAP = {
  pork: '豬肉',
  beef: '牛肉',
  chicken: '雞肉',
  lamb: '羊肉',
  seafood: '海鮮',
  egg: '蛋',
  vegetable: '蔬菜',
  tofu: '豆腐',
  mushroom: '菇類',
  fruit: '水果',
  dairy: '乳製品',
  flour: '麵粉',
  tea: '茶',
  other: '其他'
} as const

export const MAIN_INGREDIENT_DESCRIPTION = Object.entries(MAIN_INGREDIENT_MAP)
  .map(([key, value]) => `${key}(${value})`)
  .join('、')

// 菜單篩選用食材映射（依類型分組）
export const MENU_INGREDIENTS_MAP = {
  main: {
    pork: '豬肉',
    beef: '牛肉',
    chicken: '雞肉',
    lamb: '羊肉',
    seafood: '海鮮',
    tofu: '豆腐',
    egg: '蛋',
    other: '其他'
  },
  side: {
    pork: '豬肉',
    beef: '牛肉',
    chicken: '雞肉',
    lamb: '羊肉',
    seafood: '海鮮',
    vegetable: '蔬菜',
    mushroom: '菇類',
    egg: '蛋',
    tofu: '豆腐',
    other: '其他'
  },
  soup: {
    pork: '豬肉',
    beef: '牛肉',
    chicken: '雞肉',
    lamb: '羊肉',
    seafood: '海鮮',
    vegetable: '蔬菜',
    tofu: '豆腐',
    other: '其他'
  },
  dessert: {
    fruit: '水果',
    dairy: '乳製品',
    flour: '麵粉',
    other: '其他'
  },
  drink: {
    tea: '茶',
    fruit: '水果',
    dairy: '乳製品',
    other: '其他'
  },
  other: {
    other: '其他'
  }
} as const

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
