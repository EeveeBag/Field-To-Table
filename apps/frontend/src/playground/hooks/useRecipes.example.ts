import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { InferRequestType } from 'hono/client'
import { client } from '@/api/client'

type RecipesQueryInput = InferRequestType<typeof client.api.recipes.$get>['query']
type CreateRecipeInput = InferRequestType<typeof client.api.recipes.$post>['json']
type UpdateRecipeInput = InferRequestType<(typeof client.api.recipes)[':id']['$put']>['json']

// 取得菜譜列表
export function useRecipes(params?: RecipesQueryInput) {
  return useQuery({
    queryKey: ['recipes', params],
    queryFn: async () => {
      const res = await client.api.recipes.$get({
        query: params ?? {}
      })
      return res.json()
    }
  })
}

// 取得單一菜譜
export function useRecipe(id: string) {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: async () => {
      // Hono client 使用 :id 格式（自動從 OpenAPI 的 {id} 轉換）
      const res = await client.api.recipes[':id'].$get({
        param: { id }
      })
      return res.json()
    },
    enabled: !!id
  })
}

// 新增菜譜
export function useCreateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateRecipeInput) => {
      const res = await client.api.recipes.$post({
        json: data
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    }
  })
}

// 更新菜譜
export function useUpdateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRecipeInput }) => {
      // Hono client 使用 :id 格式
      const res = await client.api.recipes[':id'].$put({
        param: { id },
        json: data
      })
      return res.json()
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['recipes', id] })
    }
  })
}

// 刪除菜譜
export function useDeleteRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Hono client 使用 :id 格式
      const res = await client.api.recipes[':id'].$delete({
        param: { id }
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    }
  })
}
