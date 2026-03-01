import { useQuery } from '@tanstack/react-query'
import { client } from '@/api/client'
import type { InferRequestType } from 'hono/client'

type RecipesQueryInput = InferRequestType<typeof client.api.recipes.$get>['query']
export const useMenu = (params?: RecipesQueryInput, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['recipes', params],
    queryFn: async () => {
      const res = await client.api.recipes.$get({
        query: params ?? {}
      })
      return res.json()
    },
    enabled: options?.enabled ?? true
  })
}

export const useMenuIngredients = () => {
  return useQuery({
    queryKey: ['menu-ingredients'],
    queryFn: async () => {
      const res = await client.api.options['menu-ingredients'].$get()
      return res.json()
    },
    select: (res) => res.data,
    staleTime: Infinity
  })
}
