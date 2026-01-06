# FieldToTable API 開發指南

> 本文檔說明如何在 FieldToTable 專案中創建新的 API 端點

---

## 技術棧

- **後端框架**: Hono
- **ORM**: Drizzle ORM
- **資料庫**: PostgreSQL
- **驗證**: Zod
- **API 文檔**: OpenAPI 3.1 + Swagger UI

---

## 專案架構模式

### Schema 組織架構

FieldToTable 採用**分層式 Schema 管理**模式，分為共用層（@repo/shared）和後端層：

```
packages/shared/src/schemas/   # 前後端共用的純驗證 schema
├── common.schema.ts           # 共用類型（分頁等）
├── recipe.schema.ts           # Recipe 輸入驗證
├── menuSet.schema.ts          # MenuSet 輸入驗證
└── favorite.schema.ts         # Favorite 輸入驗證

apps/backend/src/schemas/      # 後端專用（含 OpenAPI metadata）
├── recipe.schema.ts           # Recipe schemas + OpenAPI
├── menuSet.schema.ts          # MenuSet schemas + OpenAPI
├── favorite.schema.ts         # Favorite schemas + OpenAPI
└── common.schema.ts           # Response helpers

apps/backend/src/routes/
├── recipes.openapi.ts         # 只定義 routes，匯入 schemas
├── menu-sets.openapi.ts       # 只定義 routes，匯入 schemas
└── favorites.openapi.ts       # 只定義 routes，匯入 schemas
```

**架構原則**：

1. ✅ **前後端共用驗證規則**: 純 Zod schema 放在 `@repo/shared`
2. ✅ **Schema 與 Route 分離**: 後端 schemas 定義在 `src/schemas/` 目錄
3. ✅ **OpenAPI 文件整合**: 後端 schema 使用 `.openapi({ description, example })` 擴展
4. ✅ **型別推導**: TypeScript 型別從 Zod schemas 自動推導
5. ✅ **共用 Helpers**: 使用 `common.schema.ts` 提供通用的 response 格式

**詳細準則請參考**: [SCHEMA_GUIDELINES.md](./SCHEMA_GUIDELINES.md)

**優點**：

- 📝 Swagger UI 顯示完整的欄位說明
- 🔄 Schema 可被多個 route 重複使用
- 🛡️ 集中管理驗證規則
- 📦 更好的程式碼組織
- 🔗 前後端驗證規則自動同步

---

### 認證模式

**統一認證 Helper**：

```typescript
// src/lib/createAuthenticatedApp.ts
import { OpenAPIHono } from '@hono/zod-openapi'
import { authMiddleware } from '../middleware/auth.js'
import type { AuthVariables } from '../types/auth.types.js'

export function createAuthenticatedApp() {
  const app = new OpenAPIHono<{ Variables: AuthVariables }>()
  app.use('/*', authMiddleware)
  return app
}
```

**使用方式**：

```typescript
// src/routes/recipes.openapi.ts
import { createAuthenticatedApp } from '../lib/createAuthenticatedApp.js'

const app = createAuthenticatedApp()

// User 自動注入到 context
app.openapi(route, async (c) => {
  const user = c.get('user') // ✅ 已驗證的使用者
  // ...
})
```

**型別定義**：

```typescript
// src/types/auth.types.ts
export type AuthUser = {
  id: string
  name: string
  email: string
  // ...
}

export type AuthVariables = {
  user: AuthUser
  session: AuthSession
}
```

---

### 共用 Response Helpers

**檔案位置**：`src/schemas/common.schema.ts`

```typescript
import { z } from 'zod'

// 分頁回應 Helper
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
) =>
  z.object({
    data: z.array(dataSchema),
    pagination: PaginationSchema,
  })

// 單筆資料回應 Helper
export const createDataResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
) =>
  z.object({
    data: dataSchema,
  })
```

**使用範例**：

```typescript
responses: {
  200: {
    description: '成功取得菜譜列表',
    content: {
      'application/json': {
        schema: createPaginatedResponseSchema(recipeResponseSchema),
      },
    },
  },
}
```

---

## API 開發完整流程

### 步驟 1️⃣：定義資料庫 Schema

**檔案位置**：`src/db/schema.ts`

```typescript
import { pgTable, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

// 定義 ENUM 類型（如果需要）
export const recipeTypeEnum = pgEnum('recipe_type', [
  'main',
  'side',
  'soup',
  'dessert',
])

// 定義資料表
export const recipes = pgTable('recipes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()), // 使用 CUID2 自動生成 ID
  name: text('name').notNull(),
  type: recipeTypeEnum('type').notNull(),
  mainIngredient: text('main_ingredient').notNull(),
  subIngredient: text('sub_ingredient'),
  servings: integer('servings').notNull().default(2),
  ingredientsText: text('ingredients_text'),
  steps: text('steps'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})
```

**重點說明**：

- 使用 `CUID2` 生成唯一 ID（安全、不可預測）
- `timestamp` 使用 `{ mode: 'date' }` 返回 JavaScript Date 物件
- 必填欄位使用 `.notNull()`
- 選填欄位可省略 `.notNull()`

---

### 步驟 2️⃣：執行資料庫遷移

**生成遷移檔案**：

```bash
npx drizzle-kit generate --config=./src/drizzle.config.ts
```

**推送到資料庫**：

```bash
npx drizzle-kit push --config=./src/drizzle.config.ts
```

**驗證資料表**（可選）：

```bash
docker exec fieldtotable-postgres psql -U myuser -d my_db -c "\d recipes"
```

---

### 步驟 3️⃣：創建 Schema 檔案

**檔案位置**：`src/schemas/[feature].schema.ts`

#### 3.1 引入依賴

```typescript
import { z } from 'zod'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { recipes } from '../db/schema.js'
```

#### 3.2 定義 Zod Schemas（含 OpenAPI 說明）

```typescript
// 從 Drizzle schema 自動生成基礎 schemas
export const insertRecipeSchema = createInsertSchema(recipes)
export const selectRecipeSchema = createSelectSchema(recipes)

// ==================== OpenAPI Schemas ====================

// Recipe Type Enum
export const RecipeTypeEnum = z.enum(['main', 'side', 'soup', 'dessert'])

// 菜譜回應 Schema（用於 API 回應）
export const recipeResponseSchema = z.object({
  id: z.string().openapi({
    description: '菜譜 ID',
    example: 'clhqx2w0x0000qzrmn2q8h4k2',
  }),
  name: z.string().openapi({
    description: '菜譜名稱',
    example: '紅蘿蔔炒蛋',
  }),
  type: RecipeTypeEnum.openapi({
    description: '菜譜類型：main(主菜), side(副菜), soup(湯), dessert(甜點)',
    example: 'side',
  }),
  mainIngredient: z.string().openapi({
    description: '主食材：豬、牛、雞、羊、蝦、蛋、魚、菜、其他',
    example: '菜',
  }),
  subIngredient: z.string().nullable().openapi({
    description: '次要食材（選填）',
    example: '紅蘿蔔',
  }),
  servings: z.number().int().openapi({
    description: '份數（人份）',
    example: 4,
  }),
  ingredientsText: z.string().nullable().openapi({
    description: '食材清單文字描述（選填）',
    example: '紅蘿蔔 2個\n雞蛋 3個',
  }),
  steps: z.string().nullable().openapi({
    description: '烹飪步驟（選填）',
    example: '1. 紅蘿蔔切絲\n2. 打蛋\n3. 熱鍋炒香',
  }),
  notes: z.string().nullable().openapi({
    description: '備註（選填）',
    example: '可加入蔥花提味',
  }),
  createdAt: z.string().datetime().openapi({
    description: '建立時間（ISO 8601 格式）',
    example: '2025-12-13T12:48:07.060Z',
  }),
  updatedAt: z.string().datetime().openapi({
    description: '最後更新時間（ISO 8601 格式）',
    example: '2025-12-13T12:48:07.060Z',
  }),
})

// 新增菜譜的請求 Schema
export const createRecipeSchema = z.object({
  name: z.string().min(1, '菜名不可為空').max(200, '菜名最多 200 字').openapi({
    description: '菜譜名稱（1-200 字）',
    example: '紅蘿蔔炒蛋',
  }),
  type: RecipeTypeEnum.openapi({
    description: '菜譜類型',
    example: 'side',
  }),
  mainIngredient: z.string().openapi({
    description: '主食材',
    example: '菜',
  }),
  subIngredient: z.string().optional().openapi({
    description: '次要食材（選填）',
    example: '紅蘿蔔',
  }),
  servings: z
    .number()
    .int('人份必須為整數')
    .positive('人份必須大於 0')
    .openapi({
      description: '份數（人份），必須為正整數',
      example: 4,
    }),
  ingredientsText: z
    .string()
    .max(5000, '食材描述最多 5000 字')
    .optional()
    .openapi({
      description: '食材清單文字描述（選填，最多 5000 字）',
      example: '紅蘿蔔 2個\n雞蛋 3個',
    }),
  steps: z.string().max(10000, '烹飪步驟最多 10000 字').optional().openapi({
    description: '烹飪步驟（選填，最多 10000 字）',
    example: '1. 紅蘿蔔切絲',
  }),
  notes: z.string().max(1000, '備註最多 1000 字').optional().openapi({
    description: '備註（選填，最多 1000 字）',
    example: '可加入蔥花提味',
  }),
})

// 更新菜譜的請求 Schema（所有欄位都是 optional）
export const updateRecipeSchema = createRecipeSchema.partial()

// 查詢參數 Schema
export const recipeQuerySchema = z.object({
  search: z.string().optional().openapi({
    description: '搜尋菜名關鍵字（選填）',
    example: '炒蛋',
  }),
  type: RecipeTypeEnum.optional().openapi({
    description: '菜譜類型篩選（選填）',
  }),
  mainIngredient: z.string().optional().openapi({
    description: '主食材篩選（選填）',
    example: '菜',
  }),
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1)
    .pipe(z.number().int().positive())
    .openapi({
      description: '頁碼（預設為 1）',
      example: '1',
    }),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20)
    .pipe(z.number().int().positive().max(100))
    .openapi({
      description: '每頁筆數（預設 20，最大 100）',
      example: '20',
    }),
})

// TypeScript 類型推導
export type Recipe = z.infer<typeof selectRecipeSchema>
export type RecipeResponse = z.infer<typeof recipeResponseSchema>
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>
export type RecipeQuery = z.infer<typeof recipeQuerySchema>
```

**⚠️ 重點說明**：

- ✅ **必須加 description**: 每個欄位都要有 `description`，Swagger UI 才會顯示說明
- ✅ **description + example**: `.openapi({ description: '...', example: '...' })`
- ✅ **使用 z.string().datetime()**: Zod v4 正確語法（不是 `z.iso.datetime()`）
- ✅ **匯出型別**: 使用 `z.infer<>` 推導 TypeScript 型別
- ✅ **z.coerce**: 查詢參數使用 `z.coerce.number()` 自動轉換型別

---

### 步驟 4️⃣：創建 OpenAPI 路由檔案

**檔案位置**：`src/routes/[feature].openapi.ts`

#### 4.1 引入依賴（更新版）

```typescript
import { createRoute, z } from '@hono/zod-openapi'
import { db } from '../db/index.js'
import { recipes } from '../db/schema.js'
import { eq, ilike, and, desc } from 'drizzle-orm'

// 引入認證 helper
import { createAuthenticatedApp } from '../lib/createAuthenticatedApp.js'

// 引入共用 response helpers
import {
  createDataResponseSchema,
  createPaginatedResponseSchema,
} from '../schemas/common.schema.js'

// 引入 feature schemas
import {
  recipeResponseSchema,
  createRecipeSchema,
  updateRecipeSchema,
  recipeQuerySchema,
} from '../schemas/recipe.schema.js'

// 建立需認證的 app
const app = createAuthenticatedApp()
```

#### 4.2 定義 OpenAPI Route（使用匯入的 schemas）

**範例：GET /api/recipes（取得列表）**

```typescript
const listRecipesRoute = createRoute({
  method: 'get',
  path: '/',
  summary: '取得菜譜列表',
  description: '取得所有菜譜，支援搜尋、類型篩選、主食材篩選和分頁',
  tags: ['Recipes'],
  request: {
    query: recipeQuerySchema, // ✅ 使用匯入的 schema
  },
  responses: {
    200: {
      description: '成功取得菜譜列表',
      content: {
        'application/json': {
          schema: createPaginatedResponseSchema(recipeResponseSchema),
          //      ^^^^^^^^^^^^^^^^^^^^^^^^^ ✅ 使用 helper function
        },
      },
    },
  },
})
```

**範例：POST /api/recipes（新增資料）**

```typescript
const createRecipeRoute = createRoute({
  method: 'post',
  path: '/',
  summary: '新增菜譜',
  tags: ['Recipes'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createRecipeSchema, // ✅ 使用匯入的 schema
        },
      },
    },
  },
  responses: {
    201: {
      description: '成功新增菜譜',
      content: {
        'application/json': {
          schema: createDataResponseSchema(recipeResponseSchema),
          //      ^^^^^^^^^^^^^^^^^^^^^^^ ✅ 使用 helper function
        },
      },
    },
    400: {
      description: '驗證失敗',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
})
```

**範例：GET /api/recipes/:id（取得單筆）**

```typescript
const getRecipeRoute = createRoute({
  method: 'get',
  path: '/{id}',
  summary: '取得單一菜譜詳情',
  tags: ['Recipes'],
  request: {
    params: z.object({
      id: z.string().openapi({ example: 'clhqx2w0x0000qzrmn2q8h4k2' }),
    }),
  },
  responses: {
    200: {
      description: '成功取得菜譜',
      content: {
        'application/json': {
          schema: createDataResponseSchema(recipeResponseSchema),
          //      ^^^^^^^^^^^^^^^^^^^^^^^ ✅ 使用 helper function
        },
      },
    },
    404: {
      description: '菜譜不存在',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
})
```

---

### 步驟 5️⃣：實作 Handler

#### 範例：取得列表（含搜尋和分頁）

```typescript
app.openapi(listRecipesRoute, async (c) => {
  const { search, type, mainIngredient, page, limit } = c.req.valid('query')
  const user = c.get('user') // ✅ 從 context 取得已驗證的使用者

  // 建立查詢條件（加入 userId 過濾）
  const conditions = [eq(recipes.userId, user.id)] // ✅ 使用者資料隔離
  if (search) {
    conditions.push(ilike(recipes.name, `%${search}%`))
  }
  if (type) {
    conditions.push(eq(recipes.type, type))
  }
  if (mainIngredient) {
    conditions.push(eq(recipes.mainIngredient, mainIngredient))
  }

  const offset = (page - 1) * limit

  // 查詢資料
  const data = await db
    .select()
    .from(recipes)
    .where(and(...conditions))
    .orderBy(desc(recipes.createdAt))
    .limit(limit)
    .offset(offset)

  // 計算總數
  const total = await db
    .select({ count: recipes.id })
    .from(recipes)
    .where(and(...conditions))

  // 轉換日期為 ISO 字串
  return c.json({
    data: data.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total: total.length,
    },
  })
})
```

#### 範例：新增資料

```typescript
app.openapi(createRecipeRoute, async (c) => {
  const body = c.req.valid('json')
  const user = c.get('user') // ✅ 取得使用者

  const newRecipe = await db
    .insert(recipes)
    .values({
      ...body,
      userId: user.id, // ✅ 自動加入 userId
    })
    .returning()

  return c.json(
    {
      data: {
        ...newRecipe[0],
        createdAt: newRecipe[0].createdAt.toISOString(),
        updatedAt: newRecipe[0].updatedAt.toISOString(),
      },
    },
    201, // ⚠️ 重要：明確指定狀態碼
  )
})
```

#### 範例：取得單筆（含錯誤處理）

```typescript
app.openapi(getRecipeRoute, async (c) => {
  const { id } = c.req.valid('param')
  const user = c.get('user')

  // ✅ 使用 AND 條件確保只能存取自己的資料
  const data = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, id), eq(recipes.userId, user.id)))

  if (data.length === 0) {
    return c.json({ error: 'Recipe not found' }, 404)
  }

  return c.json(
    {
      data: {
        ...data[0],
        createdAt: data[0].createdAt.toISOString(),
        updatedAt: data[0].updatedAt.toISOString(),
      },
    },
    200, // ⚠️ 重要：明確指定狀態碼
  )
})
```

#### 範例：更新資料

```typescript
app.openapi(updateRecipeRoute, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  const user = c.get('user')

  const updatedRecipe = await db
    .update(recipes)
    .set({
      ...body,
      updatedAt: new Date(), // 手動更新時間
    })
    .where(and(eq(recipes.id, id), eq(recipes.userId, user.id))) // ✅ 使用者隔離
    .returning()

  if (updatedRecipe.length === 0) {
    return c.json({ error: 'Recipe not found' }, 404)
  }

  return c.json(
    {
      data: {
        ...updatedRecipe[0],
        createdAt: updatedRecipe[0].createdAt.toISOString(),
        updatedAt: updatedRecipe[0].updatedAt.toISOString(),
      },
    },
    200,
  )
})
```

#### 範例：刪除資料

```typescript
app.openapi(deleteRecipeRoute, async (c) => {
  const { id } = c.req.valid('param')
  const user = c.get('user')

  const deleted = await db
    .delete(recipes)
    .where(and(eq(recipes.id, id), eq(recipes.userId, user.id))) // ✅ 使用者隔離
    .returning()

  if (deleted.length === 0) {
    return c.json({ error: 'Recipe not found' }, 404)
  }

  return c.body(null, 204) // 204 No Content
})
```

**重點說明**：

- ✅ **使用 `c.get('user')`**: 取得已驗證的使用者資訊
- ✅ **使用者資料隔離**: 所有查詢都要加上 `eq(table.userId, user.id)` 條件
- `c.req.valid('query')` 取得已驗證的查詢參數
- `c.req.valid('param')` 取得已驗證的路徑參數
- `c.req.valid('json')` 取得已驗證的請求 body
- **必須明確指定狀態碼**（200, 201, 404 等），否則 TypeScript 會報錯
- Date 物件需要轉成 ISO 字串：`.toISOString()`
- 更新時記得更新 `updatedAt` 欄位

---

### 步驟 6️⃣：匯出路由

在檔案最後：

```typescript
export default app
```

---

### 步驟 7️⃣：在主程式中註冊路由

**檔案位置**：`src/index.ts`

```typescript
import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { config } from 'dotenv'
import recipesRoute from './routes/recipes.openapi.js'

config()

const app = new OpenAPIHono()

// 基本路由
app.get('/', (c) => {
  return c.json({
    message: 'FieldToTable API',
    version: '1.0',
    documentation: '/doc',
  })
})

// 註冊 API 路由
app.route('/api/recipes', recipesRoute)

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
      url: 'http://localhost:8080',
      description: '本地開發環境',
    },
  ],
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
```

---

### 步驟 8️⃣：測試 API

#### 啟動開發服務器

```bash
npm run dev
```

#### 訪問 Swagger UI

打開瀏覽器訪問：**http://localhost:8080/doc**

你可以：

- 查看所有 API 端點
- 查看請求/回應格式
- **直接在網頁上測試 API**（不需要 Postman）

#### 查看 OpenAPI 規格

訪問：**http://localhost:8080/openapi.json**

---

## 常見模式和最佳實踐

### 1. 日期時間處理

**資料庫 Schema**：

```typescript
createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull()
```

**Zod Schema**（使用 Zod v4 語法）：

```typescript
createdAt: z.string().datetime().openapi({
  description: '建立時間（ISO 8601 格式）',
  example: '2025-12-13T12:48:07.060Z',
})
```

**Handler 中轉換**：

```typescript
return c.json({
  data: {
    ...result,
    createdAt: result.createdAt.toISOString(),
  },
})
```

### 2. 查詢條件組合

```typescript
const user = c.get('user') // ✅ 取得使用者資訊
const conditions = [eq(recipes.userId, user.id)] // ✅ 必須：使用者資料隔離

// 動態新增其他條件
if (search) {
  conditions.push(ilike(recipes.name, `%${search}%`))
}
if (type) {
  conditions.push(eq(recipes.type, type))
}

const data = await db
  .select()
  .from(recipes)
  .where(and(...conditions)) // 使用 and() 組合所有條件
```

**重點**：

- ⚠️ **必須先加入 `eq(table.userId, user.id)` 條件**以確保使用者資料隔離
- 使用陣列收集所有條件，再用 `and()` 組合

### 3. 分頁

```typescript
const offset = (page - 1) * limit

const data = await db.select().from(recipes).limit(limit).offset(offset)
```

### 4. 排序

```typescript
import { desc, asc } from 'drizzle-orm';

// 降序
.orderBy(desc(recipes.createdAt))

// 升序
.orderBy(asc(recipes.name))
```

### 5. 錯誤處理

```typescript
if (data.length === 0) {
  return c.json({ error: 'Resource not found' }, 404)
}

// 成功回應必須明確指定狀態碼
return c.json({ data: data[0] }, 200)
```

---

## Drizzle ORM 常用查詢

### 查詢所有

```typescript
const data = await db.select().from(recipes)
```

### 條件查詢

```typescript
import { eq, ne, gt, lt, gte, lte, ilike, like } from 'drizzle-orm';

// 等於
.where(eq(recipes.id, 'xxx'))

// 不等於
.where(ne(recipes.type, 'main'))

// 大於/小於
.where(gt(recipes.servings, 2))
.where(lt(recipes.servings, 10))

// 模糊搜尋（不區分大小寫）
.where(ilike(recipes.name, '%炒蛋%'))

// 模糊搜尋（區分大小寫）
.where(like(recipes.name, '%炒蛋%'))
```

### 多條件組合

```typescript
import { and, or } from 'drizzle-orm';

// AND
.where(and(
  eq(recipes.type, 'main'),
  gt(recipes.servings, 2)
))

// OR
.where(or(
  eq(recipes.type, 'main'),
  eq(recipes.type, 'side')
))
```

### 新增

```typescript
const result = await db
  .insert(recipes)
  .values({
    name: '炒飯',
    type: 'main',
    servings: 2,
  })
  .returning() // 返回新增的資料
```

### 更新

```typescript
const result = await db
  .update(recipes)
  .set({
    name: '蛋炒飯',
    updatedAt: new Date(),
  })
  .where(eq(recipes.id, 'xxx'))
  .returning()
```

### 刪除

```typescript
const result = await db.delete(recipes).where(eq(recipes.id, 'xxx')).returning()
```

---

## 檔案結構

```
Field-To-Table/
├── packages/
│   └── shared/                # 前後端共用模組
│       └── src/
│           ├── schemas/       # 共用 Zod schemas（純驗證）
│           │   ├── common.schema.ts
│           │   ├── recipe.schema.ts
│           │   ├── menuSet.schema.ts
│           │   └── favorite.schema.ts
│           └── index.ts       # 匯出入口
│
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── schema.ts      # 資料庫 Schema 定義（Drizzle）
│   │   │   │   └── index.ts       # 資料庫連接
│   │   │   ├── schemas/           # 後端 Schema（含 OpenAPI metadata）
│   │   │   │   ├── recipe.schema.ts
│   │   │   │   ├── menuSet.schema.ts
│   │   │   │   ├── favorite.schema.ts
│   │   │   │   └── common.schema.ts
│   │   │   ├── routes/
│   │   │   │   ├── recipes.openapi.ts
│   │   │   │   ├── menu-sets.openapi.ts
│   │   │   │   ├── favorites.openapi.ts
│   │   │   │   └── options.openapi.ts
│   │   │   ├── lib/
│   │   │   │   └── auth.ts        # 認證相關工具
│   │   │   ├── index.ts           # 主程式入口
│   │   │   └── drizzle.config.ts  # Drizzle 設定
│   │   ├── drizzle/               # 遷移檔案（自動生成）
│   │   ├── docs/                  # 📚 專案文件
│   │   │   ├── API_REQUIREMENTS.md
│   │   │   ├── API_DEVELOPMENT_GUIDE.md
│   │   │   └── SCHEMA_GUIDELINES.md
│   │   └── package.json
│   │
│   └── frontend/              # React 前端應用
│       └── ...
│
└── pnpm-workspace.yaml        # Monorepo 設定
```

---

## 除錯技巧

### 1. 查看生成的 SQL

```typescript
const query = db.select().from(recipes).toSQL()
console.log(query)
```

### 2. 查看 API 錯誤

服務器會在 console 顯示詳細錯誤訊息，包括：

- 驗證錯誤
- SQL 錯誤
- TypeScript 類型錯誤

### 3. 使用 Swagger UI 測試

在 http://localhost:8080/doc 直接測試 API，可以：

- 查看請求格式
- 查看回應格式
- 即時測試

---

## 常見錯誤與解決方案

### 錯誤 1：TypeScript 返回類型不匹配

```
Property 'error' is missing in type '{ data: ... }' but required in type '{ error: string; }'
```

**解決方案**：明確指定狀態碼

```typescript
// ❌ 錯誤
return c.json({ data: result })

// ✅ 正確
return c.json({ data: result }, 200)
```

### 錯誤 2：日期格式錯誤

**解決方案**：轉換為 ISO 字串

```typescript
createdAt: result.createdAt.toISOString()
```

### 錯誤 3：查詢參數類型錯誤

**解決方案**：使用 `.default().transform(Number)`

```typescript
page: z.string()
  .default('1')
  .transform(Number)
  .pipe(z.number().int().positive())
```

---

## 參考資源

- [Hono 官方文檔](https://hono.dev/)
- [Drizzle ORM 文檔](https://orm.drizzle.team/)
- [Zod 文檔](https://zod.dev/)
- [OpenAPI 規格](https://swagger.io/specification/)
- [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
