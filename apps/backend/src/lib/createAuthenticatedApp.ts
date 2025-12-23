import { OpenAPIHono } from '@hono/zod-openapi'
import { authMiddleware } from '../middleware/auth.js'
import type { AuthVariables } from '../types/auth.types.js'

/**
 * 建立需要認證的 OpenAPIHono 實例
 * 自動套用 authMiddleware 到所有路由
 *
 * @example
 * ```ts
 * const app = createAuthenticatedApp();
 *
 * app.openapi(someRoute, async (c) => {
 *   const user = c.get('user'); // TypeScript 自動推斷類型
 *   // ...
 * });
 * ```
 */
export function createAuthenticatedApp() {
  const app = new OpenAPIHono<{ Variables: AuthVariables }>()

  // 應用身份驗證中間件到所有路由
  app.use('/*', authMiddleware)

  return app
}
