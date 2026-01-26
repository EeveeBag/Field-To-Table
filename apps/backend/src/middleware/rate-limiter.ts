import { rateLimiter } from 'hono-rate-limiter'
import type { Context } from 'hono'
import { isDevelopment } from '../lib/env.js'

/**
 * 取得客戶端 IP
 */
const getClientIp = (c: Context): string => {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || c.req.header('x-real-ip') || 'unknown'
  )
}

/**
 * 認證端點速率限制
 * - 非正式環境（dev/staging/test）：5 分鐘內最多 50 次（測試用）
 * - 正式環境：5 分鐘內最多 5 次
 */
export const authRateLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000,
  limit: isDevelopment ? 50 : 5,
  keyGenerator: (c) => `auth:${getClientIp(c)}`,
  standardHeaders: 'draft-6',
  message: { error: '登入嘗試過於頻繁，請 5 分鐘後再試' }
})

/**
 * 一般 API 速率限制
 * - 非正式環境（dev/staging/test）：1 分鐘內最多 500 次（測試用）
 * - 正式環境：1 分鐘內最多 100 次
 */
export const apiRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: isDevelopment ? 500 : 100,
  keyGenerator: (c) => `api:${getClientIp(c)}`,
  standardHeaders: 'draft-6',
  message: { error: '請求過於頻繁，請稍後再試' }
})
