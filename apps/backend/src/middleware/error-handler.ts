import { createMiddleware } from 'hono/factory'
import { logger as baseLogger } from '../lib/logger.js'

export const errorHandler = createMiddleware(async (c, next) => {
  try {
    await next()
  } catch (err) {
    const logger = c.get('logger') ?? baseLogger
    const isDevelopment = process.env.NODE_ENV !== 'production'

    // 記錄錯誤（包括錯誤發生的完整路徑）
    logger.error(
      {
        error: {
          message: err instanceof Error ? err.message : String(err),
          stack: isDevelopment && err instanceof Error ? err.stack : undefined,
          name: err instanceof Error ? err.name : 'Error'
        }
      },
      'Request failed with error'
    )

    // 回傳錯誤響應
    return c.json(
      {
        error: isDevelopment && err instanceof Error ? err.message : 'Internal Server Error',
        requestId: c.get('requestId')
      },
      500
    )
  }
})
