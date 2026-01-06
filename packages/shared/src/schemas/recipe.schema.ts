import { z } from 'zod'

// ==================== Enums ====================

/**
 * 菜譜類型
 * - main: 主菜
 * - side: 配菜
 * - soup: 湯品
 * - dessert: 甜點
 */
export const RecipeTypeEnum = z.enum(['main', 'side', 'soup', 'dessert'])
export type RecipeType = z.infer<typeof RecipeTypeEnum>

// ==================== Input Schemas ====================

/**
 * 新增菜譜的驗證 Schema
 * 前後端共用，用於表單驗證與 API 驗證
 */
export const createRecipeSchema = z.object({
  name: z.string().min(1, '菜名不可為空').max(200, '菜名最多 200 字'),
  type: RecipeTypeEnum,
  mainIngredient: z.string().min(1, '主要食材不可為空'),
  subIngredient: z.string().optional(),
  servings: z.number().int('人份必須為整數').positive('人份必須大於 0'),
  ingredientsText: z.string().max(5000, '食材描述最多 5000 字').optional(),
  steps: z.string().max(10000, '烹飪步驟最多 10000 字').optional(),
  notes: z.string().max(1000, '備註最多 1000 字').optional(),
})

/**
 * 更新菜譜的驗證 Schema（所有欄位都是 optional）
 */
export const updateRecipeSchema = createRecipeSchema.partial()

/**
 * 查詢參數 Schema（用於列表篩選）
 */
export const recipeQuerySchema = z.object({
  search: z.string().optional(),
  type: RecipeTypeEnum.optional(),
  mainIngredient: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// ==================== Types ====================

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>
export type RecipeQuery = z.infer<typeof recipeQuerySchema>
