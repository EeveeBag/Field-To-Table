import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { recipes } from '../db/schema.js'
import { z } from 'zod'
import {
  RECIPE_TYPE_DESCRIPTION,
  MAIN_INGREDIENT_DESCRIPTION,
} from '../constants/recipe.js'

// 從 Drizzle schema 自動生成基礎 Zod schemas
export const insertRecipeSchema = createInsertSchema(recipes)
export const selectRecipeSchema = createSelectSchema(recipes)

// ==================== OpenAPI Schemas ====================

// Recipe Type Enum
export const RecipeTypeEnum = z.enum(['main', 'side', 'soup', 'dessert'])

// 菜譜回應 Schema（用於 API 回應）
export const recipeResponseSchema = z.object({
  id: z.string().openapi({
    description: '菜譜 ID',
    example: 'clhqx2w0x0000qzrmn2q8h4k2',
  }),
  name: z.string().openapi({
    description: '菜譜名稱',
    example: '紅蘿蔔炒蛋',
  }),
  type: RecipeTypeEnum.openapi({
    description: RECIPE_TYPE_DESCRIPTION,
    example: 'side',
  }),
  mainIngredient: z.string().openapi({
    description: MAIN_INGREDIENT_DESCRIPTION,
    example: '菜',
  }),
  subIngredient: z.string().nullable().openapi({
    description: '次要食材（選填）',
    example: '紅蘿蔔',
  }),
  servings: z.number().int().openapi({
    description: '份數（人份）',
    example: 4,
  }),
  ingredientsText: z.string().nullable().openapi({
    description: '食材清單文字描述（選填）',
    example: '紅蘿蔔 2個\n雞蛋 3個',
  }),
  steps: z.string().nullable().openapi({
    description: '烹飪步驟（選填）',
    example: '1. 紅蘿蔔切絲\n2. 打蛋\n3. 熱鍋炒香',
  }),
  notes: z.string().nullable().openapi({
    description: '備註（選填）',
    example: '可加入蔥花提味',
  }),
  createdAt: z.string().datetime().openapi({
    description: '建立時間（ISO 8601 格式）',
    example: '2025-12-13T12:48:07.060Z',
  }),
  updatedAt: z.string().datetime().openapi({
    description: '最後更新時間（ISO 8601 格式）',
    example: '2025-12-13T12:48:07.060Z',
  }),
})

// 新增菜譜的請求 Schema
export const createRecipeSchema = z.object({
  name: z.string().min(1, '菜名不可為空').max(200, '菜名最多 200 字').openapi({
    description: '菜譜名稱（1-200 字）',
    example: '紅蘿蔔炒蛋',
  }),
  type: RecipeTypeEnum.openapi({
    description: RECIPE_TYPE_DESCRIPTION,
    example: 'side',
  }),
  mainIngredient: z.string().openapi({
    description: MAIN_INGREDIENT_DESCRIPTION,
    example: '菜',
  }),
  subIngredient: z.string().optional().openapi({
    description: '次要食材（選填）',
    example: '紅蘿蔔',
  }),
  servings: z
    .number()
    .int('人份必須為整數')
    .positive('人份必須大於 0')
    .openapi({
      description: '份數（人份），必須為正整數',
      example: 4,
    }),
  ingredientsText: z
    .string()
    .max(5000, '食材描述最多 5000 字')
    .optional()
    .openapi({
      description: '食材清單文字描述（選填，最多 5000 字）',
      example: '紅蘿蔔 2個\n雞蛋 3個',
    }),
  steps: z.string().max(10000, '烹飪步驟最多 10000 字').optional().openapi({
    description: '烹飪步驟（選填，最多 10000 字）',
    example: '1. 紅蘿蔔切絲',
  }),
  notes: z.string().max(1000, '備註最多 1000 字').optional().openapi({
    description: '備註（選填，最多 1000 字）',
    example: '可加入蔥花提味',
  }),
})

// 更新菜譜的請求 Schema（所有欄位都是 optional）
export const updateRecipeSchema = createRecipeSchema.partial()

// 查詢參數 Schema
export const recipeQuerySchema = z.object({
  search: z.string().optional().openapi({
    description: '搜尋菜名關鍵字（選填）',
    example: '炒蛋',
  }),
  type: RecipeTypeEnum.optional().openapi({
    description: RECIPE_TYPE_DESCRIPTION + '（選填）',
  }),
  mainIngredient: z
    .string()
    .optional()
    .openapi({
      description: MAIN_INGREDIENT_DESCRIPTION + '（選填）',
      example: '菜',
    }),
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1)
    .pipe(z.number().int().positive())
    .openapi({
      description: '頁碼（預設為 1）',
      example: '1',
    }),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20)
    .pipe(z.number().int().positive().max(100))
    .openapi({
      description: '每頁筆數（預設 20，最大 100）',
      example: '20',
    }),
})

// TypeScript 類型推導
export type Recipe = z.infer<typeof selectRecipeSchema>
export type RecipeResponse = z.infer<typeof recipeResponseSchema>
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>
export type RecipeQuery = z.infer<typeof recipeQuerySchema>
