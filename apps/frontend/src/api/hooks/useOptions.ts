import { useQuery } from '@tanstack/react-query'
import { client } from '@/api/client'

/**
 * 取得菜譜類型選項
 * GET /api/options/recipe-types
 */
export function useRecipeTypeOptions() {
  return useQuery({
    queryKey: ['options', 'recipe-types'],
    queryFn: async () => {
      const res = await client.api.options['recipe-types'].$get()
      return res.json()
    },
    staleTime: Infinity
  })
}

/**
 * 取得主食材選項
 * GET /api/options/main-ingredients
 */
export function useMainIngredientOptions() {
  return useQuery({
    queryKey: ['options', 'main-ingredients'],
    queryFn: async () => {
      const res = await client.api.options['main-ingredients'].$get()
      return res.json()
    },
    staleTime: Infinity
  })
}

/**
 * 取得菜單篩選選項（類型 + 食材映射）
 * GET /api/options/menu-ingredients
 */
export function useMenuIngredients() {
  return useQuery({
    queryKey: ['options', 'menu-ingredients'],
    queryFn: async () => {
      const res = await client.api.options['menu-ingredients'].$get()
      return res.json()
    },
    staleTime: Infinity
  })
}
