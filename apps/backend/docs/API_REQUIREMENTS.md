# FieldToTable - API 需求文件

> **專案名稱**: FieldToTable - 菜單規劃系統
> **文件建立日期**: 2025-12-12
> **最後更新**: 2025-12-31
> **版本**: 2.0

---

## 📋 專案概述

FieldToTable 是一個智慧型菜單規劃系統，幫助使用者：

- 管理個人菜譜庫
- 建立和管理菜單組合
- 自動生成採購食材清單
- 發掘和收藏推薦菜譜
- 使用 Google 帳號快速登入

---

## 🏗️ 技術架構

### Backend

- **框架**: Hono.js
- **ORM**: Drizzle ORM
- **資料庫**: PostgreSQL 16
- **認證**: Better Auth (支援 Email/Password + Google OAuth)
- **驗證**: Zod
- **API 文檔**: OpenAPI 3.1 + Swagger UI

### Frontend

- **框架**: React 19 + TypeScript
- **路由**: TanStack Router
- **狀態管理**: Zustand
- **HTTP 客戶端**: Axios + TanStack Query

---

## 🔐 認證機制

### 認證框架：Better Auth

FieldToTable 使用 **Better Auth** 作為認證解決方案，提供：

✅ **已實作功能**

- Email/Password 註冊與登入
- Google OAuth 2.0 登入
- Session 管理（基於 token）
- 自動處理 session 過期
- CSRF 保護
- 跨域請求支援（CORS）

### Session Cookie 說明

認證成功後，session token 會自動儲存在 **HttpOnly Cookie** 中：

- **開發環境 (HTTP)**：`better-auth.session_token`
- **生產環境 (HTTPS)**：`__Secure-better-auth.session_token`

> 💡 **注意**：本文檔中的 API 範例使用 `better-auth.session_token`，但在 HTTPS 環境下會自動使用 `__Secure-` 前綴。Better Auth client 會自動處理這個差異，開發者無需手動處理。

### 支援的登入方式

#### 1️⃣ Email/Password 登入

**註冊流程：**

```
POST /api/auth/sign-up/email
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "張小明"
}
```

**Response 200:**

```json
{
  "user": {
    "id": "usr_xxx",
    "email": "user@example.com",
    "name": "張小明",
    "emailVerified": false,
    "image": null,
    "createdAt": "2025-12-20T10:00:00Z"
  },
  "session": {
    "id": "sess_xxx",
    "token": "session_token_xxx",
    "expiresAt": "2025-12-27T10:00:00Z"
  }
}
```

---

**登入流程：**

```
POST /api/auth/sign-in/email
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response 200:**

```json
{
  "user": {
    "id": "usr_xxx",
    "email": "user@example.com",
    "name": "張小明"
  },
  "session": {
    "token": "session_token_xxx",
    "expiresAt": "2025-12-27T10:00:00Z"
  }
}
```

---

#### 2️⃣ Google OAuth 登入

**發起 OAuth 流程：**

前端調用：

```typescript
import { authClient } from '@/lib/auth-client'

await authClient.signIn.social({
  provider: 'google',
  callbackURL: 'https://localhost:3000/profile'
})
```

**OAuth 流程：**

```
1. 用戶點擊「使用 Google 登入」
   ↓
2. 重定向到 Google 登入頁面
   GET /api/auth/sign-in/social
   ↓
3. 用戶在 Google 授權
   ↓
4. Google 重定向回應用
   GET /api/auth/callback/google
   ↓
5. Backend 建立/更新 user 和 session
   ↓
6. 重定向到前端指定的 callbackURL
   https://localhost:3000/profile
```

**Google OAuth 設定要求：**

- Authorized JavaScript origins: `https://localhost:3000`, `http://localhost:8080`
- Authorized redirect URIs: `http://localhost:8080/api/auth/callback/google`

---

### Session 管理

**取得當前 Session：**

```
GET /api/auth/get-session
```

**Headers:**

```
Cookie: better-auth.session_token=xxx
```

**Response 200:**

```json
{
  "session": {
    "id": "sess_xxx",
    "userId": "usr_xxx",
    "expiresAt": "2025-12-27T10:00:00Z",
    "token": "session_token_xxx",
    "ipAddress": "127.0.0.1",
    "userAgent": "Mozilla/5.0..."
  },
  "user": {
    "id": "usr_xxx",
    "email": "user@example.com",
    "name": "張小明",
    "emailVerified": true,
    "image": "https://lh3.googleusercontent.com/..."
  }
}
```

---

**登出：**

```
POST /api/auth/sign-out
```

**Response 200:**

```json
{
  "success": true
}
```

---

### 認證中間件

所有需要認證的 API 路由都使用 `authMiddleware`：

```typescript
import { authMiddleware } from '../middleware/auth.ts'

// 應用到所有路由
app.use('/*', authMiddleware)
```

**未登入時的回應：**

```json
{
  "error": "Unauthorized"
}
```

**Status Code:** 401

---

## 🎯 核心使用者故事與實作狀態

### 1️⃣ 使用者認證 (Authentication)

#### 使用者故事

**US-000**: Google 快速登入
作為使用者，我想**使用 Google 帳號快速登入**，無需記住額外密碼

**US-001**: Email 註冊
作為使用者，我想**使用 Email 註冊帳號**，建立我的專屬菜譜庫

**US-002**: Email 登入
作為使用者，我想**使用 Email 登入**，存取我的資料

**US-003**: 登出
作為使用者，我想**安全地登出**，保護我的帳號

#### 實作狀態

- ✅ **Google OAuth 登入** - 已完成
- ✅ **Email/Password 註冊** - 已完成
- ✅ **Email/Password 登入** - 已完成
- ✅ **Session 管理** - 已完成
- ✅ **登出功能** - 已完成
- ✅ **認證中間件** - 已完成

---

### 2️⃣ 菜譜管理 (Recipes)

#### 使用者故事

**US-010**: 瀏覽菜譜
作為使用者，我想**瀏覽自己的菜譜列表**，以便快速找到要煮的菜

**US-011**: 新增菜譜
作為使用者，我想**新增新的菜譜**，記錄我會做的料理

**US-012**: 編輯菜譜
作為使用者，我想**編輯現有菜譜**，更新食材、步驟或備註資訊

**US-013**: 查看菜譜詳情
作為使用者，我想**查看菜譜完整資訊**，包含食材、步驟、備註

**US-014**: 搜尋和篩選菜譜
作為使用者，我想**依照類型、主食材搜尋和篩選菜譜**，快速找到需要的料理

**US-015**: 刪除菜譜
作為使用者，我想**刪除不再需要的菜譜**

#### 實作狀態

- ✅ **Read**: 取得菜譜列表（支援搜尋、篩選、分頁）
- ✅ **Read**: 取得單一菜譜詳細資訊
- ✅ **Create**: 新增菜譜
- ✅ **Update**: 編輯菜譜
- ✅ **Delete**: 刪除菜譜
- ✅ **使用者資料隔離** - 只能存取自己的菜譜

---

### 3️⃣ 菜單組管理 (Menu Sets)

#### 使用者故事

**US-020**: 建立菜單組
作為使用者，我想**建立新的菜單組**，規劃一餐的完整菜色組合

**US-021**: 瀏覽菜單組
作為使用者，我想**查看所有菜單組**，快速選擇要煮的組合

**US-022**: 編輯菜單組
作為使用者，我想**編輯菜單組的名稱、描述和人份**

**US-023**: 查看菜單組詳情
作為使用者，我想**查看菜單組的完整資訊**，包含所有菜色和自動計算的總食材清單

**US-024**: 管理菜單組菜色
作為使用者，我想**在菜單組中新增或移除菜色**，彈性調整組合

**US-025**: 刪除菜單組
作為使用者，我想**刪除不再需要的菜單組**

#### 實作狀態

- ✅ **已完成實作** - Menu Sets CRUD 功能已完成
- ✅ **Create**: 建立菜單組（支援 dishes 陣列）
- ✅ **Read**: 取得菜單組列表（支援分頁）
- ✅ **Read**: 取得單一菜單組詳細資訊
- ✅ **Update**: 編輯菜單組（支援更新 dishes）
- ✅ **Delete**: 刪除菜單組
- ✅ **Transaction**: 使用 transaction 確保資料一致性
- ✅ **Type 自動取得**: dishes 的 type 自動從 recipe.type 取得
- ✅ **使用者資料隔離** - 只能存取自己的菜單組

---

### 4️⃣ 推薦菜譜與收藏 (Suggested Recipes & Favorites)

#### 使用者故事

**US-030**: 瀏覽推薦菜譜
作為使用者，我想**瀏覽系統推薦的菜譜**，發掘新的料理靈感

**US-031**: 收藏推薦菜譜
作為使用者，我想**將喜歡的推薦菜譜加入收藏**，方便日後使用

**US-032**: 管理收藏
作為使用者，我想**取消收藏不再需要的菜譜**

#### 實作狀態

- ✅ **已完成實作** - Favorites 功能已完成
- ✅ **Read**: 取得收藏列表（支援分頁）
- ✅ **Create**: 新增收藏
- ✅ **Delete**: 移除收藏
- ✅ **使用者資料隔離** - 只能存取自己的收藏
- ✅ **去重檢查** - 防止重複收藏同一菜譜

---

## 📊 資料表設計

### 認證相關資料表（Better Auth）

#### 1. user（使用者表）

```sql
CREATE TABLE "user" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    image TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_email ON "user"(email);
```

**欄位說明：**

| 欄位           | 類型      | 說明                              | 必填 |
| -------------- | --------- | --------------------------------- | ---- |
| id             | TEXT      | 主鍵，Better Auth 自動生成        | ✅   |
| name           | TEXT      | 使用者姓名                        | ✅   |
| email          | TEXT      | 電子郵件（唯一）                  | ✅   |
| email_verified | BOOLEAN   | Email 是否已驗證                  | ✅   |
| image          | TEXT      | 個人頭像 URL（Google OAuth 提供） | ❌   |
| created_at     | TIMESTAMP | 建立時間                          | 自動 |
| updated_at     | TIMESTAMP | 更新時間                          | 自動 |

---

#### 2. session（會話表）

```sql
CREATE TABLE "session" (
    id TEXT PRIMARY KEY,
    expires_at TIMESTAMP NOT NULL,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX session_userId_idx ON "session"(user_id);
```

**欄位說明：**

| 欄位       | 類型      | 說明                  | 必填 |
| ---------- | --------- | --------------------- | ---- |
| id         | TEXT      | 主鍵                  | ✅   |
| expires_at | TIMESTAMP | Session 過期時間      | ✅   |
| token      | TEXT      | Session Token（唯一） | ✅   |
| ip_address | TEXT      | 登入 IP 位址          | ❌   |
| user_agent | TEXT      | 瀏覽器 User Agent     | ❌   |
| user_id    | TEXT      | 使用者 ID（外鍵）     | ✅   |
| created_at | TIMESTAMP | 建立時間              | 自動 |
| updated_at | TIMESTAMP | 更新時間              | 自動 |

---

#### 3. account（OAuth 帳號表）

```sql
CREATE TABLE "account" (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at TIMESTAMP,
    refresh_token_expires_at TIMESTAMP,
    scope TEXT,
    password TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX account_userId_idx ON "account"(user_id);
```

**欄位說明：**

| 欄位          | 類型      | 說明                             | 必填 |
| ------------- | --------- | -------------------------------- | ---- |
| id            | TEXT      | 主鍵                             | ✅   |
| account_id    | TEXT      | OAuth Provider 的使用者 ID       | ✅   |
| provider_id   | TEXT      | OAuth Provider 名稱（如 google） | ✅   |
| user_id       | TEXT      | 使用者 ID（外鍵）                | ✅   |
| access_token  | TEXT      | OAuth Access Token               | ❌   |
| refresh_token | TEXT      | OAuth Refresh Token              | ❌   |
| id_token      | TEXT      | OAuth ID Token                   | ❌   |
| password      | TEXT      | Email 登入的密碼 hash            | ❌   |
| created_at    | TIMESTAMP | 建立時間                         | 自動 |
| updated_at    | TIMESTAMP | 更新時間                         | 自動 |

---

#### 4. verification（驗證表）

```sql
CREATE TABLE "verification" (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX verification_identifier_idx ON "verification"(identifier);
```

**用途：** Email 驗證、密碼重置等一次性驗證碼

---

### 應用程式資料表

#### 5. recipes（菜譜表）

```sql
CREATE TABLE recipes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type recipe_type NOT NULL,
    main_ingredient main_ingredient_type NOT NULL,
    sub_ingredient TEXT,
    servings INTEGER NOT NULL DEFAULT 2,
    ingredients_text TEXT,
    steps TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_recipes_user_type ON recipes(user_id, type);
CREATE INDEX idx_recipes_user_ingredient ON recipes(user_id, main_ingredient);
```

**欄位說明：**

| 欄位             | 類型      | 說明                                         | 必填 | 驗證規則        |
| ---------------- | --------- | -------------------------------------------- | ---- | --------------- |
| id               | TEXT      | 主鍵（CUID2）                                | ✅   | 自動生成        |
| user_id          | TEXT      | 使用者 ID                                    | ✅   | 外鍵 → user.id  |
| name             | TEXT      | 菜名                                         | ✅   | 1-200 字元      |
| type             | ENUM      | 類型：main, side, soup, dessert              | ✅   | 限定值          |
| main_ingredient  | ENUM      | 主食材：豬、牛、雞、羊、蝦、蛋、魚、菜、其他 | ✅   | 限定值          |
| sub_ingredient   | TEXT      | 子類別/主材料細節                            | ❌   | -               |
| servings         | INTEGER   | 人份數                                       | ✅   | 正整數          |
| ingredients_text | TEXT      | 食材文字描述                                 | ❌   | 最多 5000 字元  |
| steps            | TEXT      | 烹飪步驟                                     | ❌   | 最多 10000 字元 |
| notes            | TEXT      | 備註/食譜連結                                | ❌   | 最多 1000 字元  |
| created_at       | TIMESTAMP | 建立時間                                     | 自動 | -               |
| updated_at       | TIMESTAMP | 更新時間                                     | 自動 | -               |

---

#### 6. menu_sets（菜單組表）

> ✅ **已實作**

```sql
CREATE TABLE menu_sets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    servings INTEGER NOT NULL DEFAULT 4,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

---

#### 7. menu_set_dishes（菜單組菜色關聯表）

> ✅ **已實作**

```sql
CREATE TABLE menu_set_dishes (
    id TEXT PRIMARY KEY,
    menu_set_id TEXT NOT NULL REFERENCES menu_sets(id) ON DELETE CASCADE,
    recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    multiplier DECIMAL(3,1) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**欄位說明：**

| 欄位        | 類型         | 說明                                 | 必填 |
| ----------- | ------------ | ------------------------------------ | ---- |
| id          | TEXT         | 主鍵（CUID2）                        | ✅   |
| menu_set_id | TEXT         | 菜單組 ID                            | ✅   |
| recipe_id   | TEXT         | 菜譜 ID                              | ✅   |
| multiplier  | DECIMAL(3,1) | 份量倍數（例如 1.5 表示 1.5 倍份量） | ✅   |
| created_at  | TIMESTAMP    | 建立時間                             | 自動 |

**設計說明：**

- 不儲存 `role` 欄位，菜色角色直接使用菜譜的 `type` 欄位
- API 回應時透過 JOIN `recipes` 表取得 `type` 作為 `role`
- `multiplier` 允許調整份量，預設為 1.0

---

#### 8. favorites（收藏表）

> ✅ **已實作**

```sql
CREATE TABLE favorites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, recipe_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_recipe ON favorites(recipe_id);
```

**欄位說明：**

| 欄位       | 類型      | 說明              | 必填 |
| ---------- | --------- | ----------------- | ---- |
| id         | TEXT      | 主鍵（CUID2）     | ✅   |
| user_id    | TEXT      | 使用者 ID（外鍵） | ✅   |
| recipe_id  | TEXT      | 菜譜 ID（外鍵）   | ✅   |
| created_at | TIMESTAMP | 建立時間          | 自動 |

**設計說明：**

- 每個使用者對同一個菜譜只能收藏一次（UNIQUE 約束）
- 當使用者或菜譜被刪除時，收藏記錄自動刪除（CASCADE）
- 使用複合索引優化查詢效能

---

## 🔌 API 端點規格

### 認證 APIs（Better Auth）

所有 Better Auth 端點都在 `/api/auth/*` 路徑下

#### 1. Email 註冊

```
POST /api/auth/sign-up/email
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "張小明"
}
```

**Response 200:**

```json
{
  "user": {
    "id": "usr_xxx",
    "email": "user@example.com",
    "name": "張小明",
    "emailVerified": false
  },
  "session": {
    "token": "session_token_xxx",
    "expiresAt": "2025-12-27T10:00:00Z"
  }
}
```

---

#### 2. Email 登入

```
POST /api/auth/sign-in/email
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response 200:**

```json
{
  "user": {
    "id": "usr_xxx",
    "email": "user@example.com",
    "name": "張小明"
  },
  "session": {
    "token": "session_token_xxx",
    "expiresAt": "2025-12-27T10:00:00Z"
  }
}
```

**Response 401:**

```json
{
  "error": "Invalid credentials"
}
```

---

#### 3. Google OAuth 登入（發起）

```
GET /api/auth/sign-in/social?provider=google&callbackURL=<url>
```

**說明：** 重定向到 Google OAuth 頁面

---

#### 4. Google OAuth Callback

```
GET /api/auth/callback/google
```

**說明：** Google 授權後的回調端點，由 Better Auth 自動處理

---

#### 5. 取得 Session

```
GET /api/auth/get-session
```

**Headers:**

```
Cookie: better-auth.session_token=xxx
```

**Response 200:**

```json
{
  "session": {
    "id": "sess_xxx",
    "userId": "usr_xxx",
    "expiresAt": "2025-12-27T10:00:00Z"
  },
  "user": {
    "id": "usr_xxx",
    "email": "user@example.com",
    "name": "張小明",
    "image": "https://..."
  }
}
```

---

#### 6. 登出

```
POST /api/auth/sign-out
```

**Response 200:**

```json
{
  "success": true
}
```

---

### Recipes APIs

> ✅ **已完成實作**

#### 7. 取得菜譜列表

```
GET /api/recipes
```

**Headers:**

```
Cookie: better-auth.session_token=xxx
```

**Query Parameters:**

- `search` (string, optional): 搜尋關鍵字（菜名）
- `type` (string, optional): 類型篩選 (main|side|soup|dessert)
- `mainIngredient` (string, optional): 主食材篩選 (豬|牛|雞|羊|蝦|蛋|魚|菜|其他)
- `page` (number, optional): 頁碼，預設 1
- `limit` (number, optional): 每頁筆數，預設 20，最大 100

**Response 200:**

```json
{
  "data": [
    {
      "id": "r1",
      "name": "紅蘿蔔炒蛋",
      "type": "side",
      "mainIngredient": "菜",
      "subIngredient": "紅蘿蔔",
      "servings": 4,
      "ingredientsText": "紅蘿蔔 2個\n雞蛋 3個",
      "steps": "1. 紅蘿蔔切絲\n2. 打蛋\n3. 熱鍋炒香",
      "notes": "可加入蔥花提味",
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

**Response 401:**

```json
{
  "error": "Unauthorized"
}
```

---

#### 8. 取得單一菜譜詳情

```
GET /api/recipes/:id
```

**Headers:**

```
Cookie: better-auth.session_token=xxx
```

**Response 200:**

```json
{
  "data": {
    "id": "r1",
    "name": "紅蘿蔔炒蛋",
    "type": "side",
    "mainIngredient": "菜",
    "subIngredient": "紅蘿蔔",
    "servings": 4,
    "ingredientsText": "紅蘿蔔 2個\n雞蛋 3個",
    "steps": "1. 紅蘿蔔切絲...",
    "notes": "可加入蔥花提味",
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-01T10:00:00Z"
  }
}
```

**Response 404:**

```json
{
  "error": "Recipe not found"
}
```

---

#### 9. 新增菜譜

```
POST /api/recipes
```

**Headers:**

```
Cookie: better-auth.session_token=xxx
```

**Request Body:**

```json
{
  "name": "蒜炒豬肉義大利麵",
  "type": "main",
  "mainIngredient": "豬",
  "subIngredient": "豬肉片",
  "servings": 2,
  "ingredientsText": "義大利麵 200公克\n豬肉片 150公克\n大蒜 4個\n橄欖油 2大匙",
  "steps": "1. 煮義大利麵...\n2. 炒豬肉...",
  "notes": "可依喜好調整蒜量"
}
```

**Response 201:**

```json
{
  "data": {
    "id": "r123",
    "name": "蒜炒豬肉義大利麵",
    "type": "main",
    "mainIngredient": "豬",
    "subIngredient": "豬肉片",
    "servings": 2,
    "ingredientsText": "義大利麵 200公克\n豬肉片 150公克\n大蒜 4個\n橄欖油 2大匙",
    "steps": "1. 煮義大利麵...\n2. 炒豬肉...",
    "notes": "可依喜好調整蒜量",
    "createdAt": "2025-12-12T10:00:00Z",
    "updatedAt": "2025-12-12T10:00:00Z"
  }
}
```

**Response 400:**

```json
{
  "error": "Validation failed"
}
```

---

#### 10. 更新菜譜

```
PUT /api/recipes/:id
```

**Headers:**

```
Cookie: better-auth.session_token=xxx
```

**Request Body:** (所有欄位皆為 optional)

```json
{
  "name": "蒜炒豬肉義大利麵（改良版）",
  "servings": 3,
  "notes": "加入辣椒更有風味"
}
```

**Response 200:**

```json
{
  "data": {
    "id": "r123",
    "name": "蒜炒豬肉義大利麵（改良版）",
    "type": "main",
    "servings": 3,
    "notes": "加入辣椒更有風味",
    "updatedAt": "2025-12-12T11:00:00Z"
  }
}
```

**Response 404:**

```json
{
  "error": "Recipe not found"
}
```

---

#### 11. 刪除菜譜

```
DELETE /api/recipes/:id
```

**Headers:**

```
Cookie: better-auth.session_token=xxx
```

**Response 204:** No Content

**Response 404:**

```json
{
  "error": "Recipe not found"
}
```

---

### Menu Sets APIs

> ✅ **已完成實作**

#### 資料格式說明

菜單組 API 採用**嵌入式格式**，`dishes` 作為陣列嵌入在 MenuSet 物件中：

```typescript
// API Response 格式
interface MenuSet {
  id: string
  name: string
  description?: string
  servings: number
  dishes: MenuSetDish[] // 包含 type（來自 recipe.type）
  createdAt: string
  updatedAt: string
}

interface MenuSetDish {
  recipeId: string
  type: 'main' | 'side' | 'soup' | 'dessert' // 從 recipe.type 取得
  multiplier?: number
}

// API Request 格式（POST/PUT）
interface CreateMenuSetRequest {
  name: string
  description?: string
  servings: number
  dishes: {
    recipeId: string // 只需要 recipeId
    multiplier?: number // 和 multiplier
  }[]
}
```

**重要說明**：

- **Request**: 建立/更新時只需提供 `recipeId` 和 `multiplier`，不需要 `type`
- **Response**: API 回應會自動從 `recipes.type` 取得並填入 `type` 欄位
- **原因**: 菜色類型固定等於菜譜類型，不會在不同菜單組中改變

---

#### 12. 取得菜單組列表

```
GET /api/menu-sets
```

**Headers:**

```
Cookie: better-auth.session_token=xxx
```

**Query Parameters:**

- `page` (number, optional): 頁碼，預設 1
- `limit` (number, optional): 每頁筆數，預設 20

**Response 200:**

```json
{
  "data": [
    {
      "id": "m1",
      "name": "週三暖胃餐桌",
      "description": "下班後 30 分鐘即可完成的暖暖家常菜",
      "servings": 2,
      "dishes": [
        { "recipeId": "r1", "type": "side", "multiplier": 1.0 },
        { "recipeId": "r2", "type": "main", "multiplier": 1.5 }
      ],
      "createdAt": "2025-12-20T10:00:00Z",
      "updatedAt": "2025-12-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

---

#### 13. 取得單一菜單組詳情

```
GET /api/menu-sets/:id
```

**Headers:**

```
Cookie: better-auth.session_token=xxx
```

**Response 200:**

```json
{
  "data": {
    "id": "m1",
    "name": "週三暖胃餐桌",
    "description": "下班後 30 分鐘即可完成",
    "servings": 2,
    "dishes": [
      { "recipeId": "r1", "type": "side", "multiplier": 1.0 },
      { "recipeId": "r2", "type": "main", "multiplier": 1.5 }
    ],
    "createdAt": "2025-12-20T10:00:00Z",
    "updatedAt": "2025-12-20T10:00:00Z"
  }
}
```

**Response 404:**

```json
{
  "error": "Menu set not found"
}
```

---

#### 14. 新增菜單組

```
POST /api/menu-sets
```

**Headers:**

```
Cookie: better-auth.session_token=xxx
```

**Request Body:**

```json
{
  "name": "週三暖胃餐桌",
  "description": "下班後 30 分鐘即可完成",
  "servings": 2,
  "dishes": [{ "recipeId": "r1" }, { "recipeId": "r2", "multiplier": 1.5 }]
}
```

**Response 201:**

```json
{
  "data": {
    "id": "m123",
    "name": "週三暖胃餐桌",
    "description": "下班後 30 分鐘即可完成",
    "servings": 2,
    "dishes": [
      { "recipeId": "r1", "type": "side", "multiplier": 1.0 },
      { "recipeId": "r2", "type": "main", "multiplier": 1.5 }
    ],
    "createdAt": "2025-12-20T10:00:00Z",
    "updatedAt": "2025-12-20T10:00:00Z"
  }
}
```

**說明**：回應中的 `type` 是從對應菜譜的 `type` 欄位自動填入

---

#### 15. 更新菜單組

```
PUT /api/menu-sets/:id
```

**Headers:**

```
Cookie: better-auth.session_token=xxx
```

**Request Body:** (所有欄位皆為 optional)

```json
{
  "name": "週三暖胃餐桌（更新）",
  "servings": 3,
  "dishes": [{ "recipeId": "r1" }, { "recipeId": "r3", "multiplier": 2.0 }]
}
```

**Response 200:**

```json
{
  "data": {
    "id": "m123",
    "name": "週三暖胃餐桌（更新）",
    "servings": 3,
    "dishes": [
      { "recipeId": "r1", "type": "side", "multiplier": 1.0 },
      { "recipeId": "r3", "type": "side", "multiplier": 2.0 }
    ],
    "updatedAt": "2025-12-20T11:00:00Z"
  }
}
```

**說明**：回應中的 `type` 是從對應菜譜的 `type` 欄位自動填入

---

#### 16. 刪除菜單組

```
DELETE /api/menu-sets/:id
```

**Headers:**

```
Cookie: better-auth.session_token=xxx
```

**Response 204:** No Content

**Response 404:**

```json
{
  "error": "Menu set not found"
}
```

---

### Favorites APIs

> ✅ **已完成實作** - 收藏功能已實作

#### 17. 取得收藏列表

```
GET /api/favorites
```

**Headers:**

```
Cookie: better-auth.session_token=xxx
```

**Query Parameters:**

- `page` (number, optional): 頁碼，預設 1
- `limit` (number, optional): 每頁筆數，預設 20，最大 100

**Response 200:**

```json
{
  "data": [
    {
      "recipeId": "r1",
      "recipe": {
        "id": "r1",
        "name": "紅蘿蔔炒蛋",
        "type": "side",
        "mainIngredient": "菜",
        "subIngredient": "紅蘿蔔",
        "servings": 4
      },
      "createdAt": "2025-12-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

**Response 401:**

```json
{
  "error": "Unauthorized"
}
```

---

#### 18. 新增收藏

```
POST /api/favorites
```

**Headers:**

```
Cookie: better-auth.session_token=xxx
```

**Request Body:**

```json
{
  "recipeId": "r1"
}
```

**Response 201:**

```json
{
  "data": {
    "recipeId": "r1",
    "createdAt": "2025-12-20T10:00:00Z"
  }
}
```

**Response 400:**

```json
{
  "error": "Recipe not found"
}
```

**Response 409:**

```json
{
  "error": "Recipe already in favorites"
}
```

---

#### 19. 移除收藏

```
DELETE /api/favorites/:recipeId
```

**Headers:**

```
Cookie: better-auth.session_token=xxx
```

**Response 204:** No Content

**Response 404:**

```json
{
  "error": "Favorite not found"
}
```

---

### Options APIs

> ✅ **已完成實作** - 選項資料 API

提供前端下拉選單所需的選項資料。

#### 20. 取得菜譜類型選項

```
GET /api/options/recipe-types
```

**Headers:**

```
Cookie: better-auth.session_token=xxx
```

**Response 200:**

```json
{
  "data": [
    { "value": "main", "label": "主菜" },
    { "value": "side", "label": "副菜" },
    { "value": "soup", "label": "湯" },
    { "value": "dessert", "label": "甜點" }
  ]
}
```

**Response 401:**

```json
{
  "error": "Unauthorized"
}
```

---

#### 21. 取得主食材選項

```
GET /api/options/main-ingredients
```

**Headers:**

```
Cookie: better-auth.session_token=xxx
```

**Response 200:**

```json
{
  "data": [
    { "value": "豬", "label": "豬肉" },
    { "value": "牛", "label": "牛肉" },
    { "value": "雞", "label": "雞肉" },
    { "value": "羊", "label": "羊肉" },
    { "value": "蝦", "label": "蝦類" },
    { "value": "蛋", "label": "蛋類" },
    { "value": "魚", "label": "魚類" },
    { "value": "菜", "label": "蔬菜" },
    { "value": "其他", "label": "其他" }
  ]
}
```

**Response 401:**

```json
{
  "error": "Unauthorized"
}
```

---

## 📝 資料驗證規則

### Recipe 驗證（已實作）

```typescript
const CreateRecipeSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['main', 'side', 'soup', 'dessert']),
  mainIngredient: z.enum(['豬', '牛', '雞', '羊', '蝦', '蛋', '魚', '菜', '其他']),
  subIngredient: z.string().optional(),
  servings: z.number().int().positive(),
  ingredientsText: z.string().max(5000).optional(),
  steps: z.string().max(10000).optional(),
  notes: z.string().max(1000).optional()
})
```

**驗證規則：**

- `name`: 必填，1-200 字元
- `type`: 必填，須為 main|side|soup|dessert
- `mainIngredient`: 必填，須為 豬|牛|雞|羊|蝦|蛋|魚|菜|其他
- `servings`: 必填，須為正整數
- `ingredientsText`: 選填，最多 5000 字元
- `steps`: 選填，最多 10000 字元
- `notes`: 選填，最多 1000 字元

---

## 🎨 前端資料格式對照

### Type 類型對應

```typescript
type RecipeType = 'main' | 'side' | 'soup' | 'dessert'
type MainIngredient = '豬' | '牛' | '雞' | '羊' | '蝦' | '蛋' | '魚' | '菜' | '其他'
```

### 類型標籤

```typescript
const recipeTypeLabels = {
  main: '主菜',
  side: '副菜',
  soup: '湯',
  dessert: '甜點'
}
```

### 主食材選項

```typescript
const mainIngredients = ['豬', '牛', '雞', '羊', '蝦', '蛋', '魚', '菜', '其他']
```

---

## ⚡ 效能優化

### 已實作

1. ✅ **分頁查詢** - 所有列表 API 都支援分頁
2. ✅ **索引優化** - 已對 user_id, type, main_ingredient 建立索引
3. ✅ **使用者資料隔離** - Query 自動過濾 user_id

### 規劃中

4. 📋 **快取策略** - Redis 快取推薦菜譜
5. 📋 **食材計算快取** - 菜單組食材清單計算結果快取
6. 📋 **批次查詢** - 批次取得菜譜資訊的 API

---

## 🚀 開發階段規劃

### Phase 1 - 核心功能（已完成）✅

- ✅ 使用者認證（Email + Google OAuth）
- ✅ 菜譜 CRUD 操作
- ✅ 搜尋和篩選
- ✅ 分頁功能
- ✅ 使用者資料隔離
- ✅ API 文檔（Swagger）

### Phase 2 - 菜單管理（已完成）

- ✅ 菜單組 CRUD
- ✅ 菜單組菜色管理
- ✅ Transaction 資料一致性保證
- ✅ 收藏功能
- ✅ 選項 API（主類別、主食材）
- 📋 食材清單自動計算（未實作）
- 📋 推薦菜譜系統（未實作）

### Phase 3 - 進階功能（規劃中）

- 📋 菜譜照片上傳
- 📋 菜譜評分與評論
- 📋 社群分享功能
- 📋 匯出採購清單（PDF/Excel）
- 📋 營養成分計算
- 📋 每週菜單規劃
- 📋 預算控制
- 📋 智能推薦演算法

---

## 🔗 相關文件

### 開發指南

- [API 開發指南](./API_DEVELOPMENT_GUIDE.md) - 如何創建新的 API 端點
- [Hono Recipes API 指南](./hono-recipes-api-guide.md) - Hono.js 詳細語法說明

### 環境設定

- [README.md](../README.md) - 專案說明與環境設定
- [.env.example](../.env.example) - 環境變數範例

### 線上文檔

- Swagger UI: http://localhost:8080/doc
- OpenAPI Spec: http://localhost:8080/openapi.json

---

## 📄 授權與聯絡

**專案**: FieldToTable
**版本**: 2.1
**最後更新**: 2026-01-06
**認證框架**: Better Auth
**前端框架**: React 19
**後端框架**: Hono.js

---

## 附錄：完整資料流程圖

### 認證流程

```
使用者登入
  ├─ Email/Password
  │   └─ POST /api/auth/sign-in/email → Session Cookie
  │
  └─ Google OAuth
      └─ GET /api/auth/sign-in/social
          → Google 授權頁面
          → Callback
          → Session Cookie

API 請求
  → Header: Cookie (session_token)
  → authMiddleware 驗證
  → c.get('user') 取得使用者資訊
  → 執行業務邏輯
```

### 菜譜操作流程

```
使用者 → 前端 Vue App → API Server → 資料庫

1. 瀏覽菜譜
   GET /api/recipes
   → authMiddleware 驗證
   → 查詢 WHERE user_id = current_user.id
   → 回傳菜譜列表

2. 新增菜譜
   POST /api/recipes
   → authMiddleware 驗證
   → 插入 recipes (自動加入 user_id)
   → 回傳新菜譜

3. 更新菜譜
   PUT /api/recipes/:id
   → authMiddleware 驗證
   → 更新 WHERE id = :id AND user_id = current_user.id
   → 回傳更新後的菜譜

4. 刪除菜譜
   DELETE /api/recipes/:id
   → authMiddleware 驗證
   → 刪除 WHERE id = :id AND user_id = current_user.id
   → 回傳 204 No Content
```

---

**實作狀態圖例：**

- ✅ 已完成
- 📋 規劃中
- ⚠️ 未實作
