import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { favorites } from '../db/schema/index.js'
import { z } from 'zod'
import { recipeResponseSchema } from './recipe.schema.js'

import {
  createFavoriteSchema as baseCreateFavoriteSchema,
  favoriteQuerySchema as baseFavoriteQuerySchema
} from '@repo/shared/schemas'

// 從 Drizzle schema 自動生成基礎 Zod schemas
export const insertFavoriteSchema = createInsertSchema(favorites)
export const selectFavoriteSchema = createSelectSchema(favorites)

// ==================== OpenAPI Schemas ====================

// 收藏回應 Schema（用於 API 回應）- 包含菜譜資訊
export const favoriteWithRecipeResponseSchema = z.object({
  recipeId: z.string().openapi({
    description: '菜譜 ID',
    example: 'clhqx2w0x0000qzrmn2q8h4k2'
  }),
  recipe: recipeResponseSchema.openapi({
    description: '菜譜詳細資訊'
  }),
  createdAt: z.string().datetime().openapi({
    description: '收藏建立時間（ISO 8601 格式）',
    example: '2025-12-20T10:00:00Z'
  })
})

// 簡單收藏回應 Schema（用於新增收藏的回應）
export const favoriteResponseSchema = z.object({
  recipeId: z.string().openapi({
    description: '菜譜 ID',
    example: 'clhqx2w0x0000qzrmn2q8h4k2'
  }),
  createdAt: z.string().datetime().openapi({
    description: '收藏建立時間（ISO 8601 格式）',
    example: '2025-12-20T10:00:00Z'
  })
})

// 新增收藏的請求 Schema（從 shared 擴展，只加 OpenAPI metadata）
export const createFavoriteSchema = z.object({
  recipeId: baseCreateFavoriteSchema.shape.recipeId.openapi({
    description: '要收藏的菜譜 ID',
    example: 'clhqx2w0x0000qzrmn2q8h4k2'
  })
})

// 查詢參數 Schema（從 shared 擴展，只加 OpenAPI metadata）
export const favoriteQuerySchema = z.object({
  page: baseFavoriteQuerySchema.shape.page.pipe(z.number().int().positive()).openapi({
    description: '頁碼（預設為 1）',
    example: '1'
  }),
  limit: baseFavoriteQuerySchema.shape.limit.pipe(z.number().int().positive().max(100)).openapi({
    description: '每頁筆數（預設 20，最大 100）',
    example: '20'
  })
})

// TypeScript 類型推導
export type Favorite = z.infer<typeof selectFavoriteSchema>
export type FavoriteWithRecipeResponse = z.infer<typeof favoriteWithRecipeResponseSchema>
export type FavoriteResponse = z.infer<typeof favoriteResponseSchema>
export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>
export type FavoriteQuery = z.infer<typeof favoriteQuerySchema>
