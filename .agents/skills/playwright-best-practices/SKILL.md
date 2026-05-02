---
name: playwright-best-practices
description: Best practices for writing Playwright E2E tests. Use when the user asks to write E2E tests or when the tester agent is writing E2E tests.
---

# Playwright 最佳實踐

寫 `.spec.ts` 前掃過這份。核心原則：**role-based locator、web-first assertion、test isolation、相信 auto-wait**。

## Locator 策略

**優先順序（從好到壞）**

1. `page.getByRole('button', { name: '新增' })` — 最穩
2. `page.getByLabel('金額')` — 表單欄位
3. `page.getByText('已儲存')` — 文字可見元素
4. `page.getByTestId('expense-item')` — 需要手動加 `data-testid`
5. `page.locator('[aria-label="..."]')` — 備案
6. ❌ **不要用** CSS class / XPath — DOM 一改就爛

**Chain & filter**

```ts
page.getByRole('list').filter({ hasText: '2026 東京' }).getByRole('button', { name: '刪除' })
```

**產 locator 的工具**：`pnpm playwright codegen <url>` 可錄製操作自動產 locator，適合做骨架。

## Web-First Assertions

**永遠用會自動重試的 assertion**，不要手動檢查狀態：

```ts
// ✅ Web-first（會自動等到條件成立或 timeout）
await expect(page.getByText('100')).toBeVisible()
await expect(page.getByRole('button')).toBeEnabled()
await expect(page).toHaveURL(/.*\/trip\/\d+/)

// ❌ 手動檢查（立即回傳，容易漏）
const isVisible = await page.getByText('100').isVisible()
expect(isVisible).toBe(true)
```

**常用 assertion**：`toBeVisible`, `toBeEnabled`, `toHaveText`, `toHaveValue`, `toHaveURL`, `toHaveCount`

**soft assertion**（多個檢查不要一失敗就停）：

```ts
await expect.soft(page.getByRole('heading')).toHaveText('旅程')
await expect.soft(page.getByText('NT$')).toBeVisible()
```

## Auto-Wait

Playwright 的 locator 操作**自動等待元素可見、可互動**，不需要 `waitForTimeout` / sleep：

```ts
// ✅ 相信 auto-wait
await page.getByRole('button', { name: '送出' }).click()

// ❌ 手動 sleep
await page.waitForTimeout(1000)
await page.click('button')
```

需要等特定網路請求：

```ts
await page.waitForResponse((r) => r.url().includes('/api/expense') && r.status() === 200)
```

## Test Isolation

**每個 test 必須獨立**，不能靠前一個 test 留下的狀態：

- 用 `test.beforeEach` 做每個 test 的共同 setup（登入、導頁）
- 用 `storageState` 或 fixture 處理重複登入，別在每個 test 都點 login
- 測試資料用獨立 namespace / prefix，避免 test 間碰撞
- 不要讓 test A 的輸出當 test B 的 input — 各跑各的

```ts
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // 共用初始化
})
```

## Fixtures（進階）

用 custom fixture 封裝重複 setup：

```ts
import { test as base, type Page } from '@playwright/test'

export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('test@x.com')
    await page.getByRole('button', { name: '登入' }).click()
    await use(page)
  }
})
```

## Network Mock

- 用 `page.route()` 攔第三方 API，不要打真的外部服務
- 自家 API 優先用**穩定的 staging / test 環境**，不隨意 mock

```ts
await page.route('**/api/weather', (route) => route.fulfill({ json: { temp: 25 } }))
```

## Debugging

| 場景                     | 工具                                            |
| ------------------------ | ----------------------------------------------- |
| 本地 step-by-step debug  | `pnpm playwright test --debug`                  |
| 本地 UI mode（有時間軸） | `pnpm playwright test --ui`                     |
| 看失敗的錄影 / trace     | `pnpm playwright show-trace trace.zip`          |
| 看 HTML 報告             | `pnpm playwright show-report`                   |
| 產 test 骨架             | `pnpm playwright codegen http://localhost:3000` |
| VS Code 即時 debug       | 裝 Playwright VS Code extension                 |

**config 設 trace**（CI 失敗時自動錄）：

```ts
// playwright.config.ts
use: {
  trace: 'on-first-retry',
}
```

## 執行與效能

- **平行**：Playwright 預設檔案間平行；單檔內並行用 `test.describe.configure({ mode: 'parallel' })`
- **分片 CI**：`pnpm playwright test --shard=1/3`
- **只跑特定瀏覽器**：`--project=chromium`
- **CI 省時間**：只安裝需要的 browser `pnpm exec playwright install chromium --with-deps`

## 反模式

- ❌ 用 `page.waitForTimeout(1000)` 替代 auto-wait
- ❌ 用 CSS class 或 XPath 當主 locator
- ❌ 忘了 `await expect(...)` — 會變成沒等的 assertion
- ❌ 測第三方網站或不可控內容
- ❌ test 之間依賴（B 靠 A 留下的 cookie）
- ❌ 寫 E2E 驗 unit 層級就能驗的事（跑太慢、太脆）

## E2E 的取捨

E2E **慢、脆、貴**，原則：

- 只寫**關鍵使用者流程**（登入、建立、刪除、付款、權限）
- UI 還在試方向時**不寫** E2E — 會變維護負債
- 邏輯問題優先往 Unit / Component 推，E2E 留給跨層流程
