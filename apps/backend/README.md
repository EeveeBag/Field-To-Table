# FieldToTable Backend

菜單規劃系統後端 API - 使用 Hono.js + Drizzle ORM + PostgreSQL + Better Auth 構建

> 這是一個 Turborepo Monorepo 專案的後端部分，位於 `apps/backend` 目錄

## 📚 專案文件

- **[API 開發文件](./docs/API_DEVELOPMENT_GUIDE.md)** - API 需求基準 + 開發流程 + 維護規範（單一主文件）
- **[API Spec（模組化）](./docs/spec/README.md)** - 端點規格細節（按功能模組拆分）
- **[Schema 設計指南](./docs/SCHEMA_GUIDELINES.md)** - 資料庫 Schema 設計規範
- **[部署說明](./ZEABUR_DEPLOYMENT.md)** - Zeabur 部署指南

## 技術架構

- **Web 框架**: Hono.js (OpenAPI + Zod Validation)
- **ORM**: Drizzle ORM
- **資料庫**: PostgreSQL 16
- **認證**: Better Auth (Email/Password + Google OAuth)
- **開發工具**: TypeScript + tsx
- **API 文件**: Swagger UI (OpenAPI 3.1)

## 專案結構

```
apps/backend/
├── src/
│   ├── index.ts                 # 應用程式進入點
│   ├── db/
│   │   ├── index.ts            # 資料庫連接
│   │   └── schema.ts           # Drizzle Schema 定義
│   ├── lib/
│   │   ├── auth.ts             # Better Auth 設定
│   │   └── createAuthenticatedApp.ts
│   ├── middleware/
│   │   └── auth.ts             # 認證中間件
│   ├── routes/                 # API 路由
│   │   ├── auth.openapi.ts
│   │   ├── recipes.openapi.ts
│   │   ├── menu-sets.openapi.ts
│   │   ├── favorites.openapi.ts
│   │   └── options.openapi.ts
│   ├── schemas/                # Zod 驗證 Schema
│   │   ├── recipe.schema.ts
│   │   ├── menuSet.schema.ts
│   │   ├── favorite.schema.ts
│   │   └── common.schema.ts
│   └── constants/
│       └── recipe.ts           # 常數定義
├── drizzle/                    # 資料庫遷移檔案
├── docs/                       # 開發文件
├── docker-compose.yml          # Docker 設定
├── drizzle.config.ts          # Drizzle Kit 設定
├── package.json
└── tsconfig.json
```

## 快速開始

### 前置需求

- Node.js >= 22.20.0
- pnpm >= 10.0.0
- Docker 和 Docker Compose

### 1. 安裝依賴

```bash
# 在專案根目錄執行
cd /path/to/my-turborepo
pnpm install
```

### 2. 啟動 PostgreSQL 和 PGAdmin（Docker）

```bash
# 進入 backend 目錄
cd apps/backend

# 啟動資料庫和 PGAdmin
docker-compose up -d

# 查看容器狀態
docker-compose ps

# 查看日誌（可選）
docker-compose logs -f
```

### 3. 訪問服務

- **PostgreSQL**: `localhost:5432`
  - 使用者名稱: `myuser`
  - 密碼: `mypassword`
  - 資料庫名稱: `my_db`

- **PGAdmin**: http://localhost:5050
  - Email: `admin@fieldtotable.com`
  - 密碼: `admin`

<details>
<summary>🔧 如何在 PGAdmin 中連接資料庫（展開查看）</summary>

1. 打開瀏覽器訪問 http://localhost:5050
2. 使用上述的 Email 和密碼登入
3. 右鍵點擊 "Servers" → "Register" → "Server"
4. 在 "General" 標籤中，設置名稱（例如：FieldToTable Local）
5. 在 "Connection" 標籤中，填入以下資訊：
   - Host: `postgres`（容器名稱）或 `host.docker.internal`（Mac/Windows）
   - Port: `5432`
   - Maintenance database: `my_db`
   - Username: `myuser`
   - Password: `mypassword`
6. 點擊 "Save"

</details>

### 4. 設置環境變數

```bash
# 複製環境變數範例檔案
cp .env.example .env

# 編輯 .env 並設置必要的環境變數
# 特別注意：BETTER_AUTH_SECRET 需要使用以下指令生成
openssl rand -base64 32
```

### 5. 執行資料庫遷移

```bash
# 在 apps/backend 目錄執行
pnpm db:push
```

### 6. 啟動後端服務

**選項 A：只啟動後端（從 backend 目錄）**

```bash
cd apps/backend
pnpm dev
```

**選項 B：從專案根目錄啟動**

```bash
# 只啟動後端
pnpm dev:backend

# 或同時啟動前後端
pnpm dev
```

後端服務將運行在 http://localhost:8080

### 7. 訪問 API 文件

服務啟動後，可以訪問：

- **Swagger UI**: http://localhost:8080/doc - 互動式 API 測試介面
- **OpenAPI 規格**: http://localhost:8080/openapi.json - API 規格檔案
- **根路徑**: http://localhost:8080 - API 基本資訊

### 8. 停止服務

```bash
# 停止後端服務：按 Ctrl + C

# 停止 Docker 容器
cd apps/backend
docker-compose down

# 停止並刪除資料卷（會清除所有資料，請謹慎使用）
docker-compose down -v
```

## 資料庫管理

### Drizzle Kit 指令

```bash
# 在 apps/backend 目錄執行

# 生成遷移文件（基於 schema 變更）
pnpm db:generate

# 直接推送 schema 到資料庫（開發環境適用）
pnpm db:push

# 執行遷移文件（生產環境建議使用）
pnpm db:migrate
```

### 使用 psql 直接查詢資料庫

```bash
# 進入 PostgreSQL 容器
docker exec -it fieldtotable-postgres psql -U myuser -d my_db

# 常用查詢
SELECT * FROM "user";
SELECT * FROM recipes;
SELECT * FROM menu_sets;

# 離開 psql
\q
```

### 查看資料庫 Schema

可以使用 PGAdmin（見上方「訪問服務」章節）或直接使用 psql：

```bash
# 列出所有資料表
docker exec -it fieldtotable-postgres psql -U myuser -d my_db -c "\dt"

# 查看特定資料表結構
docker exec -it fieldtotable-postgres psql -U myuser -d my_db -c "\d recipes"
```

## 新增測試用戶

### 使用 curl 新增用戶

```bash
curl -X POST http://localhost:8080/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@example.com",
    "password": "dev123456",
    "name": "Developer"
  }'
```

### 驗證用戶註冊成功

**方法 1：使用 PGAdmin 查看**

1. 打開 http://localhost:5050 並登入
2. 展開 Server → Databases → `my_db` → Schemas → public → Tables
3. 右鍵點擊 `user` → View/Edit Data → All Rows

**方法 2：使用 SQL 查詢**

```bash
docker exec -it fieldtotable-postgres psql -U myuser -d my_db -c 'SELECT id, name, email, created_at FROM "user";'
```

## 前端串接

本專案使用 **Better Auth** 進行身份驗證，支援：

- ✅ Email/Password 登入
- ✅ Google OAuth 登入

前端應用位於 `apps/frontend` 目錄，使用 Better Auth Client 與後端通訊。

### Better Auth Client 設置範例

```typescript
// 前端專案中設置 auth client
import { createAuthClient } from 'better-auth/client'

export const authClient = createAuthClient({
  baseURL: process.env.VITE_API_URL || 'http://localhost:8080'
})
```

### API 使用範例

```typescript
// Email/Password 註冊
await authClient.signUp.email({
  email: 'user@example.com',
  password: 'password123',
  name: 'User Name'
})

// Email/Password 登入
await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password123'
})

// Google OAuth 登入
await authClient.signIn.social({
  provider: 'google',
  callbackURL: '/dashboard'
})

// 登出
await authClient.signOut()

// 取得當前 session
const session = await authClient.getSession()
```

### 重要說明

- **Session Cookie**: 自動儲存在 HttpOnly Cookie 中
  - 開發環境 (HTTP): `better-auth.session_token`
  - 生產環境 (HTTPS): `__Secure-better-auth.session_token`
- **CSRF 保護**: Better Auth Client 自動處理
- **Google OAuth**: 需在 Google Cloud Console 設定 OAuth 應用程式

## 開發指令

```bash
# 在 apps/backend 目錄執行

# 開發模式（hot reload）
pnpm dev

# 建置專案
pnpm build

# 執行建置後的程式
pnpm start

# 程式碼檢查
pnpm lint

# 型別檢查
pnpm check-types

# 資料庫相關
pnpm db:generate    # 生成 migration 檔案
pnpm db:push        # 推送 schema 到資料庫
pnpm db:migrate     # 執行 migration
pnpm db:migrate:prod # 執行 migrate 並驗證雲端版本是否同步
```

## 環境變數說明

複製 `.env.example` 建立 `.env` 檔案：

```bash
cp .env.example .env
```

主要環境變數：

| 變數名稱                     | 說明                | 範例值                                              |
| ---------------------------- | ------------------- | --------------------------------------------------- |
| `PORT`                       | 伺服器端口          | `8080`                                              |
| `DATABASE_URL`               | PostgreSQL 連接字串 | `postgres://myuser:mypassword@127.0.0.1:5432/my_db` |
| `BETTER_AUTH_SECRET`         | 認證密鑰（必須）    | 使用 `openssl rand -base64 32` 生成                 |
| `BETTER_AUTH_URL`            | 後端 URL            | 開發: `http://localhost:8080`                       |
| `FRONTEND_URL`               | 前端 URL（單一環境）| `https://localhost:3000`                            |
| `FRONTEND_URL_DEV`           | 前端 URL（本地開發）| `https://localhost:3000`                            |
| `FRONTEND_URL_PROD`          | 前端 URL（生產環境）| `https://your-domain.com`                           |
| `GOOGLE_OAUTH_CLIENT_ID`     | Google OAuth ID     | 從 Google Cloud Console 取得                        |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth Secret | 從 Google Cloud Console 取得                        |
| `LOG_LEVEL`                  | 日誌等級            | `trace`, `debug`, `info`, `warn`, `error`, `fatal`  |

## 資料庫 Schema 概覽

### 認證相關資料表

- **user** - 使用者資料
- **session** - 登入 Session
- **account** - OAuth 帳號連結
- **verification** - Email 驗證碼

### 應用程式資料表

- **recipes** - 菜譜資料
- **menu_sets** - 菜單組
- **menu_set_dishes** - 菜單組與菜譜的關聯
- **favorites** - 使用者收藏的菜譜

詳細的 Schema 說明請參考 [API 需求規格](./docs/API_REQUIREMENTS.md)

## 常見問題

### 1. Docker 容器無法啟動

```bash
# 檢查端口是否被佔用
lsof -i :5432
lsof -i :5050

# 清除舊容器
docker-compose down -v
docker-compose up -d
```

### 2. 資料庫連接失敗

確認 `.env` 中的 `DATABASE_URL` 設定正確：

```
DATABASE_URL=postgres://myuser:mypassword@127.0.0.1:5432/my_db
```

### 3. Better Auth Secret 未設定

```bash
# 生成新的 secret
openssl rand -base64 32

# 將結果複製到 .env 的 BETTER_AUTH_SECRET
```

### 4. CORS 錯誤

確認 `.env` 中的前端 URL 與實際環境一致：

```
FRONTEND_URL=https://localhost:3000
FRONTEND_URL_DEV=https://localhost:3000
FRONTEND_URL_PROD=https://your-domain.com
```

## 部署

本專案支援多種部署方式：

- **Zeabur**: 請參考 [ZEABUR_DEPLOYMENT.md](./ZEABUR_DEPLOYMENT.md)
- **Docker**: 專案根目錄提供 Dockerfile
- **其他平台**: 支援任何 Node.js 運行環境

### 生產環境注意事項

1. 設定強度足夠的 `BETTER_AUTH_SECRET`
2. 使用 HTTPS（`BETTER_AUTH_URL` 必須以 https:// 開頭）
3. 設定正確的 CORS `FRONTEND_URL` 或 `FRONTEND_URL_PROD`
4. 建議使用 `pnpm db:migrate` 而非 `pnpm db:push`
5. 檢查 PostgreSQL 連接安全性

## 相關連結

- [Hono 官方文件](https://hono.dev/)
- [Drizzle ORM 文件](https://orm.drizzle.team/)
- [Better Auth 文件](https://www.better-auth.com/)
- [OpenAPI 規範](https://spec.openapis.org/oas/v3.1.0)
