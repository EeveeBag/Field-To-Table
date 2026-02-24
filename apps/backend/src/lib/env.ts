import { config } from 'dotenv'
import { z } from 'zod'

// 載入 .env 檔案（必須在驗證之前）
config()

const envSchema = z.object({
  // 必需變數
  DATABASE_URL: z.string().min(1, 'DATABASE_URL 不可為空'),
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET 至少需要 32 個字元'),
  BETTER_AUTH_URL: z.url('BETTER_AUTH_URL 必須是有效的 URL'),

  // 可選變數（帶預設值）
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  API_BASE_URL: z.url().optional(),

  // 可選變數（無預設值）
  FRONTEND_URL: z.url().optional(),
  FRONTEND_URL_DEV: z.url().optional(),
  FRONTEND_URL_PROD: z.url().optional(),
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional()
}).superRefine((data, ctx) => {
  const hasFrontendUrl = Boolean(data.FRONTEND_URL || data.FRONTEND_URL_DEV || data.FRONTEND_URL_PROD)

  if (!hasFrontendUrl) {
    ctx.addIssue({
      code: 'custom',
      path: ['FRONTEND_URL'],
      message: '至少需要設定 FRONTEND_URL 或 FRONTEND_URL_DEV / FRONTEND_URL_PROD 其中之一'
    })
  }

  const hasGoogleClientId = Boolean(data.GOOGLE_OAUTH_CLIENT_ID)
  const hasGoogleClientSecret = Boolean(data.GOOGLE_OAUTH_CLIENT_SECRET)

  if (hasGoogleClientId !== hasGoogleClientSecret) {
    ctx.addIssue({
      code: 'custom',
      path: ['GOOGLE_OAUTH_CLIENT_ID'],
      message: 'GOOGLE_OAUTH_CLIENT_ID 與 GOOGLE_OAUTH_CLIENT_SECRET 需要同時設定或同時留空'
    })
  }
})

// 解析並驗證
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ 環境變數驗證失敗：')
  console.error(z.flattenError(parsed.error).fieldErrors)
  process.exit(1)
}

export const env = parsed.data

export type Env = z.infer<typeof envSchema>

export const FRONTEND_URLS = [
  env.FRONTEND_URL_DEV,
  env.FRONTEND_URL_PROD,
  env.FRONTEND_URL
].filter((origin): origin is string => Boolean(origin))

// ==================== 環境判斷 ====================

/**
 * 是否為本地開發環境（僅 development）
 * 用途：pino-pretty 格式化日誌、本地除錯工具
 */
export const isLocalDev = env.NODE_ENV === 'development'

/**
 * 是否為非正式環境（development, staging, test）
 * 用途：寬鬆的速率限制、跳過 email 遮罩
 */
export const isDevelopment = env.NODE_ENV !== 'production'

/**
 * 是否為正式環境（僅 production）
 * 用途：嚴格的安全限制、JSON 格式日誌
 */
export const isProduction = env.NODE_ENV === 'production'
