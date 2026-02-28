import { z } from 'zod'

/**
 * 共用的 OpenAPI Response Schemas
 */

// ==================== 錯誤回應 ====================

export const ErrorResponseSchema = z.object({
  error: z.string().openapi({ example: 'Error message' })
})

// ==================== 分頁 ====================

export const PaginationSchema = z.object({
  page: z.number().int().positive().openapi({ example: 1 }),
  limit: z.number().int().positive().openapi({ example: 20 }),
  total: z.number().int().min(0).openapi({ example: 100 })
})

// ==================== 通用 Response Wrapper ====================

/**
 * 建立分頁列表回應 Schema
 * @param dataSchema - 資料陣列的 item schema
 */
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: PaginationSchema
  })

/**
 * 建立單一資料回應 Schema
 * @param dataSchema - 資料的 schema
 */
export const createDataResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema
  })

// ==================== 錯誤回應 Helper ====================

/** 建立錯誤回應的 route response 定義 */
export function createErrorResponse(description: string) {
  return {
    description,
    content: {
      'application/json': { schema: ErrorResponseSchema }
    }
  }
}
