# FieldToTable Backend

菜單規劃系統後端 API - 使用 Hono.js + Drizzle ORM + PostgreSQL + Better Auth 構建

## 📚 專案文件

- **[API 需求規格](./docs/API_REQUIREMENTS.md)** - API 功能需求和資料表設計
- **[API 開發指南](./docs/API_DEVELOPMENT_GUIDE.md)** - 新增 API 端點的開發指南

## 快速開始

### 1. 啟動 PostgreSQL 和 PGAdmin（Docker）

首先，確保你已安裝 Docker 和 Docker Compose。

```bash
# 啟動資料庫和 PGAdmin
docker-compose up -d

# 查看容器狀態
docker-compose ps

# 查看日誌
docker-compose logs -f
```

### 2. 訪問服務

- **PostgreSQL**: `localhost:5432`
  - 使用者名稱: `myuser`
  - 密碼: `mypassword`
  - 資料庫名稱: `my_db`

- **PGAdmin**: http://localhost:5050
  - Email: `admin@fieldtotable.com`
  - 密碼: `admin`

### 3. 在 PGAdmin 中連接資料庫

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

### 4. 安裝依賴並啟動後端服務

```bash
npm install
npm run dev
```

後端服務將運行在 http://localhost:8080

### 5. 訪問 API 文件

服務啟動後，可以訪問：

- **Swagger UI**: http://localhost:8080/doc - 互動式 API 測試介面
- **OpenAPI 規格**: http://localhost:8080/openapi.json - API 規格檔案
- **根路徑**: http://localhost:8080 - API 基本資訊

### 6. 停止服務

```bash
# 停止 Docker 容器
docker-compose down

# 停止並刪除資料卷（會清除所有資料）
docker-compose down -v
```

## 資料庫管理

### 執行資料庫遷移（如果使用 Drizzle Kit）

```bash
# 生成遷移文件
npx drizzle-kit generate

# 執行遷移
npx drizzle-kit push
```

### 直接連接 PostgreSQL（使用 psql）

```bash
docker exec -it fieldtotable-postgres psql -U myuser -d my_db
```

## 常用指令

```bash
# 開發模式（熱重載）
npm run dev

# 建置專案
npm run build

# 生成資料庫遷移檔案
npx drizzle-kit generate

# 推送 schema 變更到資料庫
npx drizzle-kit push

# 開啟 Drizzle Studio（資料庫 GUI）
npx drizzle-kit studio
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

### 在 pgAdmin 中查看新增的用戶

1. 打開 http://localhost:5050 並登入
2. 展開你的 Server → Databases → `my_db` → Schemas → public → Tables
3. 找到 `user` 表
4. 右鍵點擊 `user` → **View/Edit Data** → **All Rows**
5. 你會看到所有註冊的用戶資料，包括：
   - `id`: 用戶唯一識別碼
   - `name`: 用戶名稱
   - `email`: 電子郵件
   - `email_verified`: 是否已驗證
   - `created_at`: 建立時間
   - `updated_at`: 更新時間

### 使用 SQL 查詢用戶

也可以直接使用 psql 查詢：

```bash
# 進入 PostgreSQL 容器
docker exec fieldtotable-postgres psql -U myuser -d my_db

# 查詢所有用戶
SELECT id, name, email, created_at FROM "user";

# 查詢特定用戶
SELECT * FROM "user" WHERE email = 'developer@example.com';

# 離開 psql
\q
```

## 前端串接認證

本專案使用 **Better Auth** 進行身份驗證，支援：

- ✅ Email/Password 登入
- ✅ Google OAuth 登入

### 安裝 Better Auth Client

```bash
npm install better-auth
```

### 建立 Auth Client

```typescript
// lib/auth-client.ts
import { createAuthClient } from 'better-auth/client'

export const authClient = createAuthClient({
  baseURL: 'http://localhost:8080', // 後端 API 位置
})
```

### 使用範例

```typescript
import { authClient } from './lib/auth-client'

// 1. Email/Password 註冊
await authClient.signUp.email({
  email: 'user@example.com',
  password: 'password123',
  name: 'User Name',
})

// 2. Email/Password 登入
await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password123',
})

// 3. Google OAuth 登入
await authClient.signIn.social({
  provider: 'google',
  callbackURL: '/dashboard', // 登入成功後的導向頁面
})

// 4. 登出
await authClient.signOut()

// 5. 取得當前使用者 session
const session = await authClient.getSession()
```

### React 整合（選用）

如果使用 React，可以安裝 React 套件：

```bash
npm install @better-auth/react
```

使用 hooks：

```typescript
import { useSession, signIn, signOut } from '@better-auth/react';

function App() {
  const { data: session, isPending } = useSession();

  return (
    <div>
      {session ? (
        <button onClick={() => signOut()}>登出</button>
      ) : (
        <button onClick={() => signIn.social({ provider: 'google' })}>
          使用 Google 登入
        </button>
      )}
    </div>
  );
}
```

### 重點提醒

- 🔐 Session 自動儲存在 **HttpOnly Cookie** 中
  - HTTP 環境：`better-auth.session_token`
  - HTTPS 環境：`__Secure-better-auth.session_token`（自動添加安全前綴）
- 🔄 使用 Better Auth client 會自動處理 session 和 CSRF 保護
- 🌐 Google OAuth 需要在 Google Cloud Console 設定 OAuth 應用程式

## 環境變數

複製 `.env.example` 到 `.env` 並根據需要修改配置：

```bash
cp .env.example .env
```
