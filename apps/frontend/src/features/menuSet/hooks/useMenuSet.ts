import { useMutation, useQuery } from '@tanstack/react-query'
import { client } from '@/api/client'
import type { InferRequestType } from 'hono/client'

type MenuSetQueryInput = InferRequestType<(typeof client.api)['menu-sets']['$get']>['query']
type UseMenuSetOptions = MenuSetQueryInput & { enabled?: boolean }

export const useMenuSet = ({ enabled, ...params }: UseMenuSetOptions = {}) => {
  return useQuery({
    queryKey: ['menu-set', params],
    queryFn: async () => {
      const res = await client.api['menu-sets'].$get({
        query: params ?? {}
      })
      return res.json()
    },
    select: (res) => res.data,
    enabled: enabled ?? true
  })
}

export const useMenuAddToMenuSet = (recipeId: string) => {
  return useMutation({
    mutationFn: async (menuSetId: string) => {
      const res = await client.api['menu-sets'][':id'].dishes.$post({
        param: { id: menuSetId },
        json: { recipeId }
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      return res.json()
    }
  })
}
