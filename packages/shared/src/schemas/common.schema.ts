import { z } from 'zod'

// ==================== 錯誤回應 ====================

export const ErrorResponseSchema = z.object({
  error: z.string(),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

// ==================== 分頁 ====================

export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().min(0),
})

export type Pagination = z.infer<typeof PaginationSchema>

// ==================== 通用 Response Wrapper ====================

/**
 * 建立分頁列表回應 Schema
 * @param dataSchema - 資料陣列的 item schema
 */
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
) =>
  z.object({
    data: z.array(dataSchema),
    pagination: PaginationSchema,
  })

/**
 * 建立單一資料回應 Schema
 * @param dataSchema - 資料的 schema
 */
export const createDataResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
) =>
  z.object({
    data: dataSchema,
  })