# Hono.js Recipes API 開發解析（最新版）

> 對應程式碼：`apps/backend/src/routes/recipes.openapi.ts`
> 最後更新：2026-03-03
> 文件定位：教學解析文件（非規格真相來源）

---

## 1. 文件定位

這份文件專注於 `recipes.openapi.ts` 的實作邏輯與 Hono + Zod OpenAPI 寫法。

- API 規格（endpoint/request/response）請看：`apps/backend/docs/spec/recipes.md`
- API 全域開發規範請看：`apps/backend/docs/API_DEVELOPMENT_GUIDE.md`

---

## 2. 目前架構總覽

`recipes.openapi.ts` 採用三層結構：

1. Route 定義層：`createRoute(...)` 宣告 OpenAPI 規格
2. Handler 實作層：`app.openapi(route, async (c) => { ... })`
3. 認證與型別層：`createAuthenticatedApp()` 注入 `authMiddleware` 與 context 型別

目前不是直接 `new OpenAPIHono().use(authMiddleware)`，而是統一用 `createAuthenticatedApp()`。

---

## 3. 主要依賴與角色

```ts
import { createRoute, z } from '@hono/zod-openapi'
import { eq, ilike, and, desc, count } from 'drizzle-orm'
import { db } from '../db/index.js'
import { recipes } from '../db/schema/index.js'
import { createAuthenticatedApp } from '../lib/createAuthenticatedApp.js'
import {
  createDataResponseSchema,
  createPaginatedResponseSchema,
  createErrorResponse
} from '../schemas/common.schema.js'
import { formatDates, formatDatesArray, omit } from '../utils/transform.js'
import {
  recipeResponseSchema,
  createRecipeSchema,
  updateRecipeSchema,
  recipeQuerySchema
} from '../schemas/recipe.schema.js'
```

重點：

- `createAuthenticatedApp()`：建立已套用認證中間件的 app
- `createDataResponseSchema` / `createPaginatedResponseSchema`：統一回應格式
- `formatDates*` + `omit`：統一時間字串化並移除 `userId`
- `count()`：列表總數查詢

---

## 4. Schema 與 enum 現況

### 4.1 RecipeType（已擴充）

目前值域：

- `main`
- `side`
- `soup`
- `dessert`
- `drink`
- `other`

### 4.2 MainIngredient（已擴充）

目前值域：

- `pork`
- `beef`
- `chicken`
- `lamb`
- `seafood`
- `egg`
- `vegetable`
- `tofu`
- `mushroom`
- `fruit`
- `dairy`
- `flour`
- `tea`
- `other`

### 4.3 重要欄位變更

- `subIngredient/sub_ingredient` 已移除，不應再出現在 request/response 範例。

---

## 5. Route 定義模式

每個 endpoint 都拆成：

1. `const xxxRoute = createRoute({...})`
2. `app.openapi(xxxRoute, async (c) => {...})`

範例（列表 route）：

```ts
const listRecipesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Recipes'],
  request: {
    query: recipeQuerySchema
  },
  responses: {
    200: {
      description: '成功取得菜譜列表',
      content: {
        'application/json': {
          schema: createPaginatedResponseSchema(recipeResponseSchema)
        }
      }
    }
  }
})
```

重點：

- Query/Body/Params 一律直接掛 schema，不手寫重複物件
- 回應 schema 優先重用 common helpers
- 錯誤回應用 `createErrorResponse(...)`

---

## 6. Handler 實作流程

目前 `recipes.openapi.ts` 以鏈式寫法註冊：

```ts
const routes = createAuthenticatedApp()
  .openapi(listRecipesRoute, async (c) => { ... })
  .openapi(createRecipeRoute, async (c) => { ... })
  .openapi(getRecipeRoute, async (c) => { ... })
  .openapi(updateRecipeRoute, async (c) => { ... })
  .openapi(deleteRecipeRoute, async (c) => { ... })
```

### 6.1 GET `/api/recipes`

流程：

1. `c.req.valid('query')` 取出 `search/type/mainIngredient/page/limit`
2. `c.get('user')` 取得登入使用者
3. 建立 `conditions`，第一個條件必須是 `eq(recipes.userId, user.id)`
4. 查詢列表（`orderBy(desc(createdAt)) + limit + offset`）
5. 用 `count()` 查總數
6. `formatDatesArray(data)` + `omit(r, 'userId')`
7. 回傳 `{ data, pagination }`

### 6.2 POST `/api/recipes`

流程：

1. `c.req.valid('json')` 驗證 body
2. 追加 `userId: user.id`
3. `insert(...).returning()`
4. 回傳 `201` + `omit(formatDates(row), 'userId')`

### 6.3 GET `/api/recipes/{id}`

流程：

1. `c.req.valid('param')` 取 `id`
2. 查詢條件必須包含：
   - `eq(recipes.id, id)`
   - `eq(recipes.userId, user.id)`
3. 找不到回 `404`
4. 找到回 `200` + `omit(formatDates(row), 'userId')`

### 6.4 PUT `/api/recipes/{id}`

流程：

1. 驗證 `params + body`
2. `update(...).set({ ...body, updatedAt: new Date() })`
3. 同樣做 user 隔離條件
4. 找不到回 `404`
5. 成功回 `200`

### 6.5 DELETE `/api/recipes/{id}`

流程：

1. 驗證 `params`
2. `delete(...).where(and(eq(id), eq(userId)))`
3. 找不到回 `404`
4. 成功回 `204`（`c.body(null, 204)`）

---

## 7. 請求生命週期（簡化）

```text
Request
  -> authMiddleware（由 createAuthenticatedApp 套用）
  -> Zod 驗證（c.req.valid）
  -> Handler 業務邏輯（Drizzle 查詢）
  -> 日期格式化 + 敏感欄位移除
  -> JSON Response
```

---

## 8. 常用語法速查

### 8.1 Hono

```ts
const query = c.req.valid('query')
const params = c.req.valid('param')
const body = c.req.valid('json')
const user = c.get('user')
return c.json({ data }, 200)
return c.body(null, 204)
```

### 8.2 Drizzle

```ts
where(and(eq(recipes.userId, user.id), ilike(recipes.name, `%${search}%`)))
orderBy(desc(recipes.createdAt))
limit(limit).offset(offset)
select({ count: count() })
```

### 8.3 Zod/OpenAPI

```ts
createRoute({ request: { query: recipeQuerySchema } })
createDataResponseSchema(recipeResponseSchema)
createPaginatedResponseSchema(recipeResponseSchema)
createErrorResponse('菜譜不存在')
```

---

## 9. 常見錯誤與修正

### 錯誤 1：忘記 user 隔離

現象：可讀到其他使用者資料。  
修正：所有查詢一律帶 `eq(recipes.userId, user.id)`。

### 錯誤 2：回應含內部欄位

現象：回傳 `userId` 給前端。  
修正：使用 `omit(..., 'userId')`。

### 錯誤 3：Date 直接回傳

現象：型別或序列化不一致。  
修正：使用 `formatDates` / `formatDatesArray`。

### 錯誤 4：規格與實作不同步

現象：Swagger / spec 與實際回應不一致。  
修正：程式碼變更後，立即同步 `docs/spec/recipes.md`。

---

## 10. 變更檢查清單（Recipes）

- 是否仍使用 `createAuthenticatedApp()`？
- 是否保留 `query/body/params` 的 `c.req.valid(...)`？
- 是否每支查詢都有 user 隔離條件？
- 是否回應已移除 `userId`？
- 是否新增/修改欄位後已同步 `docs/spec/recipes.md`？

---

## 11. 參考文件

- `apps/backend/src/routes/recipes.openapi.ts`
- `apps/backend/src/schemas/recipe.schema.ts`
- `packages/shared/src/schemas/recipe.schema.ts`
- `apps/backend/docs/spec/recipes.md`
- `apps/backend/docs/API_DEVELOPMENT_GUIDE.md`
