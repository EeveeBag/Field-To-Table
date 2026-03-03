# Auth API

## 1) Better Auth 端點（正式流程）

路徑前綴：`/api/auth/*`

此路徑由 Better Auth 原生 handler 直接處理（`app.on(['POST', 'GET'], '/api/auth/*', ...)`）。
因此回應細節會隨 Better Auth 版本更新，以下只列目前前端常用流程。

### 常用端點

- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-in/email`
- `GET /api/auth/sign-in/social?provider=google&callbackURL=<url>`
- `GET /api/auth/callback/google`
- `GET /api/auth/get-session`
- `POST /api/auth/sign-out`

### 認證狀態

- 以 Cookie Session 維持登入狀態（見 [common.md](./common.md)）。
- `GET /api/auth/get-session` 未登入時通常回傳 `null` 或未授權結果，實際內容以 Better Auth 版本為準。

## 2) 開發測試端點（僅開發用途）

路徑前綴：`/api/auth-test/*`

> 僅供 Swagger/UI 或手動測試認證流程。前端正式流程請直接用 Better Auth client SDK。

### `POST /api/auth-test/sign-in`

Request Body:

```json
{
  "email": "developer@example.com",
  "password": "********"
}
```

Response `200`:

```json
{
  "user": {
    "id": "usr_xxx",
    "name": "測試使用者",
    "email": "developer@example.com",
    "emailVerified": true,
    "image": null,
    "createdAt": "2026-03-03T00:00:00.000Z",
    "updatedAt": "2026-03-03T00:00:00.000Z"
  },
  "token": "session_token_xxx"
}
```

Response `401`:

```json
{
  "error": "Authentication failed",
  "message": "Invalid credentials"
}
```

### `GET /api/auth-test/me`

Response `200`（已登入）：

```json
{
  "authenticated": true,
  "user": {
    "id": "usr_xxx",
    "name": "測試使用者",
    "email": "developer@example.com",
    "emailVerified": true,
    "image": null,
    "createdAt": "2026-03-03T00:00:00.000Z",
    "updatedAt": "2026-03-03T00:00:00.000Z"
  },
  "session": {
    "id": "sess_xxx",
    "expiresAt": "2026-03-10T00:00:00.000Z"
  }
}
```

Response `401`（未登入）：

```json
{
  "authenticated": false,
  "user": null
}
```

### `POST /api/auth-test/sign-out`

Response `200`:

```json
{
  "success": true,
  "message": "Signed out successfully"
}
```
