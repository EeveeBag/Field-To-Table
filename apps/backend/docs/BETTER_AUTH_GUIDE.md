### Better Auth

> 身份驗證的第三方套件

1. **全端型別安全**

- 前後端共享型別定義
- 自動產生 TypeScript 型別

2. 支援多種登入方式

在這個專案中有配置：

- Email/Password 傳統帳號密碼登入
- Google OAuth 第三方登入

3. 簡化流程

- 自動處理 session 驗證（基於 cookie，不需手動帶 token）

```js
// 前端不需手動存
// 前端：登入
await fetch('http://localhost:8080/api/auth/sign-in/email', {
  method: 'POST',
  credentials: 'include', // 告訴瀏覽器自動帶 cookie
  body: JSON.stringify({ email, password })
})
// Better Auth 自動把 session 存在 cookie 裡

// 前端：API 請求
const profile = await fetch('http://localhost:8080/api/profile', {
  credentials: 'include' // 瀏覽器自動帶 cookie，不用手動寫 token
})
// 完全不需要碰 localStorage 或手動管理 token
```

- 自動設定和傳送 cookie
- 使用 httpOnly cookie（防止 XSS 攻擊）
- 簡化路由驗證（middleware 自動檢查）

4. 資料庫整合

- 自動建立 user、session、account 等資料表
- 支援多種 ORM（包含 Drizzle）

```js
// 透過 drizzleAdapter 把 Drizzle 和 Better Auth 串接起來
const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg'
  })
})
```
