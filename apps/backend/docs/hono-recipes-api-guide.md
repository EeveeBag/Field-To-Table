# Hono.js Recipes API 完整開發指南

> 這份文檔詳細說明 `src/routes/recipes.openapi.ts` 的功能和 Hono.js 框架的特殊語法

---

## 📋 目錄

1. [整體架構與目的](#整體架構與目的)
2. [重要概念解析](#重要概念解析)
3. [逐段程式碼解析](#逐段程式碼解析)
4. [完整的請求流程圖](#完整的請求流程圖)
5. [關鍵語法總結](#關鍵語法總結)
6. [實用技巧](#實用技巧)

---

## 整體架構與目的

這個檔案建立了一個 **RESTful API 路由模組**，用於管理菜譜（recipes）的 CRUD 操作，並且：

- ✅ 自動生成 OpenAPI/Swagger 文檔
- ✅ 使用 Zod 進行請求/回應驗證
- ✅ 具備完整的 TypeScript 類型安全
- ✅ 整合身份驗證機制

**檔案位置：** `src/routes/recipes.openapi.ts`

---

## 重要概念解析

### 1️⃣ Hono.js 是什麼？

Hono 是一個**超快速、輕量級**的 Web 框架，類似 Express，但：

- 🚀 效能更好（比 Express 快 3-4 倍）
- 📦 支援多種執行環境（Node.js, Cloudflare Workers, Deno 等）
- 🔒 內建 TypeScript 支援

**官方網站：** https://hono.dev/

### 2️⃣ OpenAPI/Swagger 是什麼？

OpenAPI 是 API 文檔的標準格式，可以：

- 📖 自動生成互動式 API 文檔（Swagger UI）
- 🤝 讓前端開發者清楚知道 API 的使用方式
- 🧪 直接在瀏覽器測試 API

**存取位置：** http://localhost:8080/doc

### 3️⃣ Zod 是什麼？

Zod 是一個 TypeScript 優先的驗證函式庫：

- ✅ 自動驗證資料格式
- 🔒 提供完整的類型推導
- 📝 易讀的語法

**官方網站：** https://zod.dev/

---

## 逐段程式碼解析

### 📦 引入依賴（第 1-9 行）

```typescript
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { db } from '../db/index.js'
import { recipes } from '../db/schema.js'
import { eq, ilike, and, desc } from 'drizzle-orm'
import {
  RECIPE_TYPE_DESCRIPTION,
  MAIN_INGREDIENT_DESCRIPTION,
} from '../constants/recipe.js'
import { authMiddleware } from '../middleware/auth.js'
```

**重要模組說明：**

| 模組                         | 說明                                   |
| ---------------------------- | -------------------------------------- |
| `OpenAPIHono`                | Hono 的特殊版本，支援 OpenAPI 文檔生成 |
| `createRoute`                | 建立符合 OpenAPI 規格的路由定義        |
| `z`                          | Zod 驗證函式庫                         |
| `db`                         | Drizzle ORM 資料庫實例                 |
| `eq`, `ilike`, `and`, `desc` | Drizzle 查詢運算符                     |
| `authMiddleware`             | 身份驗證中間件                         |

---

### 🔐 TypeScript 類型定義（第 12-43 行）

```typescript
type Variables = {
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    image: string | null
    createdAt: Date
    updatedAt: Date
  }
  session: {
    session: {
      /* ... */
    }
    user: {
      /* ... */
    }
  }
}
```

**這是什麼？**

這是 Hono 的 **Context Variables** 類型定義。

**為什麼需要？**

在 Hono 中，中間件（middleware）可以在 context（`c`）中儲存資料：

```typescript
// 中間件設定
c.set('user', currentUser)

// 路由處理中取得（有了類型定義，TypeScript 就知道 user 的結構）
const user = c.get('user') // ✅ TypeScript 知道這是什麼類型！
```

**如果沒有這個類型定義：**

```typescript
const user = c.get('user') // ❌ TypeScript: user 是 never 類型
```

---

### 🧩 Zod Schema 定義

#### 1. RecipeTypeEnum（第 46 行）

```typescript
const RecipeTypeEnum = z.enum(['main', 'side', 'soup', 'dessert'])
```

**說明：** 定義菜譜類型的列舉值，只允許這 4 個值。

**驗證範例：**

```typescript
RecipeTypeEnum.parse('main') // ✅ 通過
RecipeTypeEnum.parse('breakfast') // ❌ 錯誤！
```

#### 2. RecipeSchema - 回應格式（第 48-78 行）

```typescript
const RecipeSchema = z.object({
  id: z.string().openapi({ example: 'clhqx2w0x0000qzrmn2q8h4k2' }),
  name: z.string().openapi({ example: '紅蘿蔔炒蛋' }),
  type: RecipeTypeEnum.openapi({
    description: RECIPE_TYPE_DESCRIPTION,
    example: 'side',
  }),
  // ... 其他欄位
})
```

**用途：** 定義 API **回應資料**的格式和驗證規則。

**`.openapi({ example: '...' })` 的作用：**

為 Swagger 文檔加入範例資料，在 Swagger UI 中會顯示這些範例。

**常用 Zod 驗證語法：**

| 語法                         | 說明               |
| ---------------------------- | ------------------ |
| `z.string()`                 | 必須是字串         |
| `z.string().nullable()`      | 可以是字串或 null  |
| `z.string().optional()`      | 可以不提供這個欄位 |
| `z.number().int()`           | 必須是整數         |
| `z.number().positive()`      | 必須是正數         |
| `z.string().min(1).max(200)` | 字串長度限制       |

#### 3. CreateRecipeSchema - 建立時的格式（第 80-98 行）

```typescript
const CreateRecipeSchema = z.object({
  name: z.string().min(1).max(200).openapi({ example: '紅蘿蔔炒蛋' }),
  type: RecipeTypeEnum,
  // ... 其他欄位
})
```

**與 RecipeSchema 的差異：**

- ❌ 沒有 `id`（因為 ID 是資料庫自動生成的）
- ❌ 沒有 `createdAt`, `updatedAt`（自動生成）
- ✅ 有更嚴格的驗證（如 `min(1)`, `max(200)`）

#### 4. UpdateRecipeSchema - 更新時的格式（第 100 行）

```typescript
const UpdateRecipeSchema = CreateRecipeSchema.partial()
```

**`.partial()` 的作用：**

將所有欄位都變成 **optional**（可選的）。

**為什麼需要？**

更新時，使用者可能只想改某幾個欄位：

```json
{
  "name": "新名稱"
}
```

#### 5. RecipeQuerySchema - 查詢參數（第 102-126 行）

```typescript
const RecipeQuerySchema = z.object({
  search: z.string().optional(),
  type: RecipeTypeEnum.optional(),
  mainIngredient: z.string().optional(),
  page: z
    .string()
    .default('1')
    .transform(Number)
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .default('20')
    .transform(Number)
    .pipe(z.number().int().positive().max(100)),
})
```

**複雜的 `page` 欄位解析：**

1. `z.string()` - URL query 參數永遠是字串
2. `.default('1')` - 如果沒提供，預設值是 `'1'`
3. `.transform(Number)` - 將字串轉換成數字
4. `.pipe(z.number().int().positive())` - 驗證轉換後的數字必須是正整數

**實際運作範例：**

```
URL: /api/recipes?page=2

1. 收到字串 "2"
2. 轉換成數字 2
3. 驗證是否為正整數
4. 傳給路由處理函數 ✅
```

---

### 🏗️ 建立 Hono 應用實例（第 128 行）

```typescript
const app = new OpenAPIHono<{ Variables: Variables }>()
```

**泛型 `<{ Variables: Variables }>` 的作用：**

告訴 TypeScript 這個 Hono 應用的 context 會有哪些變數。

**效果：**

```typescript
const user = c.get('user') // ✅ TypeScript 知道 user 的類型
const foo = c.get('foo') // ❌ TypeScript 報錯：'foo' 不在 Variables 中
```

---

### 🛡️ 應用中間件（第 131 行）

```typescript
app.use('/*', authMiddleware)
```

**中間件（Middleware）是什麼？**

在請求到達路由處理函數**之前**執行的程式碼。

**這行的意思：**

- `'/*'`: 對所有路由生效（`*` 是通配符）
- `authMiddleware`: 檢查使用者是否已登入

**執行流程：**

```
請求進來
  ↓
authMiddleware 檢查登入
  ├─ 已登入 → 繼續執行路由處理函數
  └─ 未登入 → 回傳 401 錯誤
```

---

### 🛣️ 路由定義與處理

#### 架構說明

Hono OpenAPI 的路由分成兩個部分：

1. **路由規格定義（createRoute）** - 定義 OpenAPI 文檔
2. **路由處理函數（app.openapi）** - 實際處理請求的邏輯

---

#### 範例：GET /api/recipes（列表查詢）

**第 1 部分：路由規格定義（第 134-160 行）**

```typescript
const listRecipesRoute = createRoute({
  method: 'get',
  path: '/',
  summary: '取得菜譜列表',
  description: '取得所有菜譜，支援搜尋、類型篩選、主食材篩選和分頁',
  tags: ['Recipes'],
  request: {
    query: RecipeQuerySchema, // 定義 query 參數格式
  },
  responses: {
    200: {
      description: '成功取得菜譜列表',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(RecipeSchema),
            pagination: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
            }),
          }),
        },
      },
    },
  },
})
```

**重要屬性說明：**

| 屬性          | 說明                                |
| ------------- | ----------------------------------- |
| `method`      | HTTP 方法（get, post, put, delete） |
| `path`        | 路由路徑                            |
| `summary`     | 簡短描述（顯示在 Swagger）          |
| `description` | 詳細描述                            |
| `tags`        | Swagger 文檔的分類標籤              |
| `request`     | 定義請求格式（query, params, body） |
| `responses`   | 定義回應格式（依 HTTP 狀態碼）      |

**第 2 部分：路由處理函數（第 162-204 行）**

```typescript
app.openapi(listRecipesRoute, async (c) => {
  // 1. 取得並驗證 query 參數
  const { search, type, mainIngredient, page, limit } = c.req.valid('query')

  // 2. 取得當前使用者
  const user = c.get('user')

  // 3. 建立查詢條件
  const conditions = [eq(recipes.userId, user.id)]
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

  // 4. 查詢資料
  const data = await db
    .select()
    .from(recipes)
    .where(and(...conditions))
    .orderBy(desc(recipes.createdAt))
    .limit(limit)
    .offset(offset)

  // 5. 查詢總數
  const total = await db
    .select({ count: recipes.id })
    .from(recipes)
    .where(and(...conditions))

  // 6. 回傳結果
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

---

### 🎯 重要 Hono 語法詳解

#### 1. `c.req.valid()`

**取得並驗證請求資料：**

```typescript
// 取得 query 參數（如 ?search=炒蛋&page=1）
const query = c.req.valid('query')

// 取得 URL 參數（如 /api/recipes/:id）
const { id } = c.req.valid('param')

// 取得 request body（POST/PUT 的 JSON 資料）
const body = c.req.valid('json')
```

**特點：**

- ✅ 自動根據 Schema 驗證
- ✅ 驗證失敗自動回傳 400 錯誤
- ✅ 已完成類型轉換（如字串 → 數字）

#### 2. `c.get()` 和 `c.set()`

**Context 變數的讀寫：**

```typescript
// 中間件設定（authMiddleware）
c.set('user', currentUser)
c.set('session', sessionData)

// 路由處理函數讀取
const user = c.get('user')
const session = c.get('session')
```

#### 3. `c.json()` 和 `c.body()`

**回傳資料：**

```typescript
// 回傳 JSON（最常用）
return c.json({ data: result }, 200)

// 回傳空內容（DELETE 常用）
return c.body(null, 204)

// 回傳文字
return c.text('Hello World')
```

---

### 📊 Drizzle ORM 查詢語法

#### 基本查詢

```typescript
// SELECT * FROM recipes
const data = await db.select().from(recipes)

// SELECT * FROM recipes WHERE id = 'abc'
const data = await db.select().from(recipes).where(eq(recipes.id, 'abc'))
```

#### 常用運算符

```typescript
// WHERE user_id = 'user123'
eq(recipes.userId, 'user123')

// WHERE name ILIKE '%炒蛋%'（不區分大小寫）
ilike(recipes.name, '%炒蛋%')

// WHERE type = 'main' AND user_id = 'user123'
and(eq(recipes.type, 'main'), eq(recipes.userId, 'user123'))

// ORDER BY created_at DESC
orderBy(desc(recipes.createdAt))
  // LIMIT 20 OFFSET 0
  .limit(20)
  .offset(0)
```

#### 展開條件陣列

```typescript
const conditions = [
  eq(recipes.userId, user.id),
  ilike(recipes.name, '%炒蛋%'),
];

// 使用展開運算符
.where(and(...conditions))

// 相當於
.where(and(
  eq(recipes.userId, user.id),
  ilike(recipes.name, '%炒蛋%')
))
```

---

### 🔄 其他 CRUD 操作範例

#### POST - 新增資料（第 305-327 行）

```typescript
app.openapi(createRecipeRoute, async (c) => {
  const body = c.req.valid('json')
  const user = c.get('user')

  const newRecipe = await db
    .insert(recipes)
    .values({
      ...body, // 展開 body 的所有屬性
      userId: user.id, // 加入 userId
    })
    .returning() // 回傳新增的資料

  return c.json({ data: newRecipe[0] }, 201)
})
```

#### PUT - 更新資料（第 371-399 行）

```typescript
app.openapi(updateRecipeRoute, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  const user = c.get('user')

  const updatedRecipe = await db
    .update(recipes)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(recipes.id, id),
        eq(recipes.userId, user.id), // 確保只能更新自己的資料
      ),
    )
    .returning()

  if (updatedRecipe.length === 0) {
    return c.json({ error: 'Recipe not found' }, 404)
  }

  return c.json({ data: updatedRecipe[0] }, 200)
})
```

#### DELETE - 刪除資料（第 429-443 行）

```typescript
app.openapi(deleteRecipeRoute, async (c) => {
  const { id } = c.req.valid('param')
  const user = c.get('user')

  const deleted = await db
    .delete(recipes)
    .where(and(eq(recipes.id, id), eq(recipes.userId, user.id)))
    .returning()

  if (deleted.length === 0) {
    return c.json({ error: 'Recipe not found' }, 404)
  }

  return c.body(null, 204) // 204 No Content
})
```

---

## 完整的請求流程圖

```
┌─────────────────────────────────────────────────────────┐
│  1. 客戶端發送請求                                        │
│     POST /api/recipes                                    │
│     { "name": "炒蛋", "type": "side" }                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  2. authMiddleware 檢查登入                              │
│     - 驗證 session token                                 │
│     - 設定 c.set('user', user)                          │
│     - 如果未登入 → 回傳 401                              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  3. Zod 驗證 request body                                │
│     - 根據 CreateRecipeSchema 驗證                       │
│     - 驗證失敗 → 回傳 400 錯誤                           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  4. 路由處理函數執行                                      │
│     - const user = c.get('user')                        │
│     - 插入資料到資料庫                                    │
│     - 回傳結果                                           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  5. 回傳 JSON 給客戶端                                    │
│     { "data": { "id": "...", "name": "炒蛋", ... } }    │
└─────────────────────────────────────────────────────────┘
```

---

## 關鍵語法總結

### Hono 特殊語法速查表

| 語法                          | 說明                    | 範例                                    |
| ----------------------------- | ----------------------- | --------------------------------------- |
| `c.req.valid('query')`        | 取得並驗證 query 參數   | `const { page } = c.req.valid('query')` |
| `c.req.valid('param')`        | 取得並驗證 URL 參數     | `const { id } = c.req.valid('param')`   |
| `c.req.valid('json')`         | 取得並驗證 request body | `const body = c.req.valid('json')`      |
| `c.get('key')`                | 從 context 取得變數     | `const user = c.get('user')`            |
| `c.set('key', value)`         | 在 context 設定變數     | `c.set('user', userData)`               |
| `c.json(data, status)`        | 回傳 JSON               | `return c.json({ data }, 200)`          |
| `c.body(data, status)`        | 回傳任意內容            | `return c.body(null, 204)`              |
| `c.text(text)`                | 回傳純文字              | `return c.text('Hello')`                |
| `app.use(path, middleware)`   | 應用中間件              | `app.use('/*', authMiddleware)`         |
| `app.openapi(route, handler)` | 註冊 OpenAPI 路由       | `app.openapi(route, handler)`           |

### Zod 驗證語法速查表

| 語法                  | 說明                | 範例                            |
| --------------------- | ------------------- | ------------------------------- |
| `z.string()`          | 字串                | `z.string()`                    |
| `z.number()`          | 數字                | `z.number()`                    |
| `z.boolean()`         | 布林值              | `z.boolean()`                   |
| `z.enum([...])`       | 列舉值              | `z.enum(['a', 'b'])`            |
| `.optional()`         | 可選欄位            | `z.string().optional()`         |
| `.nullable()`         | 可為 null           | `z.string().nullable()`         |
| `.default(value)`     | 預設值              | `z.string().default('hi')`      |
| `.min(n)` / `.max(n)` | 長度/數值限制       | `z.string().min(1).max(100)`    |
| `.int()`              | 整數                | `z.number().int()`              |
| `.positive()`         | 正數                | `z.number().positive()`         |
| `.transform(fn)`      | 轉換值              | `z.string().transform(Number)`  |
| `.pipe(schema)`       | 管道驗證            | `.pipe(z.number())`             |
| `.partial()`          | 所有欄位變 optional | `schema.partial()`              |
| `.openapi({ ... })`   | 加入 OpenAPI 資訊   | `.openapi({ example: 'test' })` |

### Drizzle ORM 語法速查表

| 語法                         | SQL 對應              | 範例                               |
| ---------------------------- | --------------------- | ---------------------------------- |
| `db.select().from(table)`    | `SELECT * FROM table` | `db.select().from(recipes)`        |
| `eq(col, value)`             | `col = value`         | `eq(recipes.id, '123')`            |
| `ilike(col, pattern)`        | `col ILIKE pattern`   | `ilike(recipes.name, '%炒蛋%')`    |
| `and(...conditions)`         | `AND`                 | `and(eq(...), ilike(...))`         |
| `or(...conditions)`          | `OR`                  | `or(eq(...), eq(...))`             |
| `desc(col)`                  | `ORDER BY col DESC`   | `orderBy(desc(recipes.createdAt))` |
| `.limit(n)`                  | `LIMIT n`             | `.limit(20)`                       |
| `.offset(n)`                 | `OFFSET n`            | `.offset(10)`                      |
| `.insert(table).values(...)` | `INSERT INTO`         | `db.insert(recipes).values({...})` |
| `.update(table).set(...)`    | `UPDATE ... SET`      | `db.update(recipes).set({...})`    |
| `.delete(table)`             | `DELETE FROM`         | `db.delete(recipes)`               |
| `.returning()`               | `RETURNING *`         | `.returning()`                     |

---

## 實用技巧

### 💡 如何新增一個路由？

**步驟：**

1. **定義 Schema（如果需要新的資料格式）**
2. **定義路由規格（createRoute）**
3. **實作路由處理函數（app.openapi）**

**範例：新增「複製菜譜」功能**

```typescript
// 1. 定義路由規格
const copyRecipeRoute = createRoute({
  method: 'post',
  path: '/{id}/copy',
  summary: '複製菜譜',
  tags: ['Recipes'],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    201: {
      description: '成功複製',
      content: {
        'application/json': {
          schema: z.object({ data: RecipeSchema }),
        },
      },
    },
    404: {
      description: '菜譜不存在',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
})

// 2. 實作處理函數
app.openapi(copyRecipeRoute, async (c) => {
  const { id } = c.req.valid('param')
  const user = c.get('user')

  // 查詢原始菜譜
  const [original] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, id), eq(recipes.userId, user.id)))

  if (!original) {
    return c.json({ error: 'Recipe not found' }, 404)
  }

  // 複製菜譜
  const [copied] = await db
    .insert(recipes)
    .values({
      ...original,
      id: undefined, // 讓資料庫自動生成新 ID
      name: `${original.name} (副本)`,
    })
    .returning()

  return c.json({ data: copied }, 201)
})
```

### 🔧 常見問題與解決方案

#### Q1: TypeScript 報錯 `c.get('user')` 返回 `never`？

**解決方案：** 確保在 `OpenAPIHono` 初始化時加入 Variables 類型：

```typescript
const app = new OpenAPIHono<{ Variables: Variables }>()
```

#### Q2: 如何處理檔案上傳？

Hono 支援 multipart/form-data：

```typescript
app.post('/upload', async (c) => {
  const body = await c.req.parseBody()
  const file = body['file'] as File
  // 處理檔案...
})
```

#### Q3: 如何加入自訂的錯誤處理？

使用 `app.onError`：

```typescript
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ error: 'Internal Server Error' }, 500)
})
```

#### Q4: 如何實作分頁？

```typescript
const page = 1
const limit = 20
const offset = (page - 1) * limit

const data = await db.select().from(recipes).limit(limit).offset(offset)
```

---

## 相關資源

### 官方文檔

- **Hono:** https://hono.dev/
- **Hono Zod OpenAPI:** https://github.com/honojs/middleware/tree/main/packages/zod-openapi
- **Zod:** https://zod.dev/
- **Drizzle ORM:** https://orm.drizzle.team/

### 本專案相關檔案

- **路由檔案:** `src/routes/recipes.openapi.ts`
- **資料庫 Schema:** `src/db/schema.ts`
- **身份驗證中間件:** `src/middleware/auth.ts`
- **主要入口:** `src/index.ts`

---

## 總結

這個檔案展示了現代 TypeScript API 開發的最佳實踐：

✅ **類型安全** - 完整的 TypeScript 類型檢查
✅ **自動驗證** - Zod Schema 自動驗證請求/回應
✅ **API 文檔** - 自動生成 OpenAPI/Swagger 文檔
✅ **身份驗證** - 整合 Better Auth 認證系統
✅ **資料隔離** - 每個使用者只能存取自己的資料

---

**文檔版本：** 1.0.0
**最後更新：** 2024-12-20
**作者：** FieldToTable 開發團隊
