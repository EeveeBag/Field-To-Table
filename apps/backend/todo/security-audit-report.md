# 資安檢視報告 - FieldToTable Backend

**檢查日期：** 2026-01-12
**專案版本：** 當前 yong 分支
**檢查人員：** Claude Code Security Audit

---

## 📊 整體安全等級：**良好** 🟢

專案在 SQL Injection 防護、用戶隔離、日誌監控和 CORS 配置方面表現優秀，但在認證策略（密碼強度、速率限制）方面仍需改進。

---

## 目錄

1. [近期安全改進](#近期安全改進)
2. [優秀的安全實踐](#優秀的安全實踐)
3. [需要改進的安全問題](#需要改進的安全問題)
4. [OWASP Top 10 檢查清單](#owasp-top-10-檢查清單)
5. [優先修復建議](#優先修復建議)
6. [關鍵文件清單](#關鍵文件清單)

---

## 🎉 近期安全改進

自上次檢查（2025-12-23）以來，專案已完成以下重要的安全改進：

### ✅ 已完成項目

#### 1. 日誌與監控系統（A09 - Logging & Monitoring）

**實施日期：** 2026-01-12
**影響等級：** 高 → 低（風險大幅降低）

**改進內容：**
- ✅ 使用 Pino logger 建立完整的日誌系統
- ✅ 實施請求日誌中間件（記錄所有 HTTP 請求）
- ✅ 實施全局錯誤處理器
- ✅ 添加 Request ID 追蹤機制
- ✅ 配置生產/開發環境不同的日誌格式
- ✅ 處理未捕獲異常和未處理的 Promise rejection

**安全效益：**
- 可以追蹤所有 API 請求和錯誤
- 支援安全事件調查
- 符合 OWASP A09 最佳實踐
- 為未來的安全監控打下基礎

#### 2. CORS 配置強化（A05 - Security Misconfiguration）

**實施日期：** 2026-01-12
**影響等級：** 中 → 低（配置更安全）

**改進內容：**
- ✅ 明確限制允許的 HTTP 方法（GET, POST, PUT, DELETE, PATCH, OPTIONS）
- ✅ 明確限制允許的請求頭部（Content-Type, Authorization）
- ✅ 設定預檢請求快取時間（24 小時）
- ✅ 支援多環境配置（DEV/PROD 分離）

**安全效益：**
- 減少 CSRF 攻擊面
- 更嚴格的跨域資源共享控制
- 更好的多環境支援

#### 3. 環境變數管理改進

**實施日期：** 2026-01-12
**影響等級：** 低（配置更彈性）

**改進內容：**
- ✅ 將 `FRONTEND_URL` 拆分為 `FRONTEND_URL_DEV` 和 `FRONTEND_URL_PROD`
- ✅ 支援同時允許本地開發和生產環境的前端請求

**安全效益：**
- 更好的環境隔離
- 避免硬編碼 URL
- 更彈性的部署配置

### 📈 安全等級提升

| 項目                 | 之前狀態      | 現在狀態      | 改進幅度 |
| -------------------- | ------------- | ------------- | -------- |
| **整體安全等級**     | 中等偏良好 🟡 | 良好 🟢       | ⬆️       |
| **A09: 日誌監控**    | 缺失 🔴       | 優秀 🟢       | ⬆️⬆️⬆️   |
| **A05: 配置安全**    | 需改進 🟡     | 良好 🟢       | ⬆️       |
| **OWASP 符合項目數** | 6/10          | 8/10          | +2       |

---

## ✅ 優秀的安全實踐

### 1. SQL Injection 防護（無風險）🟢

**狀態：** 安全
**文件位置：** `src/routes/recipes.openapi.ts`, `src/routes/menu-sets.openapi.ts`

**說明：**
專案使用 **Drizzle ORM**，所有數據庫查詢都是參數化的，不存在 SQL Injection 風險。

**安全示例：**

```typescript
// ✅ 安全 - recipes.openapi.ts:48
conditions.push(ilike(recipes.name, `%${search}%`));  // 自動參數化

// ✅ 安全 - recipes.openapi.ts:126
.where(and(eq(recipes.id, id), eq(recipes.userId, user.id)))  // 完全參數化

// ✅ 安全 - menu-sets.openapi.ts:52
.leftJoin(recipes, eq(menuSetDishes.recipeId, recipes.id))  // JOIN 也是參數化
```

**結論：** 無 SQL Injection 漏洞

---

### 2. 用戶隔離與權限控制（良好）🟢

**狀態：** 安全
**文件位置：** 所有 CRUD 路由

**說明：**
所有 CRUD 操作都檢查 `userId`，確保用戶只能訪問自己的數據，防止水平越權攻擊（IDOR）。

**安全示例：**

```typescript
// recipes.openapi.ts:46 - 列表查詢
const conditions = [eq(recipes.userId, user.id)];

// recipes.openapi.ts:126 - 單一資源查詢
.where(and(eq(recipes.id, id), eq(recipes.userId, user.id)))

// recipes.openapi.ts:256 - 更新操作
.where(and(eq(recipes.id, id), eq(recipes.userId, user.id)))

// recipes.openapi.ts:309 - 刪除操作
.where(and(eq(recipes.id, id), eq(recipes.userId, user.id)))
```

**結論：** 無 IDOR 漏洞

---

### 3. 輸入驗證（部分良好）🟡

**狀態：** 大部分安全，有改進空間
**文件位置：** `src/schemas/recipe.schema.ts`, `src/schemas/menuSet.schema.ts`

**已驗證的字段：**

| 欄位            | 驗證規則                                    | 限制           | 狀態 |
| --------------- | ------------------------------------------- | -------------- | ---- |
| name            | `min(1).max(200)`                           | 1-200 字       | ✅   |
| type            | `enum(['main', 'side', 'soup', 'dessert'])` | 列舉           | ✅   |
| servings        | `int().positive()`                          | 正整數         | ✅   |
| ingredientsText | `max(5000)`                                 | 最多 5000 字   | ✅   |
| steps           | `max(10000)`                                | 最多 10000 字  | ✅   |
| notes           | `max(1000)`                                 | 最多 1000 字   | ✅   |
| page            | `positive().max(100)`                       | 最多 100 項/頁 | ✅   |

**缺少驗證的字段：** ⚠️

```typescript
// recipe.schema.ts:76-82
mainIngredient: z.string() // ❌ 無長度限制
subIngredient: z.string().optional() // ❌ 無長度限制
```

**風險：** 可能被用於資源耗盡攻擊（DoS）

---

### 4. Session 安全設定（良好）🟢

**狀態：** 安全
**文件位置：** `src/routes/auth.openapi.ts:110-112`

**安全特性：**

```typescript
;`better-auth.session_token=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
```

- ✅ `HttpOnly` - 防止 XSS 竊取 Cookie
- ✅ `SameSite=Lax` - 防止 CSRF 攻擊
- ⚠️ `Max-Age=7天` - 過期時間較長（建議縮短為 1 天）

---

### 5. 數據庫架構安全（良好）🟢

**狀態：** 安全
**文件位置：** `src/db/schema.ts`

**安全特性：**

1. **級聯刪除：** 用戶刪除時自動清理相關數據

   ```typescript
   .references(() => user.id, { onDelete: 'cascade' })
   ```

2. **Unique 約束：** Email 和 session token 不重複

   ```typescript
   email: text('email').notNull().unique()
   token: text('token').notNull().unique()
   ```

3. **ID 策略：** 使用 CUID 而非序列 ID（更安全，防止枚舉）
   ```typescript
   id: text('id').$defaultFn(() => createId())
   ```

---

### 6. CORS 配置（優秀）🟢

**狀態：** 安全
**文件位置：** `src/index.ts:32-45`

**配置：**

```typescript
const allowedOrigins = [
  process.env.FRONTEND_URL_DEV, // 本地開發
  process.env.FRONTEND_URL_PROD // 生產環境
].filter((origin): origin is string => Boolean(origin))

app.use('/*', cors({
  origin: allowedOrigins,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 預檢請求快取 24 小時
}))
```

- ✅ 嚴格限制 Origin（支援多環境）
- ✅ 允許攜帶憑證（cookies）
- ✅ 明確限制 HTTP 方法
- ✅ 明確限制允許的頭部
- ✅ 設定預檢請求快取時間

---

### 7. 日誌與監控系統（優秀）🟢

**狀態：** 已實施
**文件位置：** `src/lib/logger.ts`, `src/middleware/logger.ts`, `src/middleware/error-handler.ts`

**實施內容：**

**Logger 配置（使用 Pino）：**
```typescript
// src/lib/logger.ts
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment ? { target: 'pino-pretty' } : undefined,
  timestamp: pino.stdTimeFunctions.isoTime
})
```

**請求日誌中間件：**
```typescript
// src/middleware/logger.ts
export const loggerMiddleware = createMiddleware(async (c, next) => {
  const requestId = c.req.header('X-Request-ID') || createId()
  const logger = baseLogger.child({ requestId })

  logger.info({ method, path, userAgent }, 'Incoming request')
  await next()
  logger[logLevel]({ method, path, status, duration }, 'Request completed')
})
```

**錯誤處理器：**
```typescript
// src/middleware/error-handler.ts
logger.error({ error: { message, stack, name } }, 'Request failed with error')
```

**全局異常處理：**
```typescript
// src/index.ts:125-133
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception - shutting down')
  process.exit(1)
})
```

**安全特性：**
- ✅ 所有請求都記錄（包含方法、路徑、狀態碼、耗時）
- ✅ Request ID 追蹤（每個請求唯一 ID）
- ✅ 錯誤詳細記錄（包含 stack trace）
- ✅ 全局未捕獲異常處理
- ✅ 生產環境使用 JSON 格式，開發環境使用 pretty print
- ✅ 可配置的日誌等級（通過 LOG_LEVEL 環境變數）

---

## ⚠️ 需要改進的安全問題

### 1. 密碼策略弱（中等風險）🔴

**風險等級：** 中
**文件位置：** `src/routes/auth.openapi.ts:12`
**OWASP：** A07 - Authentication Failures

**問題：**
密碼驗證僅要求字符串，無最小長度或複雜度要求：

```typescript
// auth.openapi.ts:12
password: z.string() // ❌ 無強度檢查
```

**影響：**

- 允許弱密碼（如 "123456"）
- 容易被字典攻擊破解
- 不符合 NIST 密碼指南

**建議修復：**

```typescript
// schemas/auth.schema.ts（需新建）
export const signInBodySchema = z.object({
  email: z.string().email('請輸入有效的 Email'),
  password: z
    .string()
    .min(8, '密碼至少 8 個字符')
    .regex(/[A-Z]/, '必須包含至少一個大寫字母')
    .regex(/[a-z]/, '必須包含至少一個小寫字母')
    .regex(/[0-9]/, '必須包含至少一個數字')
    .regex(/[^A-Za-z0-9]/, '必須包含至少一個特殊字符')
})
```

**優先級：** 高

---

### 2. 無 API 速率限制（中等風險）🔴

**風險等級：** 中
**文件位置：** 全局
**OWASP：** A04 - Insecure Design

**問題：**
所有端點都沒有速率限制，可能被暴力破解攻擊或資源耗盡攻擊。

**影響的端點：**

- `/api/auth-test/sign-in` - 可無限次嘗試登入
- `/api/recipes/` - 可濫用查詢資源
- 所有其他 API 端點

**攻擊場景：**

1. 攻擊者使用自動化工具每秒嘗試 1000 次登入
2. 攻擊者發送大量請求耗盡服務器資源

**建議修復：**

**步驟 1：安裝速率限制中間件**

```bash
npm install @hono/rate-limiter
```

**步驟 2：應用到認證端點**

```typescript
// src/routes/auth.openapi.ts
import { rateLimiter } from '@hono/rate-limiter'

app.use(
  '/sign-in',
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 分鐘時間窗口
    max: 5, // 最多 5 次請求
    message: '登入嘗試次數過多，請 15 分鐘後再試'
  })
)
```

**步驟 3：應用到其他端點**

```typescript
// src/index.ts
import { rateLimiter } from '@hono/rate-limiter'

app.use(
  '/api/*',
  rateLimiter({
    windowMs: 60 * 1000, // 1 分鐘
    max: 100 // 最多 100 次請求
  })
)
```

**優先級：** 高

---

### 3. 敏感環境變數管理（高風險）🔴

**風險等級：** 高
**文件位置：** `.env.example:13`, `.env.zeabur`
**OWASP：** A02 - Cryptographic Failures

**問題：**
環境變數範本中包含弱密鑰示例：

```bash
# .env.example:13
BETTER_AUTH_SECRET="your-secret-key-change-this"  # ❌ 太簡單

# .env.example:9
DATABASE_URL="postgres://myuser:mypassword@..."   # ❌ 包含明文密碼
```

**風險：**

1. 開發者可能直接使用範本密鑰進入生產環境
2. 數據庫密碼明文存儲在環境變數中
3. 若 `.env` 文件被洩露，所有密鑰暴露

**建議修復：**

**步驟 1：生成強隨機密鑰**

```bash
# 生成 BETTER_AUTH_SECRET
openssl rand -base64 32

# 示例輸出：
# 8vR2kL9mP3nQ7wX5yT1aH6bF4cD0eG2jK8hM5iN9oS3
```

**步驟 2：更新 .env.example**

```bash
# .env.example
BETTER_AUTH_SECRET="<RUN: openssl rand -base64 32>"
DATABASE_URL="postgres://USERNAME:PASSWORD@HOST:5432/DATABASE"
```

**步驟 3：生產環境使用密鑰管理服務**

- AWS Secrets Manager
- HashiCorp Vault
- Zeabur 環境變數（加密存儲）
- Azure Key Vault

**步驟 4：添加 .env 到 .gitignore**

```bash
# .gitignore
.env
.env.local
.env.production
```

**優先級：** 高

---

### 4. 字段長度無限制（低風險）🟡

**風險等級：** 低
**文件位置：** `src/schemas/recipe.schema.ts:76-82`
**OWASP：** A04 - Insecure Design

**問題：**
`mainIngredient` 和 `subIngredient` 無長度限制，可能被用於資源耗盡攻擊。

**攻擊場景：**
攻擊者提交 10MB 的字符串作為 `mainIngredient`，導致：

1. 數據庫存儲空間浪費
2. 網絡傳輸負擔
3. 前端渲染卡頓

**建議修復：**

```typescript
// src/schemas/recipe.schema.ts:76-82
mainIngredient: z.string()
  .min(1, '主要食材不可為空')
  .max(100, '主要食材最多 100 字')
  .openapi({
    description: '主要食材（1-100 字）',
    example: '菜',
  }),

subIngredient: z.string()
  .max(200, '次要食材最多 200 字')
  .optional()
  .openapi({
    description: '次要食材（選填，最多 200 字）',
    example: '紅蘿蔔',
  }),
```

**優先級：** 中

---

### 5. Session 過期時間長（低風險）🟡

**風險等級：** 低
**文件位置：** `src/routes/auth.openapi.ts:112`
**OWASP：** A07 - Authentication Failures

**問題：**
Session cookie 設定為 7 天過期：

```typescript
// auth.openapi.ts:112
Max-Age=${60*60*24*7}  // 7 天
```

**風險：**

1. 若設備被盜，攻擊者有更長時間訪問帳戶
2. 不符合敏感應用的最佳實踐（建議 24 小時）

**建議修復：**

```typescript
// 方案 1：縮短為 24 小時
Max-Age=${60*60*24}  // 1 天

// 方案 2：實施「記住我」功能（推薦）
const maxAge = rememberMe ? 60*60*24*30 : 60*60*24;
`Max-Age=${maxAge}`
```

**優先級：** 中

---

### 6. 無 Email 驗證流程（中等風險）🟡

**風險等級：** 中
**文件位置：** `src/db/schema.ts:12`
**OWASP：** A07 - Authentication Failures

**問題：**
用戶註冊後 `emailVerified` 預設為 `false`，但沒有強制驗證流程：

```typescript
// schema.ts:12
emailVerified: boolean('emailVerified').notNull().default(false),
```

**風險：**

1. 用戶可使用假 Email 註冊
2. 無法確認用戶身份
3. 可能被用於垃圾註冊

**建議修復：**

使用 Better Auth 的 Email Verification 插件：

```typescript
// src/lib/auth.ts
import { betterAuth } from 'better-auth'
import { emailVerification } from 'better-auth/plugins'

export const auth = betterAuth({
  // ... 現有配置
  plugins: [
    emailVerification({
      sendOnSignUp: true,
      autoSignInAfterVerification: true
    })
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true // 強制驗證
  }
})
```

**優先級：** 中

---

## 🛡️ OWASP Top 10 檢查清單

| 漏洞類型                             | 風險等級 | 狀態   | 說明                   | 文件位置            |
| ------------------------------------ | -------- | ------ | ---------------------- | ------------------- |
| **A01: Broken Access Control**       | 🟢 低    | 安全   | 所有端點都檢查 userId  | 所有路由            |
| **A02: Cryptographic Failures**      | 🟡 中    | 需改進 | 環境變數明文存儲       | `.env.example`      |
| **A03: Injection**                   | 🟢 無    | 安全   | 使用 ORM 參數化查詢    | 所有路由            |
| **A04: Insecure Design**             | �� 中    | 需改進 | 無速率限制、密碼策略弱 | 全局                |
| **A05: Security Misconfiguration**   | 🟢 低    | 良好   | CORS 配置已強化        | `src/index.ts`      |
| **A06: Vulnerable Components**       | 🟢 低    | 良好   | 使用最新版本依賴       | `package.json`      |
| **A07: Authentication Failures**     | 🟡 中    | 需改進 | 無密碼強度檢查、無 MFA | `auth.openapi.ts`   |
| **A08: Software Integrity Failures** | 🟢 低    | 良好   | 使用 npm 驗證包        | `package-lock.json` |
| **A09: Logging & Monitoring**        | 🟢 低    | 優秀   | 完整日誌系統（Pino）   | 全局                |
| **A10: Server-Side Request Forgery** | 🟢 無    | 安全   | 無外部請求功能         | N/A                 |

---

## 🔧 優先修復建議

### 🔴 高優先級（立即修復 - 本週完成）

#### 1. 添加 API 速率限制

**預估時間：** 30 分鐘
**文件位置：** `src/index.ts`, `src/routes/auth.openapi.ts`

**步驟：**

```bash
# 1. 安裝依賴
npm install @hono/rate-limiter

# 2. 應用到認證端點
# 編輯 src/routes/auth.openapi.ts
```

**代碼：**

```typescript
// src/routes/auth.openapi.ts
import { rateLimiter } from '@hono/rate-limiter'

// 登入端點限制
app.use(
  '/sign-in',
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 分鐘
    max: 5, // 最多 5 次
    message: '登入嘗試次數過多，請 15 分鐘後再試'
  })
)

// 全局限制
app.use(
  '/*',
  rateLimiter({
    windowMs: 60 * 1000, // 1 分鐘
    max: 100 // 最多 100 次
  })
)
```

---

#### 2. 強化密碼策略

**預估時間：** 20 分鐘
**文件位置：** `src/routes/auth.openapi.ts`, `src/schemas/auth.schema.ts`（需新建）

**步驟：**

```bash
# 1. 創建新的 schema 文件
touch src/schemas/auth.schema.ts
```

**代碼：**

```typescript
// src/schemas/auth.schema.ts
import { z } from 'zod'

export const signInBodySchema = z.object({
  email: z.string().email('請輸入有效的 Email'),
  password: z
    .string()
    .min(8, '密碼至少 8 個字符')
    .regex(/[A-Z]/, '必須包含至少一個大寫字母')
    .regex(/[a-z]/, '必須包含至少一個小寫字母')
    .regex(/[0-9]/, '必須包含至少一個數字')
})

export const signUpBodySchema = signInBodySchema.extend({
  name: z.string().min(1, '姓名不可為空').max(100, '姓名最多 100 字')
})
```

```typescript
// src/routes/auth.openapi.ts
import { signInBodySchema } from '../schemas/auth.schema.js'

// 更新路由定義
const signInRoute = createRoute({
  // ...
  request: {
    body: {
      content: {
        'application/json': {
          schema: signInBodySchema // 使用新的 schema
        }
      }
    }
  }
  // ...
})
```

---

#### 3. 生成新的 BETTER_AUTH_SECRET

**預估時間：** 5 分鐘
**文件位置：** `.env`, `.env.example`

**步驟：**

```bash
# 1. 生成新密鑰
openssl rand -base64 32

# 2. 更新 .env 文件（不要提交到 Git）
# BETTER_AUTH_SECRET="<生成的密鑰>"

# 3. 更新 .env.example
# BETTER_AUTH_SECRET="<RUN: openssl rand -base64 32>"
```

---

### 🟡 中優先級（1-2 週內完成）

#### 4. 添加字段長度驗證

**預估時間：** 15 分鐘
**文件位置：** `src/schemas/recipe.schema.ts:76-82`

**代碼：**

```typescript
// src/schemas/recipe.schema.ts:76-82
mainIngredient: z.string()
  .min(1, '主要食材不可為空')
  .max(100, '主要食材最多 100 字')
  .openapi({
    description: '主要食材（1-100 字）',
    example: '菜',
  }),

subIngredient: z.string()
  .max(200, '次要食材最多 200 字')
  .optional()
  .openapi({
    description: '次要食材（選填，最多 200 字）',
    example: '紅蘿蔔',
  }),
```

---

#### 5. 縮短 Session 過期時間

**預估時間：** 10 分鐘
**文件位置：** `src/routes/auth.openapi.ts:112`

**代碼：**

```typescript
// 方案 1：縮短為 24 小時
;`Max-Age=${60 * 60 * 24}` // 1 天

// 方案 2：實施「記住我」功能（推薦）
const maxAge = body.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24
c.header(
  'Set-Cookie',
  `better-auth.session_token=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
)
```

---

#### 6. 實施 Email 驗證流程

**預估時間：** 2 小時
**文件位置：** `src/lib/auth.ts`

**代碼：**

```typescript
// src/lib/auth.ts
import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  // ... 現有配置
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true // 強制驗證
  },
  // 配置郵件發送（需要 SMTP 設定）
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true
  }
})
```

---

### 🔵 低優先級（改進項，可選）

#### 7. 實施 HTTPS 強制（生產環境）

**預估時間：** 15 分鐘
**文件位置：** `src/index.ts`

**代碼：**

```typescript
// src/index.ts
import { secureHeaders } from 'hono/secure-headers'

// 安全頭部中間件
app.use('/*', secureHeaders())

// HTTPS 重定向（僅生產環境）
if (process.env.NODE_ENV === 'production') {
  app.use('/*', async (c, next) => {
    const proto = c.req.header('x-forwarded-proto')
    if (proto !== 'https') {
      return c.redirect(`https://${c.req.header('host')}${c.req.url}`)
    }
    await next()
  })
}
```

---

#### 8. 添加數據庫索引優化

**預估時間：** 30 分鐘
**文件位置：** `src/db/schema.ts`

**代碼：**

```typescript
// src/db/schema.ts
import { index } from 'drizzle-orm/pg-core'

export const recipes = pgTable(
  'recipes',
  {
    // ... 現有欄位
  },
  (table) => ({
    // 複合索引優化查詢
    userIdCreatedAtIdx: index('recipes_userId_createdAt_idx').on(table.userId, table.createdAt),
    mainIngredientIdx: index('recipes_mainIngredient_idx').on(table.mainIngredient)
  })
)
```

---

## 📋 修復檢查清單

使用以下清單追蹤修復進度：

- [ ] **高優先級 1：** 添加 API 速率限制
- [ ] **高優先級 2：** 強化密碼策略
- [ ] **高優先級 3：** 生成新的 BETTER_AUTH_SECRET
- [x] **已完成：** 實施日誌監控 ✅
- [ ] **中優先級 4：** 添加字段長度驗證
- [ ] **中優先級 5：** 縮短 Session 過期時間
- [ ] **中優先級 6：** 實施 Email 驗證流程
- [x] **已完成：** 強化 CORS 配置 ✅
- [ ] **低優先級 7：** 實施 HTTPS 強制
- [ ] **低優先級 8：** 添加數據庫索引優化

---

## 📄 關鍵文件清單

需要檢查/修改的所有安全相關文件：

### 路由文件

- `src/routes/recipes.openapi.ts` - 菜譜 CRUD 端點
- `src/routes/menu-sets.openapi.ts` - 菜單組 CRUD 端點
- `src/routes/auth.openapi.ts` - 認證端點

### Schema 驗證

- `src/schemas/recipe.schema.ts` - 菜譜驗證規則
- `src/schemas/menuSet.schema.ts` - 菜單組驗證規則
- `src/schemas/auth.schema.ts` - 認證驗證規則（**需新建**）
- `src/schemas/common.schema.ts` - 通用回應格式

### 認證與授權

- `src/lib/auth.ts` - Better Auth 配置
- `src/middleware/auth.ts` - 認證中間件
- `src/lib/createAuthenticatedApp.ts` - 認證應用工廠

### 日誌與監控

- `src/lib/logger.ts` - Pino Logger 配置
- `src/middleware/logger.ts` - 請求日誌中間件
- `src/middleware/error-handler.ts` - 全局錯誤處理器
- `src/types/logger.types.ts` - Logger 類型定義

### 數據庫

- `src/db/index.ts` - 數據庫連接
- `src/db/schema.ts` - Drizzle 架構定義

### 配置文件

- `.env.example` - 環境變數範本
- `.env.zeabur` - Zeabur 環境變數範本
- `drizzle.config.ts` - Drizzle Kit 配置
- `tsconfig.json` - TypeScript 配置

### 部署

- `Dockerfile` - Docker 容器配置
- `package.json` - 依賴管理

### 入口點

- `src/index.ts` - 應用主入口

---

## 📚 參考資源

### OWASP 資源

- [OWASP Top 10 (2021)](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

### 密碼安全

- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [Have I Been Pwned API](https://haveibeenpwned.com/API/v3)

### Better Auth 文檔

- [Better Auth Documentation](https://www.better-auth.com/)
- [Email Verification Plugin](https://www.better-auth.com/docs/plugins/email-verification)

### Drizzle ORM

- [Drizzle ORM Security](https://orm.drizzle.team/docs/overview)
- [SQL Injection Prevention](https://orm.drizzle.team/docs/sql)

### Node.js 安全

- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Snyk Node.js Security](https://snyk.io/learn/nodejs-security/)

---

## 📞 聯絡資訊

**報告生成者：** Claude Code Security Audit
**檢查日期：** 2026-01-12
**版本：** 2.0

如有任何疑問或需要進一步說明，請聯絡開發團隊。

---

## 附錄 A：技術棧詳細資訊

### 核心依賴

| 套件              | 版本   | 用途            |
| ----------------- | ------ | --------------- |
| hono              | 4.11.0 | Web 框架        |
| better-auth       | 1.4.7  | 認證系統        |
| drizzle-orm       | 0.41.0 | ORM             |
| zod               | 4.1.13 | 驗證            |
| @hono/zod-openapi | 1.1.5  | API 文檔        |
| pg                | 8.16.3 | PostgreSQL 驅動 |

### 開發依賴

| 套件        | 版本   | 用途            |
| ----------- | ------ | --------------- |
| typescript  | 5.8.3  | 類型檢查        |
| tsx         | 4.19.2 | TypeScript 執行 |
| drizzle-kit | 0.31.2 | 數據庫遷移      |

---

## 附錄 B：數據庫架構圖

```
┌─────────────┐
│    user     │
├─────────────┤
│ id (PK)     │◄─────┐
│ name        │      │
│ email       │      │
│ password    │      │
└─────────────┘      │
                     │
                     │ 1:N
                     │
┌─────────────┐      │
│  session    │      │
├─────────────┤      │
│ id (PK)     │      │
│ userId (FK) │──────┘
│ token       │
│ expiresAt   │
└─────────────┘

┌─────────────┐      ┌─────────────────┐      ┌──────────────┐
│  recipes    │      │ menuSetDishes   │      │  menuSets    │
├─────────────┤      ├─────────────────┤      ├──────────────┤
│ id (PK)     │◄─────│ recipeId (FK)   │      │ id (PK)      │
│ name        │      │ menuSetId (FK)  │──────┤ name         │
│ type        │      │ multiplier      │      │ description  │
│ userId (FK) │      └─────────────────┘      │ userId (FK)  │
└─────────────┘                                └──────────────┘
```

---

**報告結束**
