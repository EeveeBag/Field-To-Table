import { createRoute, z } from '@hono/zod-openapi'
import { OpenAPIHono } from '@hono/zod-openapi'
import { auth } from '../lib/auth.js'

// ===== Schema 定義 =====

const signInBodySchema = z
  .object({
    email: z.email().openapi({ example: 'developer@example.com' }),
    password: z.string().openapi({ example: '********' })
  })
  .openapi('SignInRequest')

const userResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    emailVerified: z.boolean(),
    image: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string()
  })
  .openapi('User')

const sessionResponseSchema = z
  .object({
    id: z.string(),
    expiresAt: z.string()
  })
  .openapi('Session')

const authSuccessResponseSchema = z
  .object({
    user: userResponseSchema,
    token: z.string()
  })
  .openapi('AuthSuccessResponse')

const meResponseSchema = z
  .object({
    authenticated: z.boolean(),
    user: userResponseSchema.nullable(),
    session: sessionResponseSchema.nullable().optional()
  })
  .openapi('MeResponse')

const errorResponseSchema = z
  .object({
    error: z.string(),
    message: z.string().optional()
  })
  .openapi('ErrorResponse')

// ===== 路由定義 =====

// POST /api/auth-test/sign-in - 登入
const signInRoute = createRoute({
  method: 'post',
  path: '/sign-in',
  summary: '開發者登入',
  description: '使用 email 和 password 登入（請向管理員取得測試帳號）',
  tags: ['Authentication'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: signInBodySchema
        }
      }
    }
  },
  responses: {
    200: {
      description: '登入成功',
      content: {
        'application/json': {
          schema: authSuccessResponseSchema
        }
      }
    },
    401: {
      description: '登入失敗（帳號或密碼錯誤）',
      content: {
        'application/json': {
          schema: errorResponseSchema
        }
      }
    }
  }
})

// GET /api/auth-test/me - 取得當前使用者資訊
const meRoute = createRoute({
  method: 'get',
  path: '/me',
  summary: '取得當前登入使用者資訊',
  description: '確認是否已登入，並取得使用者資料',
  tags: ['Authentication'],
  responses: {
    200: {
      description: '已登入，回傳使用者資訊',
      content: {
        'application/json': {
          schema: meResponseSchema
        }
      }
    },
    401: {
      description: '未登入',
      content: {
        'application/json': {
          schema: meResponseSchema
        }
      }
    }
  }
})

// POST /api/auth-test/sign-out - 登出
const signOutRoute = createRoute({
  method: 'post',
  path: '/sign-out',
  summary: '使用者登出',
  description: '清除登入 session',
  tags: ['Authentication'],
  responses: {
    200: {
      description: '登出成功',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string()
          })
        }
      }
    }
  }
})

// 鏈式呼叫以支援 RPC 類型推導
const routes = new OpenAPIHono()
  .openapi(signInRoute, async (c) => {
    const body = c.req.valid('json')

    try {
      // 呼叫 better-auth 原生處理器來正確設置 cookie
      // 使用當前請求的 origin 或 baseURL 來建立內部請求
      const origin = new URL(c.req.url).origin
      const response = await auth.handler(
        new Request(new URL('/api/auth/sign-in/email', origin), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: body.email,
            password: body.password
          })
        })
      )

      const result = await response.json()

      // 將 better-auth 設置的 cookie 轉發到回應
      const setCookieHeader = response.headers.get('set-cookie')
      if (setCookieHeader) {
        c.header('Set-Cookie', setCookieHeader)
      }

      if (!response.ok) {
        return c.json({ error: 'Authentication failed', message: 'Invalid credentials' }, 401)
      }

      return c.json(
        {
          user: {
            ...result.user,
            image: result.user.image ?? null
          },
          token: result.token
        },
        200
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid credentials'
      return c.json({ error: 'Authentication failed', message }, 401)
    }
  })
  .openapi(meRoute, async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers
    })

    if (!session) {
      return c.json({ authenticated: false, user: null }, 401)
    }

    return c.json(
      {
        authenticated: true,
        user: {
          ...session.user,
          image: session.user.image ?? null,
          createdAt:
            session.user.createdAt instanceof Date
              ? session.user.createdAt.toISOString()
              : session.user.createdAt,
          updatedAt:
            session.user.updatedAt instanceof Date
              ? session.user.updatedAt.toISOString()
              : session.user.updatedAt
        },
        session: {
          id: session.session.id,
          expiresAt:
            session.session.expiresAt instanceof Date
              ? session.session.expiresAt.toISOString()
              : session.session.expiresAt
        }
      },
      200
    )
  })
  .openapi(signOutRoute, async (c) => {
    try {
      await auth.api.signOut({
        headers: c.req.raw.headers
      })

      // Better Auth 會自動清除 cookie（包含 __Secure- 前綴）
      // 不需要手動設定 Set-Cookie header

      return c.json({ success: true, message: 'Signed out successfully' })
    } catch {
      return c.json({ success: true, message: 'Signed out' })
    }
  })

export default routes
