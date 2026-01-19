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
