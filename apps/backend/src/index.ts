import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { cors } from 'hono/cors'
import { config } from 'dotenv'
import recipesRoute from './routes/recipes.openapi.js'
import menuSetsRoute from './routes/menu-sets.openapi.js'
import favoritesRoute from './routes/favorites.openapi.js'
import authRoute from './routes/auth.openapi.js'
import optionsRoute from './routes/options.openapi.js'
import { auth } from './lib/auth.js'

// 載入環境變數
config()

const app = new OpenAPIHono({
  strict: false, // Better Auth 需要
})

// CORS 設定
app.use(
  '/*',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
)

// Better Auth 處理所有驗證請求
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

// 基本路由
app.get('/', (c) => {
  return c.json({
    message: 'FieldToTable API',
    version: '1.0',
    documentation: '/doc',
  })
})

// API 路由
app.route('/api/auth-test', authRoute)
app.route('/api/recipes', recipesRoute)
app.route('/api/menu-sets', menuSetsRoute)
app.route('/api/favorites', favoritesRoute)
app.route('/api/options', optionsRoute)

// OpenAPI 規格文件
app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'FieldToTable API',
    version: '1.0.0',
    description: '菜單規劃系統 API 文件',
  },
  servers: [
    {
      url: process.env.BETTER_AUTH_URL || 'http://localhost:8080',
      description:
        process.env.NODE_ENV === 'production' ? '正式環境' : '本地開發環境',
    },
  ],
  security: [{ cookieAuth: [] }],
})

// 註冊 Security Scheme
app.openAPIRegistry.registerComponent('securitySchemes', 'cookieAuth', {
  type: 'apiKey',
  in: 'cookie',
  name: 'better-auth.session_token',
  description: '登入後取得的 session token cookie',
})

// Swagger UI
app.get('/doc', swaggerUI({ url: '/openapi.json' }))

// 啟動伺服器
const port = Number(process.env.PORT) || 8080

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`🚀 Server is running on http://localhost:${info.port}`)
    console.log(`📚 API Documentation: http://localhost:${info.port}/doc`)
    console.log(`📄 OpenAPI Spec: http://localhost:${info.port}/openapi.json`)
  },
)
