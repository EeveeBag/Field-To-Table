import { z } from 'zod'

// ==================== Favorite Input Schemas ====================

/**
 * 新增收藏的驗證 Schema
 * 前後端共用，用於表單驗證與 API 驗證
 */
export const createFavoriteSchema = z.object({
  recipeId: z.string().min(1, '菜譜 ID 不可為空'),
})

/**
 * 收藏查詢參數 Schema（用於列表分頁）
 */
export const favoriteQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// ==================== Types ====================

export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>
export type FavoriteQuery = z.infer<typeof favoriteQuerySchema>
