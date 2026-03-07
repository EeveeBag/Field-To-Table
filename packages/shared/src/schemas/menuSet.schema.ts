import { z } from 'zod'
import { RecipeTypeEnum } from './recipe.schema.js'

// ==================== MenuSetDish Schema ====================

/**
 * 菜單組中的單道菜輸入 Schema
 * 用於前端表單驗證
 */
export const menuSetDishInputSchema = z.object({
  recipeId: z.string().min(1, 'recipeId 不可為空'),
  servings: z.number().int('人份必須為整數').positive('人份必須大於 0'),
})

// ==================== MenuSet CRUD Schemas ====================

/**
 * 新增菜單組的驗證 Schema
 * 前後端共用，用於表單驗證與 API 驗證
 */
export const createMenuSetSchema = z.object({
  name: z
    .string()
    .min(1, '菜單組名稱不可為空')
    .max(200, '菜單組名稱最多 200 字'),
  description: z.string().max(1000, '描述最多 1000 字').optional(),
  servings: z
    .number()
    .int('人份必須為整數')
    .positive('人份必須大於 0')
    .default(4),
  dishes: z
    .array(menuSetDishInputSchema)
    .min(1, '至少需要一道菜')
    .max(20, '最多 20 道菜'),
})

/**
 * 更新菜單組的驗證 Schema
 * 所有欄位都是 optional，但 dishes 如果提供就必須有內容
 */
export const updateMenuSetSchema = z.object({
  name: z
    .string()
    .min(1, '菜單組名稱不可為空')
    .max(200, '菜單組名稱最多 200 字')
    .optional(),
  description: z.string().max(1000, '描述最多 1000 字').optional(),
  servings: z
    .number()
    .int('人份必須為整數')
    .positive('人份必須大於 0')
    .optional(),
  dishes: z
    .array(menuSetDishInputSchema)
    .min(1, '至少需要一道菜')
    .max(20, '最多 20 道菜')
    .optional(),
})

/**
 * 菜單組查詢參數 Schema（用於列表篩選）
 */
export const menuSetQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// ==================== Types ====================

export type MenuSetDishInput = z.infer<typeof menuSetDishInputSchema>
export type CreateMenuSetInput = z.infer<typeof createMenuSetSchema>
export type UpdateMenuSetInput = z.infer<typeof updateMenuSetSchema>
export type MenuSetQuery = z.infer<typeof menuSetQuerySchema>

// Re-export RecipeTypeEnum for convenience
export { RecipeTypeEnum }
