import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { recipes } from '../db/schema/index.js'
import { z } from 'zod'
import { RECIPE_TYPE_DESCRIPTION, MAIN_INGREDIENT_DESCRIPTION } from '../constants/recipe.js'

import {
  RecipeTypeEnum as BaseRecipeTypeEnum,
  MainIngredientEnum as BaseMainIngredientEnum,
  createRecipeSchema as baseCreateRecipeSchema,
  recipeQuerySchema as baseRecipeQuerySchema
} from '@repo/shared/schemas'

// 從 Drizzle schema 自動生成基礎 Zod schemas
export const insertRecipeSchema = createInsertSchema(recipes)
export const selectRecipeSchema = createSelectSchema(recipes)

// ==================== OpenAPI Schemas ====================

// Recipe Type Enum (從 shared 擴展，加上 OpenAPI metadata)
export const RecipeTypeEnum = BaseRecipeTypeEnum.openapi({
  description: RECIPE_TYPE_DESCRIPTION
})

// Main Ingredient Enum (從 shared 擴展，加上 OpenAPI metadata)
export const MainIngredientEnum = BaseMainIngredientEnum.openapi({
  description: MAIN_INGREDIENT_DESCRIPTION
})

// 菜譜回應 Schema（用於 API 回應）
export const recipeResponseSchema = z.object({
  id: z.string().openapi({
    description: '菜譜 ID',
    example: 'clhqx2w0x0000qzrmn2q8h4k2'
  }),
  name: z.string().openapi({
    description: '菜譜名稱',
    example: '紅蘿蔔炒蛋'
  }),
  type: RecipeTypeEnum.openapi({
    description: RECIPE_TYPE_DESCRIPTION,
    example: 'side'
  }),
  mainIngredient: MainIngredientEnum.openapi({
    description: MAIN_INGREDIENT_DESCRIPTION,
    example: 'vegetable'
  }),
  subIngredient: z.string().nullable().openapi({
    description: '次要食材（選填）',
    example: '紅蘿蔔'
  }),
  servings: z.number().int().openapi({
    description: '份數（人份）',
    example: 4
  }),
  ingredientsText: z.string().nullable().openapi({
    description: '食材清單文字描述（選填）',
    example: '紅蘿蔔 2個\n雞蛋 3個'
  }),
  steps: z.string().nullable().openapi({
    description: '烹飪步驟（選填）',
    example: '1. 紅蘿蔔切絲\n2. 打蛋\n3. 熱鍋炒香'
  }),
  notes: z.string().nullable().openapi({
    description: '備註（選填）',
    example: '可加入蔥花提味'
  }),
  createdAt: z.string().datetime().openapi({
    description: '建立時間（ISO 8601 格式）',
    example: '2025-12-13T12:48:07.060Z'
  }),
  updatedAt: z.string().datetime().openapi({
    description: '最後更新時間（ISO 8601 格式）',
    example: '2025-12-13T12:48:07.060Z'
  })
})

// 新增菜譜的請求 Schema（從 shared 擴展，只加 OpenAPI metadata）
export const createRecipeSchema = z.object({
  name: baseCreateRecipeSchema.shape.name.openapi({
    description: '菜譜名稱（1-200 字）',
    example: '紅蘿蔔炒蛋'
  }),
  type: baseCreateRecipeSchema.shape.type.openapi({
    description: RECIPE_TYPE_DESCRIPTION,
    example: 'side'
  }),
  mainIngredient: baseCreateRecipeSchema.shape.mainIngredient.openapi({
    description: MAIN_INGREDIENT_DESCRIPTION,
    example: 'vegetable'
  }),
  subIngredient: baseCreateRecipeSchema.shape.subIngredient.openapi({
    description: '次要食材（選填）',
    example: '紅蘿蔔'
  }),
  servings: baseCreateRecipeSchema.shape.servings.openapi({
    description: '份數（人份），必須為正整數',
    example: 4
  }),
  ingredientsText: baseCreateRecipeSchema.shape.ingredientsText.openapi({
    description: '食材清單文字描述（選填，最多 5000 字）',
    example: '紅蘿蔔 2個\n雞蛋 3個'
  }),
  steps: baseCreateRecipeSchema.shape.steps.openapi({
    description: '烹飪步驟（選填，最多 10000 字）',
    example: '1. 紅蘿蔔切絲'
  }),
  notes: baseCreateRecipeSchema.shape.notes.openapi({
    description: '備註（選填，最多 1000 字）',
    example: '可加入蔥花提味'
  })
})

// 更新菜譜的請求 Schema（所有欄位都是 optional）
export const updateRecipeSchema = createRecipeSchema.partial()

// 查詢參數 Schema（從 shared 擴展，只加 OpenAPI metadata）
export const recipeQuerySchema = z.object({
  search: baseRecipeQuerySchema.shape.search.openapi({
    description: '搜尋菜名關鍵字（選填）',
    example: '炒蛋'
  }),
  type: baseRecipeQuerySchema.shape.type.openapi({
    description: RECIPE_TYPE_DESCRIPTION + '（選填）'
  }),
  mainIngredient: baseRecipeQuerySchema.shape.mainIngredient.openapi({
    description: MAIN_INGREDIENT_DESCRIPTION + '（選填）',
    example: 'vegetable'
  }),
  page: baseRecipeQuerySchema.shape.page.pipe(z.number().int().positive()).openapi({
    description: '頁碼（預設為 1）',
    example: '1'
  }),
  limit: baseRecipeQuerySchema.shape.limit.pipe(z.number().int().positive().max(100)).openapi({
    description: '每頁筆數（預設 20，最大 100）',
    example: '20'
  })
})

// TypeScript 類型推導
export type Recipe = z.infer<typeof selectRecipeSchema>
export type RecipeResponse = z.infer<typeof recipeResponseSchema>
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>
export type RecipeQuery = z.infer<typeof recipeQuerySchema>
