import { createRoute, z } from '@hono/zod-openapi'
import { OpenAPIHono } from '@hono/zod-openapi'
import { auth } from '../lib/auth.js'

const app = new OpenAPIHono()

// ===== Schema 定義 =====

const signInBodySchema = z
  .object({
    email: z.string().email().openapi({ example: 'developer@example.com' }),
    password: z.string().openapi({ example: '********' }),
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
    updatedAt: z.string(),
  })
  .openapi('User')

const sessionResponseSchema = z
  .object({
    id: z.string(),
    expiresAt: z.string(),
  })
  .openapi('Session')

const authSuccessResponseSchema = z
  .object({
    user: userResponseSchema,
    token: z.string(),
  })
  .openapi('AuthSuccessResponse')

const meResponseSchema = z
  .object({
    authenticated: z.boolean(),
    user: userResponseSchema.nullable(),
    session: sessionResponseSchema.nullable().optional(),
  })
  .openapi('MeResponse')

const errorResponseSchema = z
  .object({
    error: z.string(),
    message: z.string().optional(),
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
          schema: signInBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: '登入成功',
      content: {
        'application/json': {
          schema: authSuccessResponseSchema,
        },
      },
    },
    401: {
      description: '登入失敗（帳號或密碼錯誤）',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
})

app.openapi(signInRoute, async (c) => {
  const body = c.req.valid('json')

  try {
    const result = await auth.api.signInEmail({
      body: {
        email: body.email,
        password: body.password,
      },
    })

    // 設置 session cookie
    if (result.token) {
      c.header(
        'Set-Cookie',
        `better-auth.session_token=${
          result.token
        }; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
      )
    }

    return c.json(
      {
        user: {
          ...result.user,
          image: result.user.image ?? null,
          createdAt:
            result.user.createdAt instanceof Date
              ? result.user.createdAt.toISOString()
              : result.user.createdAt,
          updatedAt:
            result.user.updatedAt instanceof Date
              ? result.user.updatedAt.toISOString()
              : result.user.updatedAt,
        },
        token: result.token,
      },
      200,
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Invalid credentials'
    return c.json({ error: 'Authentication failed', message }, 401)
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
          schema: meResponseSchema,
        },
      },
    },
    401: {
      description: '未登入',
      content: {
        'application/json': {
          schema: meResponseSchema,
        },
      },
    },
  },
})

app.openapi(meRoute, async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
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
            : session.user.updatedAt,
      },
      session: {
        id: session.session.id,
        expiresAt:
          session.session.expiresAt instanceof Date
            ? session.session.expiresAt.toISOString()
            : session.session.expiresAt,
      },
    },
    200,
  )
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
            message: z.string(),
          }),
        },
      },
    },
  },
})

app.openapi(signOutRoute, async (c) => {
  try {
    await auth.api.signOut({
      headers: c.req.raw.headers,
    })

    // 清除 cookie
    c.header(
      'Set-Cookie',
      'better-auth.session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    )

    return c.json({ success: true, message: 'Signed out successfully' })
  } catch {
    // 即使出錯也清除 cookie
    c.header(
      'Set-Cookie',
      'better-auth.session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    )
    return c.json({ success: true, message: 'Signed out' })
  }
})

export default app
