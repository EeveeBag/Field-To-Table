# Common Spec

## Base URL

- 開發環境預設：`http://localhost:8080`
- 實際 server URL 由 `API_BASE_URL` 或 `PORT` 決定。

## 文件端點

- Swagger UI：`GET /doc`
- OpenAPI JSON：`GET /openapi.json`

## 認證方式

受保護端點（`/api/recipes`、`/api/menu-sets`、`/api/favorites`、`/api/options`）採用 Cookie Session。

- HTTP 開發環境 Cookie：`better-auth.session_token`
- HTTPS 環境 Cookie：`__Secure-better-auth.session_token`

未登入時統一回應：

```json
{
  "error": "Unauthorized"
}
```

狀態碼：`401`

## 共用回應格式

### 單筆資料

```json
{
  "data": {}
}
```

### 分頁列表

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0
  }
}
```

## 錯誤格式

多數業務錯誤使用：

```json
{
  "error": "Error message"
}
```

部分開發測試端點（`/api/auth-test/*`）會包含 `message`：

```json
{
  "error": "Authentication failed",
  "message": "Invalid credentials"
}
```

## 時間格式

API 回傳時間欄位使用 ISO 8601 字串，例如：`2025-12-13T12:48:07.060Z`。
