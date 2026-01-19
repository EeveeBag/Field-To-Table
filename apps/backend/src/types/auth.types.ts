/**
 * 認證相關的共用類型定義
 */

export type AuthUser = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export type AuthSession = {
  session: {
    id: string
    expiresAt: Date
    token: string
    createdAt: Date
    updatedAt: Date
    ipAddress: string | null
    userAgent: string | null
    userId: string
  }
  user: AuthUser
}

/**
 * Hono Context Variables - 用於所有需要認證的路由
 */
export type AuthVariables = {
  user: AuthUser
  session: AuthSession
}

import type { LoggerVariables } from './logger.types.js'

/**
 * 合併所有 Context Variables（認證 + 日誌）
 *
 * 這個類型將 `AuthVariables` 和 `LoggerVariables` 合併成一個統一的類型，
 * 適用於需要同時存取認證資訊和日誌功能的路由。
 *
 * @remarks
 * 包含以下屬性：
 * - `user` - 當前登入的使用者資訊
 * - `session` - Better Auth session 資訊
 * - `logger` - Pino logger 實例（含 requestId 上下文）
 * - `requestId` - 唯一的請求追蹤 ID
 *
 * @example
 * 使用在需要認證且需要日誌記錄的路由：
 * ```typescript
 * const app = new OpenAPIHono<{ Variables: AllVariables }>()
 *
 * app.get('/protected-route', async (c) => {
 *   const user = c.get('user')           // 來自 AuthVariables
 *   const logger = c.get('logger')       // 來自 LoggerVariables
 *   const requestId = c.get('requestId') // 來自 LoggerVariables
 *
 *   logger.info({ userId: user.id }, 'User performing action')
 *   // ...
 * })
 * ```
 *
 * @see {@link AuthVariables} - 認證相關的 Context Variables
 * @see {@link LoggerVariables} - 日誌相關的 Context Variables
 *
 * @remarks
 * 注意：目前專案中使用 `AuthVariables & LoggerVariables` 的直接寫法，
 * 此類型是為了代碼重用和未來擴展而保留。如果未來需要添加更多 Variables
 * （如 database、cache 等），可以統一在這裡合併。
 */
export type AllVariables = AuthVariables & LoggerVariables
