import pino from 'pino'
import type { Context } from 'hono'
import { env, isDevelopment } from './env.js'

/**
 * 遮罩 email 地址（正式環境）
 * 例如：user@example.com -> u***@e***.com
 */
export function maskEmail(email: string): string {
  if (isDevelopment) return email

  const [local, domain] = email.split('@')
  if (!domain) return '***'

  const [domainName, ...tld] = domain.split('.')
  const maskedLocal = local.charAt(0) + '***'
  const maskedDomain = domainName.charAt(0) + '***'

  return `${maskedLocal}@${maskedDomain}.${tld.join('.')}`
}

/**
 * 從請求中取得客戶端 IP
 * 優先順序：x-forwarded-for > x-real-ip > 'unknown'
 */
export function getClientIp(c: Context): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || c.req.header('x-real-ip') || 'unknown'
  )
}

export const logger = pino({
  level: isDevelopment ? 'debug' : env.LOG_LEVEL,

  // 非正式環境使用 pino-pretty，正式環境使用 JSON
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    : undefined,

  formatters: {
    level: (label) => ({ level: label.toUpperCase() })
  },

  timestamp: pino.stdTimeFunctions.isoTime
})

export type Logger = typeof logger
