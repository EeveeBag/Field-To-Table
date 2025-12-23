import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { menuSets, menuSetDishes } from '../db/schema.js'
import { z } from 'zod'

// ==================== 基礎 Schemas ====================

// 從 Drizzle schema 自動生成基礎 Zod schemas
export const insertMenuSetSchema = createInsertSchema(menuSets)
export const selectMenuSetSchema = createSelectSchema(menuSets)

export const insertMenuSetDishSchema = createInsertSchema(menuSetDishes)
export const selectMenuSetDishSchema = createSelectSchema(menuSetDishes)

// ==================== MenuSetDish Schema ====================

// Recipe Type Enum (用於 dish type)
export const RecipeTypeEnum = z.enum(['main', 'side', 'soup', 'dessert'])

// API 請求中的 dish 格式（不包含 type，因為會從 recipe 取得）
export const menuSetDishInputSchema = z.object({
  recipeId: z.string().min(1, 'recipeId 不可為空').openapi({
    description: '菜譜 ID',
    example: 'clhqx2w0x0000qzrmn2q8h4k2',
  }),
  multiplier: z
    .number()
    .positive('倍數必須大於 0')
    .optional()
    .default(1.0)
    .openapi({
      description: '份量倍數（預設 1.0，必須大於 0）',
      example: 1.5,
    }),
})

// API 回應中的 dish 格式（包含 type）
export const menuSetDishOutputSchema = z.object({
  recipeId: z.string().openapi({
    description: '菜譜 ID',
    example: 'clhqx2w0x0000qzrmn2q8h4k2',
  }),
  multiplier: z.number().openapi({
    description: '份量倍數',
    example: 1.5,
  }),
  type: RecipeTypeEnum.openapi({
    description: '菜譜類型（自動從 recipe 取得）',
    example: 'main',
  }),
})

// ==================== MenuSet CRUD Schemas ====================

// 新增菜單組的驗證規則
export const createMenuSetSchema = z.object({
  name: z
    .string()
    .min(1, '菜單組名稱不可為空')
    .max(200, '菜單組名稱最多 200 字')
    .openapi({
      description: '菜單組名稱（1-200 字）',
      example: '家常四菜一湯',
    }),
  description: z.string().max(1000, '描述最多 1000 字').optional().openapi({
    description: '菜單組描述（選填，最多 1000 字）',
    example: '適合 4-6 人的家庭晚餐',
  }),
  servings: z
    .number()
    .int('人份必須為整數')
    .positive('人份必須大於 0')
    .default(4)
    .openapi({
      description: '份數（人份，預設 4，必須為正整數）',
      example: 4,
    }),
  dishes: z
    .array(menuSetDishInputSchema)
    .min(1, '至少需要一道菜')
    .max(20, '最多 20 道菜')
    .openapi({
      description: '菜色列表（至少 1 道，最多 20 道）',
      example: [
        { recipeId: 'clhqx2w0x0000qzrmn2q8h4k2', multiplier: 1.0 },
        { recipeId: 'clhqx2w0x0001qzrmn2q8h4k3', multiplier: 1.5 },
      ],
    }),
})

// 更新菜單組的驗證規則（所有欄位都是 optional，但 dishes 如果提供就必須有內容）
export const updateMenuSetSchema = z.object({
  name: z
    .string()
    .min(1, '菜單組名稱不可為空')
    .max(200, '菜單組名稱最多 200 字')
    .optional()
    .openapi({
      description: '菜單組名稱（選填，1-200 字）',
      example: '家常四菜一湯',
    }),
  description: z.string().max(1000, '描述最多 1000 字').optional().openapi({
    description: '菜單組描述（選填，最多 1000 字）',
    example: '適合 4-6 人的家庭晚餐',
  }),
  servings: z
    .number()
    .int('人份必須為整數')
    .positive('人份必須大於 0')
    .optional()
    .openapi({
      description: '份數（選填，必須為正整數）',
      example: 6,
    }),
  dishes: z
    .array(menuSetDishInputSchema)
    .min(1, '至少需要一道菜')
    .max(20, '最多 20 道菜')
    .optional()
    .openapi({
      description: '菜色列表（選填，至少 1 道，最多 20 道）',
      example: [{ recipeId: 'clhqx2w0x0000qzrmn2q8h4k2', multiplier: 1.0 }],
    }),
})

// 查詢參數驗證
export const menuSetQuerySchema = z.object({
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

// ==================== API Response Schema ====================

// 菜單組回應 Schema（用於 API 回應，包含 dishes 陣列）
export const menuSetResponseSchema = z.object({
  id: z.string().openapi({
    description: '菜單組 ID',
    example: 'clhqx3w0x0000qzrmn3q9h5k3',
  }),
  name: z.string().openapi({
    description: '菜單組名稱',
    example: '家常四菜一湯',
  }),
  description: z.string().nullable().openapi({
    description: '菜單組描述（可為空）',
    example: '適合 4-6 人的家庭晚餐',
  }),
  servings: z.number().int().openapi({
    description: '份數（人份）',
    example: 4,
  }),
  dishes: z.array(menuSetDishOutputSchema).openapi({
    description: '菜色列表',
    example: [
      { recipeId: 'clhqx2w0x0000qzrmn2q8h4k2', multiplier: 1.0, type: 'main' },
      { recipeId: 'clhqx2w0x0001qzrmn2q8h4k3', multiplier: 1.5, type: 'side' },
    ],
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

// ==================== TypeScript 類型推導 ====================

export type MenuSet = z.infer<typeof selectMenuSetSchema>
export type MenuSetDish = z.infer<typeof selectMenuSetDishSchema>
export type MenuSetDishInput = z.infer<typeof menuSetDishInputSchema>
export type MenuSetDishOutput = z.infer<typeof menuSetDishOutputSchema>
export type MenuSetResponse = z.infer<typeof menuSetResponseSchema>
export type CreateMenuSetInput = z.infer<typeof createMenuSetSchema>
export type UpdateMenuSetInput = z.infer<typeof updateMenuSetSchema>
export type MenuSetQuery = z.infer<typeof menuSetQuerySchema>

// API 回應格式（包含 dishes 陣列）- 使用 MenuSetResponse 型別
export type MenuSetWithDishes = MenuSetResponse
