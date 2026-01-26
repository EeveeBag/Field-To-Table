# Backend 架構改進待辦清單

> 生成日期：2026-01-23
> 整體評分：7.5/10

---

## 目錄

- [高優先級 - 安全性修復](#高優先級---安全性修復)
- [中優先級 - 性能優化](#中優先級---性能優化)
- [低優先級 - 代碼品質](#低優先級---代碼品質)
- [架構亮點](#架構亮點)

---

## 高優先級 - 安全性修復

### 1. 添加 API 速率限制

**問題**：認證端點完全開放，容易被暴力破解或 DoS 攻擊

**影響檔案**：
- `src/middleware/rate-limiter.ts`（新增）
- `src/index.ts`

**實施步驟**：
1. 創建 `src/middleware/rate-limiter.ts`
2. 實現基於 IP 的速率限制（內存存儲，生產環境可改用 Redis）
3. 認證端點：15 分鐘內最多 10 次
4. 一般 API：1 分鐘內最多 100 次
5. 在 `index.ts` 中應用中間件

**參考代碼**：
```typescript
// src/middleware/rate-limiter.ts
interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function createRateLimiter(config: RateLimitConfig, prefix = 'global') {
  return createMiddleware(async (c, next) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0] || 'unknown'
    const key = `${prefix}:${ip}`
    // ... 實現速率限制邏輯
  })
}

export const authRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 10 }, 'auth')
export const apiRateLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 100 }, 'api')
```

```typescript
// src/index.ts 中應用
app.use('/api/auth/*', authRateLimiter)
app.use('/api/*', apiRateLimiter)
```

---

### 2. 補充字段長度驗證

**問題**：`mainIngredient`、`subIngredient` 無最大長度限制，可能導致 DoS

**影響檔案**：
- `packages/shared/src/schemas/recipe.schema.ts`

**實施步驟**：
1. 為 `mainIngredient` 添加 `.max(100)` 限制
2. 為 `subIngredient` 添加 `.max(200)` 限制

**修改內容**：
```typescript
// packages/shared/src/schemas/recipe.schema.ts
export const createRecipeSchema = z.object({
  name: z.string().min(1, '菜名不可為空').max(200, '菜名最多 200 字'),
  type: RecipeTypeEnum,
  mainIngredient: z.string()
    .min(1, '主要食材不可為空')
    .max(100, '主要食材最多 100 字'),  // 新增
  subIngredient: z.string()
    .max(200, '次要食材最多 200 字')    // 新增
    .optional(),
  servings: z.number().int('人份必須為整數').positive('人份必須大於 0'),
  ingredientsText: z.string().max(5000, '食材描述最多 5000 字').optional(),
  steps: z.string().max(10000, '烹飪步驟最多 10000 字').optional(),
  notes: z.string().max(1000, '備註最多 1000 字').optional(),
})
```

---

### 3. 強化密碼策略

**問題**：無密碼最小長度/複雜度要求

**影響檔案**：
- `src/lib/auth.ts`

**實施步驟**：
1. 在 Better Auth 配置中添加密碼驗證規則

**修改內容**：
```typescript
// src/lib/auth.ts
export const auth = betterAuth({
  // ... 其他配置
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,  // 新增：最小 8 字元
    // 如果需要更複雜的驗證，可以使用 password 選項
  },
  // ...
})
```

---

### 4. ✅ 添加環境變數驗證（已完成）

**問題**：啟動時未驗證必需環境變數，可能導致運行時錯誤

**影響檔案**：
- `src/lib/env.ts`（新增）


**已於 2026-01-26 使用 Zod 實現**

**實現代碼**：
```typescript
// src/lib/env.ts
import { config } from 'dotenv'
import { z } from 'zod'

// 載入 .env 檔案（必須在驗證之前）
config()

const envSchema = z.object({
  // 必需變數
  DATABASE_URL: z.string().min(1, 'DATABASE_URL 不可為空'),
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET 至少需要 32 個字元'),
  BETTER_AUTH_URL: z.url('BETTER_AUTH_URL 必須是有效的 URL'),

  // 可選變數（帶預設值）
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  API_BASE_URL: z.url().optional(),

  // 可選變數（無預設值）
  FRONTEND_URL_DEV: z.url().optional(),
  FRONTEND_URL_PROD: z.url().optional(),
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional()
})

// 解析並驗證
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ 環境變數驗證失敗：')
  console.error(z.flattenError(parsed.error).fieldErrors)
  process.exit(1)
}

export const env = parsed.data

export type Env = z.infer<typeof envSchema>

```

**Zod 方案優勢**：
- 自動型別推導，無需手動定義型別
- 結構化錯誤訊息
- 內建預設值處理 (`.default()`)
- 自動型別轉換 (`z.coerce.number()`)
- 與專案其他 schema 驗證風格一致

---

## 中優先級 - 性能優化

### 5. ✅ 修復 MenuSets N+1 查詢（已完成）

**問題**：獲取 N 個菜單組需要 N+1 個查詢

**影響檔案**：
- `src/routes/menu-sets.openapi.ts`

**問題代碼位置**：第 236-289 行

**已於 2026-01-23 修復**

**現有問題代碼**：
```typescript
// 問題：為每個菜單組執行一次查詢
const data = await Promise.all(
  menuSetsList.map(async (menuSet) => {
    const dishesResult = await db
      .select(...)
      .from(menuSetDishes)
      .where(eq(menuSetDishes.menuSetId, menuSet.id))
    // ...
  })
)
```

**建議修改**：
```typescript
// 方案 1：批量查詢所有 dishes
const menuSetIds = menuSetsList.map(m => m.id)

const allDishes = await db
  .select({
    menuSetId: menuSetDishes.menuSetId,
    recipeId: menuSetDishes.recipeId,
    multiplier: menuSetDishes.multiplier,
    type: recipes.type
  })
  .from(menuSetDishes)
  .leftJoin(recipes, eq(menuSetDishes.recipeId, recipes.id))
  .where(inArray(menuSetDishes.menuSetId, menuSetIds))

// 在 JavaScript 中分組
const dishesByMenuSetId = allDishes.reduce((acc, dish) => {
  if (!acc[dish.menuSetId]) acc[dish.menuSetId] = []
  acc[dish.menuSetId].push(dish)
  return acc
}, {} as Record<string, typeof allDishes>)

// 組裝結果
const data = menuSetsList.map(menuSet => ({
  ...menuSet,
  dishes: dishesByMenuSetId[menuSet.id] || []
}))
```

---

### 6. 添加資料庫複合索引

**問題**：列表查詢缺少優化索引

**影響檔案**：
- `src/db/schema/recipe.schema.ts`
- `src/db/schema/menu.schema.ts`

**實施步驟**：
1. 添加複合索引定義
2. 執行 `pnpm db:generate` 生成遷移
3. 執行 `pnpm db:migrate` 應用遷移

**修改內容**：
```typescript
// src/db/schema/recipe.schema.ts
import { index } from 'drizzle-orm/pg-core'

export const recipes = pgTable('recipes', {
  // ... 現有欄位
}, (table) => [
  index('idx_recipes_user_created').on(table.userId, table.createdAt),
])

// src/db/schema/menu.schema.ts
export const menuSets = pgTable('menu_sets', {
  // ... 現有欄位
}, (table) => [
  index('idx_menu_sets_user_created').on(table.userId, table.createdAt),
])
```

---

### 7. 優化資料庫連接池配置

**問題**：未配置連接池參數，可能導致連接洩露

**影響檔案**：
- `src/db/index.ts`

**修改內容**：
```typescript
// src/db/index.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                      // 最大連接數
  idleTimeoutMillis: 30000,     // 30 秒空閒超時
  connectionTimeoutMillis: 5000, // 5 秒連接超時
})

// 可選：監控連接池狀態
pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected error on idle client')
})
```

---

## 低優先級 - 代碼品質

### 8. 重構重複代碼

**問題**：
- `.toISOString()` 日期轉換出現 19 次
- 分頁邏輯重複 4 次

**影響檔案**：
- `src/lib/utils.ts`（新增）
- 各路由檔案

**參考代碼**：
```typescript
// src/lib/utils.ts

/**
 * 將對象中的所有 Date 轉換為 ISO 字符串
 */
export function serializeDates<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj }
  for (const key in result) {
    if (result[key] instanceof Date) {
      (result as Record<string, unknown>)[key] = (result[key] as Date).toISOString()
    }
  }
  return result
}

/**
 * 計算分頁參數
 */
export function getPaginationParams(page: number, limit: number) {
  return {
    offset: (page - 1) * limit,
    limit
  }
}

/**
 * 創建分頁響應
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}
```

---

### 9. 添加請求體大小限制

**問題**：無請求體大小限制，大型 payload 可導致記憶體耗盡

**影響檔案**：
- `src/index.ts`

**實施步驟**：
```typescript
// src/index.ts
import { bodyLimit } from 'hono/body-limit'

// 限制請求體大小為 1MB
app.use('/*', bodyLimit({
  maxSize: 1024 * 1024, // 1MB
  onError: (c) => {
    return c.json({ error: 'Request body too large' }, 413)
  }
}))
```

---

### 10. 其他改進項目

| 項目 | 說明 | 優先級 |
|------|------|--------|
| 創建 Service Layer | 分離業務邏輯與路由，提高可測試性 | 低 |
| OAuth Token 加密 | 使用應用級加密存儲 OAuth tokens | 低 |
| 添加測試覆蓋 | 配置 Vitest，添加單元/整合測試 | 低 |
| Email 驗證流程 | 強制驗證 email 後才能登入 | 中 |
| Session 過期時間 | 從 7 天縮短至 24 小時 | 中 |
| 移除未使用代碼 | `optionalAuthMiddleware` 未使用 | 低 |

---

## 架構亮點

目前架構已有的優點：

- ✅ 清晰的目錄結構（模塊化設計）
- ✅ TypeScript 嚴格模式 + Zod 驗證
- ✅ OpenAPI/Swagger 自動文檔
- ✅ Pino 日誌 + 請求追蹤 + Email 遮罩
- ✅ 優雅關閉處理（SIGTERM/SIGINT）
- ✅ Better Auth 認證 + Google OAuth
- ✅ CORS 白名單機制
- ✅ CASCADE 刪除保證資料完整性
- ✅ Drizzle ORM 防止 SQL 注入

---

## 實施順序建議

```
第 1 週 - 安全性（必須）：
├── [1] 添加 API 速率限制
├── [2] 補充字段長度驗證
├── [3] 強化密碼策略
└── [4] ✅ 添加環境變數驗證（已完成）

第 2 週 - 性能（建議）：
├── [5] ✅ 修復 MenuSets N+1 查詢（已完成）
├── [6] 添加複合索引
└── [7] 優化連接池配置

後續 - 品質（可選）：
├── [8] 重構重複代碼
├── [9] 添加請求體大小限制
└── [10] 其他改進項目
```
