# 🚀 Zeabur 部署指南

## 前置準備

- ✅ GitHub 帳號（用於連接 Repository）
- ✅ Zeabur 帳號（https://zeabur.com）
- ✅ Google Cloud Console OAuth 憑證（用於 Google 登入）
- ✅ 前端測試站 URL: `https://your-frontend-domain.pages.dev/`

---

## 📦 第一步：建立 Zeabur 專案

1. 登入 [Zeabur Dashboard](https://zeabur.com/dashboard)
2. 點擊「**New Project**」
3. 輸入專案名稱：`fieldtotable-backend`
4. 選擇部署區域：
   - 推薦：**Tokyo** 或 **Singapore**（延遲較低）
5. 點擊「Create」

---

## 🗄️ 第二步：部署 PostgreSQL 資料庫

1. 在專案中點擊「**Add Service**」
2. 選擇「**Marketplace**」
3. 找到並點擊「**PostgreSQL**」
4. 點擊「Deploy」
5. 等待資料庫建立完成（約 1-2 分鐘）

### ✅ 驗證資料庫已建立

- 在 PostgreSQL 服務卡片中，點擊「**Variables**」
- 確認有 `DATABASE_URL` 環境變數（格式：`postgresql://user:pass@host:port/db`）

---

## 🔧 第三步：部署 API Service

1. 在專案中點擊「**Add Service**」
2. 選擇「**Git**」
3. 如果是第一次使用：
   - 點擊「**Configure GitHub**」
   - 授權 Zeabur 訪問你的 GitHub
4. 選擇 Repository：`FieldToTable__Backend`
5. 選擇分支：`main`（或你的主分支）
6. 點擊「Deploy」

### 🔄 Zeabur 自動執行的流程

```bash
npm ci                 # 安裝依賴
npm run build         # 編譯 TypeScript → dist/
npm run start         # 啟動 node dist/index.js
```

---

## ⚙️ 第四步：設定環境變數

### 在 API Service 中設定環境變數

1. 點擊 API Service 卡片
2. 進入「**Variables**」頁面
3. 點擊「**Add Variable**」或「**Edit Raw**」
4. 複製以下內容並**根據實際情況修改**：

```bash
PORT=8080
FRONTEND_URL_PROD=https://your-frontend-domain.pages.dev
DATABASE_URL=${POSTGRES.DATABASE_URL}
BETTER_AUTH_SECRET=DAv2Dufw2RwqaUcgH4DuH/lrclncT4zQyViLPFK4cjc=
BETTER_AUTH_URL=${ZEABUR_URL}
GOOGLE_OAUTH_CLIENT_ID=填入你的Google_Client_ID
GOOGLE_OAUTH_CLIENT_SECRET=填入你的Google_Client_Secret
```

### 🔐 環境變數說明

| 變數名稱                     | 值                                       | 說明                             |
| ---------------------------- | ---------------------------------------- | -------------------------------- |
| `PORT`                       | `8080`                                   | API 監聽端口                     |
| `FRONTEND_URL_PROD`          | `https://your-frontend-domain.pages.dev` | 前端網址（用於 CORS）            |
| `DATABASE_URL`               | `${POSTGRES.DATABASE_URL}`               | **自動連接** Zeabur PostgreSQL   |
| `BETTER_AUTH_SECRET`         | `已生成`                                 | 用於加密 session（**請勿公開**） |
| `BETTER_AUTH_URL`            | `${ZEABUR_URL}`                          | **自動取得** API 服務網址        |
| `GOOGLE_OAUTH_CLIENT_ID`     | 需填入                                   | Google OAuth 應用程式 ID         |
| `GOOGLE_OAUTH_CLIENT_SECRET` | 需填入                                   | Google OAuth 密鑰                |

5. 點擊「**Save**」
6. 服務會**自動重啟**並套用新環境變數

---

## 🌐 第五步：產生域名

1. 點擊 API Service 卡片
2. 進入「**Domain**」頁面
3. 點擊「**Generate Domain**」
4. Zeabur 會自動產生類似：
   ```
   fieldtotable-backend-xxx.zeabur.app
   ```
5. 複製此網址，這就是你的 **API Base URL**

---

## 🔄 第六步：執行資料庫遷移

部署完成後，需要初始化資料庫結構：

### 方法 A：使用 Zeabur Terminal（推薦）

1. 在 API Service 中點擊「**Logs**」旁的「**Terminal**」
2. 執行以下指令：

```bash
npm run db:push
```

### 方法 B：使用本地指令（需連接到 Zeabur 資料庫）

1. 從 Zeabur PostgreSQL 服務取得 `DATABASE_URL`
2. 在本地專案執行：

```bash
# 建立 .env.production
echo "DATABASE_URL=<複製的資料庫URL>" > .env.production

# 執行遷移
NODE_ENV=production npm run db:push
```

---

## 🎯 第七步：設定 Google OAuth

### 1. 前往 Google Cloud Console

https://console.cloud.google.com/

### 2. 建立或選擇專案

- 選擇現有專案或建立新專案
- 專案名稱：`FieldToTable`

### 3. 啟用 Google+ API

1. 左側選單 → **API 和服務** → **啟用 API 和服務**
2. 搜尋「**Google+ API**」並啟用

### 4. 建立 OAuth 2.0 憑證

1. 左側選單 → **API 和服務** → **憑證**
2. 點擊「**建立憑證**」→ 「**OAuth 用戶端 ID**」
3. 應用程式類型：**網頁應用程式**
4. 名稱：`FieldToTable Backend`
5. **已授權的 JavaScript 來源**：
   ```
   https://your-frontend-domain.pages.dev
   ```
6. **已授權的重新導向 URI**：
   ```
   https://your-api-domain.zeabur.app/api/auth/callback/google
   ```
   ⚠️ **重要**：將 `your-api-domain.zeabur.app` 替換為你的實際域名
7. 點擊「建立」
8. 複製 **用戶端 ID** 和 **用戶端密鑰**

### 5. 更新 Zeabur 環境變數

回到 Zeabur API Service 的「Variables」頁面，更新：

```bash
GOOGLE_OAUTH_CLIENT_ID=貼上你的用戶端ID
GOOGLE_OAUTH_CLIENT_SECRET=貼上你的用戶端密鑰
```

---

## ✅ 第八步：驗證部署

### 1. 測試 API 是否運行

訪問：`https://your-api-domain.zeabur.app`

預期回應：

```json
{
  "message": "FieldToTable API",
  "version": "1.0",
  "documentation": "/doc"
}
```

### 2. 測試 API 文件

訪問：`https://your-api-domain.zeabur.app/doc`

應該看到 Swagger UI 介面

### 3. 測試資料庫連接

訪問：`https://your-api-domain.zeabur.app/api/recipes`

預期回應：

```json
{
  "recipes": []
}
```

### 4. 測試 Google OAuth

1. 前端專案更新 API URL
2. 嘗試使用 Google 登入
3. 應該能成功跳轉並返回前端

---

## 🔍 常見問題排查

### ❌ 部署失敗

**查看建置日誌**：

1. 點擊 API Service → **Logs**
2. 檢查錯誤訊息

**常見原因**：

- ✅ 檢查 `package.json` 中的 `build` 和 `start` scripts
- ✅ 確認 `tsconfig.json` 正確（outDir: "dist"）
- ✅ 檢查依賴是否完整

### ❌ 500 Internal Server Error

**可能原因**：

1. **資料庫連接失敗**
   - 檢查 `DATABASE_URL` 是否設定為 `${POSTGRES.DATABASE_URL}`
   - 確認 PostgreSQL 服務正在運行

2. **環境變數缺失**
   - 確認所有必要的環境變數都已設定

3. **資料庫 Schema 未建立**
   - 執行 `npm run db:push`

### ❌ CORS 錯誤

**解決方法**：

- 確認 `FRONTEND_URL_PROD` 設定正確
- 檢查前端是否使用 `credentials: true`

### ❌ Google OAuth 失敗

**檢查清單**：

- ✅ Google Cloud Console 的重導向 URI 是否正確
- ✅ `BETTER_AUTH_URL` 是否設定為 `${ZEABUR_URL}`
- ✅ Google OAuth Client ID 和 Secret 是否正確複製

---

## 📊 監控與日誌

### 查看即時日誌

1. 點擊 API Service → **Logs**
2. 查看伺服器輸出和錯誤訊息

### 查看資料庫連接

1. 點擊 PostgreSQL Service → **Logs**
2. 查看連接狀態

---

## 🔄 更新部署

當你推送新的程式碼到 GitHub：

1. Zeabur 會**自動偵測** Git Push
2. 自動重新建置和部署
3. 在「Logs」中可以看到部署進度

### 手動重新部署

1. 點擊 API Service → **Redeploy**
2. 選擇「Redeploy」

---

## 📝 重要提醒

### ⚠️ 正式環境檢查清單

- [ ] `BETTER_AUTH_SECRET` 使用強隨機密鑰（已生成）
- [ ] Google OAuth 重導向 URI 設定正確
- [ ] `FRONTEND_URL_PROD` 指向正確的前端網址
- [ ] 資料庫遷移已執行（`npm run db:push`）
- [ ] API 測試通過
- [ ] Google 登入測試通過

### 🔐 安全性建議

1. **定期更新依賴**：`npm update`
2. **監控 Zeabur 日誌**：定期檢查異常請求
3. **不要將 `.env.zeabur` 推送到 Git**（已在 `.gitignore` 中）

---

## 🎉 完成！

你的 API 現在已經部署到 Zeabur：

- 🌐 API URL: `https://your-api-domain.zeabur.app`
- 📚 API 文件: `https://your-api-domain.zeabur.app/doc`
- 🗄️ PostgreSQL: 由 Zeabur 管理
- 🔐 Google OAuth: 已設定

下一步：

1. 更新前端專案的 API URL
2. 測試前後端整合
3. 開始開發功能！
