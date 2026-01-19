import { createMiddleware } from 'hono/factory'
import { createId } from '@paralleldrive/cuid2'
import { logger as baseLogger } from '../lib/logger.js'

export const loggerMiddleware = createMiddleware(async (c, next) => {
  // 生成或讀取 Request ID
  const requestId = c.req.header('X-Request-ID') || createId()
  const startTime = Date.now()

  // 創建帶有請求上下文的 child logger
  const logger = baseLogger.child({ requestId })

  c.set('logger', logger)
  c.set('requestId', requestId)

  // 先設置 Response header（確保無論後續發生什麼都會有 requestId）
  c.header('X-Request-ID', requestId)

  logger.info(
    {
      method: c.req.method,
      path: c.req.path,
      userAgent: c.req.header('user-agent')
    },
    'Incoming request'
  )

  await next()

  // 記錄請求結束
  const duration = Date.now() - startTime
  const status = c.res.status

  const logLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
  logger[logLevel](
    {
      method: c.req.method,
      path: c.req.path,
      status,
      duration: `${duration}ms`
    },
    'Request completed'
  )
})
