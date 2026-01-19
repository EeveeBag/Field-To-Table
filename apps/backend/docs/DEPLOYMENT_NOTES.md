# 部署注意事項

## Cookie 安全前綴問題

### 問題描述

當網站從 HTTP (本地開發) 部署到 HTTPS (生產環境) 時，Better Auth 的 session cookie 名稱會發生變化：

- **本地開發 (HTTP)**：`better-auth.session_token`
- **生產環境 (HTTPS)**：`__Secure-better-auth.session_token`

這是 Better Auth 的安全特性，遵循 [Cookie `__Secure-` prefix](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#cookie_prefixes) 規範。

### 解決方案

已在 `apps/backend/src/lib/auth.ts` 中添加明確的配置：

```typescript
advanced: {
  useSecureCookies: process.env.BETTER_AUTH_URL?.startsWith('https://') ?? false,
  cookiePrefix: 'better-auth'
}
```

### 部署檢查清單

#### 1. 後端環境變數設定

確保生產環境的 `.env` 文件正確設定：

```bash
# 生產環境必須使用 HTTPS
BETTER_AUTH_URL=https://your-backend-domain.com

# 前端 URL 也必須是 HTTPS
FRONTEND_URL_PROD=https://your-frontend-domain.com

# API Base URL
API_BASE_URL=https://your-backend-domain.com
```

#### 2. 前端環境變數設定

確保前端的環境變數與後端一致：

```bash
# apps/frontend/.env.production
VITE_API_URL=https://your-backend-domain.com
```

#### 3. CORS 設定

確保 `apps/backend/src/index.ts` 的 CORS 設定包含正確的生產環境 URL：

```typescript
const allowedOrigins = [
  process.env.FRONTEND_URL_DEV, // 本地開發
  process.env.FRONTEND_URL_PROD // 生產環境
].filter((origin): origin is string => Boolean(origin))
```

#### 4. Cookie 設定要求

在 HTTPS 環境下，Cookie 會自動設定：

- `Secure` flag：只在 HTTPS 傳輸
- `SameSite=Lax`：防止 CSRF 攻擊
- `HttpOnly`：防止 XSS 攻擊
- `__Secure-` prefix：強制安全傳輸

### 常見問題排查

#### 問題：登入成功但無法取得 session

**可能原因**：

1. `BETTER_AUTH_URL` 設定錯誤（協議不匹配）
2. CORS 設定未包含前端域名
3. 前端請求未帶上 `credentials: 'include'`

**檢查步驟**：

```bash
# 1. 檢查後端環境變數
echo $BETTER_AUTH_URL
echo $FRONTEND_URL_PROD

# 2. 檢查 cookie 是否正確設定
# 在瀏覽器 DevTools > Application > Cookies 檢查

# 3. 檢查網路請求
# 在瀏覽器 DevTools > Network 檢查 /api/auth/session 請求是否帶上 Cookie
```

#### 問題：CORS 錯誤

確保：

1. 後端的 `allowedOrigins` 包含前端域名
2. 前端的 API client 設定 `credentials: 'include'`（已在 `apps/frontend/src/api/client.ts` 中設定）

#### 問題：Cookie 在跨域請求中遺失

確保：

1. 前後端都使用相同的頂級域名（例如都在 `your-domain.com` 下）
2. 或使用反向代理將前後端部署在同一域名下

### 推薦部署架構

#### 選項 1：同域名部署（推薦）

使用反向代理將前後端部署在同一域名：

```
https://your-domain.com          → Frontend
https://your-domain.com/api      → Backend API
```

優點：

- 無需處理跨域問題
- Cookie 自動傳遞
- 更簡單的部署配置

#### 選項 2：子域名部署

```
https://app.your-domain.com      → Frontend
https://api.your-domain.com      → Backend API
```

需要注意：

- 設定 `FRONTEND_URL_PROD` 和 `BETTER_AUTH_URL`
- 確保 CORS 正確配置
- Cookie 的 `SameSite` 設定

### 測試部署

部署後測試流程：

1. 清除瀏覽器 Cookie
2. 訪問前端網站
3. 執行登入操作
4. 檢查 DevTools > Application > Cookies，確認看到：
   - HTTPS：`__Secure-better-auth.session_token`
   - HTTP：`better-auth.session_token`
5. 檢查 API 請求是否自動帶上 Cookie
6. 重新整理頁面，確認 session 仍然有效

### 參考資源

- [Better Auth 文檔](https://better-auth.com)
- [Cookie Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [CORS 設定指南](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
