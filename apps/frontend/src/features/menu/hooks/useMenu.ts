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

export const useMenuDetails = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const res = await client.api.recipes[':id'].$get({
        param: { id }
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      return res.json()
    },
    select: (res) => res.data,
    enabled: options?.enabled ?? true
  })
}
