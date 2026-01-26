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
  FRONTEND_URL_DEV: z.url().optional(),
  FRONTEND_URL_PROD: z.url().optional(),
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional()
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

/**
 * 是否為非正式環境（development, staging, test）
 * 用於判斷是否啟用較寬鬆的限制或開發工具
 */
export const isDevelopment = env.NODE_ENV !== 'production'

/**
 * 是否為正式環境
 */
export const isProduction = env.NODE_ENV === 'production'
