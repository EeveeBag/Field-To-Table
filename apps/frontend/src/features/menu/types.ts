import type { InferResponseType } from 'hono/client'
import type { client } from '@/api/client'

type RecipesResponse = InferResponseType<typeof client.api.recipes.$get>

export type Recipe = RecipesResponse['data'][number] & {
  isFavorite?: boolean
}
