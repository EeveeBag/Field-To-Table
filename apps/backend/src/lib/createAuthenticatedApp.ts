import { OpenAPIHono, $ } from '@hono/zod-openapi'
import { authMiddleware } from '../middleware/auth.js'
import type { AuthVariables } from '../types/auth.types.js'
import type { LoggerVariables } from '../types/logger.types.js'

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
  // 使用 $() 保持 OpenAPIHono 類型，以支援 RPC 類型推導
  return $(
    new OpenAPIHono<{ Variables: AuthVariables & LoggerVariables }>().use('/*', authMiddleware)
  )
}
