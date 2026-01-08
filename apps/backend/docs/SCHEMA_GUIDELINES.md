# Schema 開發準則

本文件說明如何判斷 Zod schema 應該放在 `@repo/shared` 或 `backend` 內。

## 目錄結構

```
packages/shared/src/schemas/   # 前後端共用的純驗證 schema
apps/backend/src/schemas/      # 後端專用（含 OpenAPI、Drizzle 相關）
```

## 判斷準則

### 放到 `@repo/shared` 的 Schema

| 類型 | 說明 | 範例 |
|------|------|------|
| Input Schema | 前端表單需要驗證的輸入 | `createRecipeSchema`, `updateRecipeSchema` |
| Enum / 常數 | 前後端都需要的選項 | `RecipeTypeEnum`, `OrderStatusEnum` |
| Query Schema | 前端篩選/搜尋需要的參數 | `recipeQuerySchema` |
| 純驗證邏輯 | 不依賴後端特定套件 | 字串長度、數字範圍、格式檢查 |

### 留在 Backend 的 Schema

| 類型 | 說明 | 範例 |
|------|------|------|
| Drizzle 衍生 | 由 `drizzle-zod` 產生的 | `insertRecipeSchema`, `selectRecipeSchema` |
| OpenAPI metadata | 加了 `.openapi()` 的版本 | API 文件用的 schema |
| Response Schema | API 回應結構 | `recipeResponseSchema`（前端透過 RPC 推導） |
| 內部驗證 | 只有後端用到的 | DB 操作、內部服務間溝通 |

## 判斷流程

```
這個 schema 前端需要用到嗎？
    │
    ├─ 否 → 留在 backend
    │
    └─ 是 → 它依賴後端套件嗎？(drizzle, @hono/zod-openapi)
              │
              ├─ 是 → 留在 backend
              │
              └─ 否 → 放到 shared
```

## 程式碼範例

### 不要放到 shared

```ts
// ❌ 依賴 drizzle-zod
import { createInsertSchema } from 'drizzle-zod'
export const insertRecipeSchema = createInsertSchema(recipes)

// ❌ 有 .openapi() metadata
export const createRecipeSchema = z.object({
  name: z.string().openapi({ description: '菜譜名稱' })
})

// ❌ Response schema（前端透過 Hono RPC 推導類型）
export const recipeResponseSchema = z.object({
  id: z.string().openapi({ description: '菜譜 ID' }),
  createdAt: z.string().datetime().openapi({ description: '建立時間' }),
})
```

### 放到 shared

```ts
// ✅ 純 Zod 驗證邏輯
export const createRecipeSchema = z.object({
  name: z.string().min(1, '菜名不可為空').max(200, '菜名最多 200 字'),
  type: RecipeTypeEnum,
  servings: z.number().int('人份必須為整數').positive('人份必須大於 0'),
})

// ✅ 通用 Enum
export const RecipeTypeEnum = z.enum(['main', 'side', 'soup', 'dessert'])

// ✅ 查詢參數（前端篩選用）
export const recipeQuerySchema = z.object({
  search: z.string().optional(),
  type: RecipeTypeEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})
```

## 引入來源

Schema 和類型應該從單一來源引入，避免混淆：

| 使用情境 | 引入來源 | 範例 |
|----------|---------|------|
| Frontend 表單驗證 | `@repo/shared/schemas` | `import { createRecipeSchema } from '@repo/shared/schemas'` |
| Frontend 類型定義 | `@repo/shared/schemas` | `import type { CreateRecipeInput } from '@repo/shared/schemas'` |
| Backend 路由驗證 | `../schemas/xxx.schema.js` | `import { createRecipeSchema } from '../schemas/recipe.schema.js'` |
| Backend OpenAPI | `../schemas/xxx.schema.js` | `import { recipeResponseSchema } from '../schemas/recipe.schema.js'` |

### 注意事項

- **不要在 backend 重新 export shared 的類型** - 這會造成引入路徑混亂
- **Frontend 永遠從 `@repo/shared` 引入** - 不要從 backend 引入 schema
- **Backend 內部使用自己的 schema** - 因為需要 OpenAPI metadata

```ts
// ✅ Frontend 正確做法
import { createRecipeSchema, type CreateRecipeInput } from '@repo/shared/schemas'

// ❌ Frontend 錯誤做法 - 不要從 backend 引入
import { createRecipeSchema } from '@repo/backend/schemas/recipe.schema'

// ✅ Backend 正確做法
import { createRecipeSchema } from '../schemas/recipe.schema.js'

// ✅ Backend 需要 shared 的基礎類型時
import { RecipeTypeEnum } from '@repo/shared/schemas'
```

## 開發流程

### 1. 在 shared 定義基礎 schema

```ts
// packages/shared/src/schemas/recipe.schema.ts
export const createRecipeSchema = z.object({
  name: z.string().min(1, '菜名不可為空').max(200, '菜名最多 200 字'),
  type: RecipeTypeEnum,
  servings: z.number().int().positive(),
})

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>
```

### 2. Backend 從 shared 擴展，只加 OpenAPI metadata

**重要：Backend 不重新定義驗證邏輯，只從 shared 擴展並加上 OpenAPI metadata**

```ts
// apps/backend/src/schemas/recipe.schema.ts
import {
  RecipeTypeEnum as BaseRecipeTypeEnum,
  createRecipeSchema as baseCreateRecipeSchema,
} from '@repo/shared/schemas'
import { z } from 'zod'

// Enum：直接從 shared 引入，加上 OpenAPI 描述
export const RecipeTypeEnum = BaseRecipeTypeEnum.openapi({
  description: '菜譜類型：main=主菜, side=配菜, soup=湯品, dessert=甜點',
})

// Input Schema：從 shared 的 shape 擴展，只加 OpenAPI metadata
export const createRecipeSchema = z.object({
  name: baseCreateRecipeSchema.shape.name.openapi({
    description: '菜譜名稱（1-200 字）',
    example: '紅蘿蔔炒蛋',
  }),
  type: baseCreateRecipeSchema.shape.type.openapi({
    description: RECIPE_TYPE_DESCRIPTION,
    example: 'side',
  }),
  servings: baseCreateRecipeSchema.shape.servings.openapi({
    description: '份數（人份），必須為正整數',
    example: 4,
  }),
  // ...其他欄位同理
})
```

這樣做的好處：
- **驗證規則只維護一處**（shared）
- **Backend 只負責加 OpenAPI metadata**
- **修改 shared 的規則時，前後端自動同步**

### 3. Frontend 直接使用 shared schema

```tsx
// apps/frontend/src/components/RecipeForm.tsx
import { createRecipeSchema } from '@repo/shared/schemas'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function RecipeForm() {
  const form = useForm({
    resolver: zodResolver(createRecipeSchema),
    defaultValues: {
      name: '',
      type: 'main',
      servings: 4,
    },
  })

  // 表單驗證錯誤訊息與後端一致
}
```

## 常見問題

### Q: Response schema 為什麼不放 shared？

前端使用 Hono RPC client 時，已經可以從 `AppType` 推導出完整的 response 類型，不需要額外引入 schema。

```ts
// apps/frontend/src/api/client.ts
import { hc } from 'hono/client'
import type { AppType } from '@repo/backend/index'

export const client = hc<AppType>('http://localhost:8080')

// 自動推導 response 類型，不需要 schema
const res = await client.api.recipes.$get()
const data = await res.json() // 類型自動推導
```

### Q: 如果後端修改了驗證規則，前端會自動同步嗎？

會。因為 shared package 是 workspace 依賴，修改後：
1. 執行 `pnpm build` 會重新編譯 shared
2. Frontend 和 Backend 都會使用新的驗證規則

### Q: 什麼時候需要在 shared 新增 schema？

當你發現以下情況時：
- 前端表單需要驗證輸入
- 前端需要顯示與後端相同的選項（如下拉選單）
- 前端需要相同的錯誤訊息
