import { createMiddleware } from 'hono/factory'
import { auth } from '../lib/auth.js'

export const authMiddleware = createMiddleware(async (c, next) => {
  const logger = c.get('logger')

  // 從 Better Auth 獲取 session
  const session = await auth.api.getSession({
    headers: c.req.raw.headers
  })

  if (!session) {
    logger.warn({ path: c.req.path }, 'Unauthorized access attempt')
    return c.json({ error: 'Unauthorized' }, 401)
  }

  logger.debug({ userId: session.user.id }, 'User authenticated')

  // 將 session 和 user 資訊附加到 context
  c.set('session', session)
  c.set('user', session.user)

  await next()
})

// Optional middleware - 不強制要求登入，但如果有 session 就附加到 context
export const optionalAuthMiddleware = createMiddleware(async (c, next) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers
    })

    if (session) {
      c.set('session', session)
      c.set('user', session.user)
    }
  } catch {
    // 忽略錯誤，繼續處理請求
  }

  await next()
})
