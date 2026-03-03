# FieldToTable API 開發文件

> 本文件是 Backend API 的唯一主文件，整合「需求基準 + 開發流程 + 維護規範」。
> 最後更新：2026-03-03

---

## 1. 文件範圍

本文件只涵蓋 API 設計與實作規範，不重複說明專案啟動、Docker、資料庫連線等環境操作。

- 環境與啟動方式：請看 [../README.md](../README.md)
- API 端點詳細規格：請看 [./spec/README.md](./spec/README.md)

---

## 2. 需求基準（Product Baseline）

### 2.1 功能範圍

- 認證：Email/Password、Google OAuth、Session Cookie
- Recipes：CRUD + 搜尋/篩選 + 分頁
- Menu Sets：CRUD + dishes 管理（transaction）
- Favorites：列表、新增、刪除（含重複收藏檢查）
- Options：前端下拉/篩選所需的選項資料

### 2.2 安全與資料隔離

- 以下路徑必須登入：
  - `/api/recipes/*`
  - `/api/menu-sets/*`
  - `/api/favorites/*`
  - `/api/options/*`
- 所有查詢必須做 user 隔離：`user_id = current_user.id`
- 所有輸入（params/query/body）必須經 Zod 驗證

### 2.3 回應一致性

- 單筆回應：`{ data: ... }`
- 列表回應：`{ data: [...], pagination: { page, limit, total } }`
- 錯誤回應：`{ error: string }`
- 時間欄位：ISO 8601 字串

---

## 3. 實作架構

### 3.1 目錄責任

- `apps/backend/src/routes/*.openapi.ts`
  - Route 定義與 handler
- `apps/backend/src/schemas/*.schema.ts`
  - Backend schema（含 OpenAPI metadata）
- `packages/shared/src/schemas/*.schema.ts`
  - 前後端共用驗證 schema（純驗證）
- `apps/backend/src/db/schema/*.ts`
  - Drizzle DB schema
- `apps/backend/docs/spec/*.md`
  - 模組化 API Spec 文件

### 3.2 認證模式

- 需登入模組使用 `createAuthenticatedApp()`
- `/api/auth/*` 由 Better Auth handler 直接處理
- `/api/auth-test/*` 僅供開發測試（Swagger/manual）

---

## 4. API Spec 維護策略

### 4.1 單一真相來源

- 程式碼真相：`src/routes` + `src/schemas`
- 文件真相：`docs/spec/*.md`

### 4.2 模組文件

- [./spec/common.md](./spec/common.md)
- [./spec/auth.md](./spec/auth.md)
- [./spec/recipes.md](./spec/recipes.md)
- [./spec/menu-sets.md](./spec/menu-sets.md)
- [./spec/favorites.md](./spec/favorites.md)
- [./spec/options.md](./spec/options.md)

### 4.3 變更原則

1. 先改 route/schema/db
2. 再更新對應 `spec/<module>.md`
3. 確認狀態碼、欄位、enum 與實作一致

---

## 5. 標準開發流程

### 步驟 1：調整資料模型（必要時）

- 修改：`src/db/schema/*.ts`
- 重點：欄位命名、FK、UNIQUE、index、nullable 設計

### 步驟 2：調整驗證 schema

- 共用規則：`packages/shared/src/schemas/*.schema.ts`
- Backend OpenAPI：`src/schemas/*.schema.ts`

### 步驟 3：調整 route 與 handler

- 檔案：`src/routes/*.openapi.ts`
- 必做：
  - 使用 `c.req.valid(...)`
  - user 隔離條件完整
  - 回應欄位符合 schema
  - 狀態碼符合 responses 宣告

### 步驟 4：註冊路由（新模組才需要）

- 修改：`src/index.ts`
- 以鏈式 `.route('/api/xxx', xxxRoute)` 註冊

### 步驟 5：同步 API Spec

- 更新 `docs/spec/<module>.md`
- 若有共通格式變更，先改 `docs/spec/common.md`

---

## 6. Definition of Done（API）

以下全部成立才算完成：

- 功能符合需求基準（第 2 章）
- 認證與 user 隔離正確
- schema / route / handler 一致
- `docs/spec` 已同步
- 型別檢查與 lint 通過（若本次有修改到程式碼）

---

## 7. 實作參考

- [./SCHEMA_GUIDELINES.md](./SCHEMA_GUIDELINES.md)
- [./BETTER_AUTH_GUIDE.md](./BETTER_AUTH_GUIDE.md)
- [./spec/README.md](./spec/README.md)
