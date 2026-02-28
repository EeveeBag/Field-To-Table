import type { MenuTypeKey } from './constants'

export interface Recipe {
  id: string
  name: string
  type: MenuTypeKey
  mainIngredient: string
  servings: number
  ingredientsText?: string
  steps?: string
  notes?: string
  isFavorite?: boolean
}
