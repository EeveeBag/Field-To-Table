export const MenuTypes = {
  main: '主菜',
  side: '配菜',
  soup: '湯',
  dessert: '甜點',
  drink: '飲料',
  other: '其他'
} as const

export type MenuTypeKey = keyof typeof MenuTypes

export const MenuIngredients = {
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
