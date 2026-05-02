---
name: vitest-best-practices
description: Best practices for writing Vitest unit and component tests. Use when the user asks to write Vitest tests or when the tester agent is writing unit / component tests.
---

# Vitest 最佳實踐

寫 Vitest test 前掃過這份。核心原則：**驗行為不驗實作、不過度 mock、覆蓋邊界**。

## 結構與組織

- **AAA 模式**：`// Arrange` → `// Act` → `// Assert`，三段清楚
- `describe(...)` 分群、`it(...)` 描述**行為**（不是函式名）
  - ❌ `it('test calcSplit')`
  - ✅ `it('應該把金額平均分給每位成員')`
- 一個 test 只驗一件事
- 檔案命名依專案慣例：`*.test.ts` 或 `*.spec.ts`
- Unit / Component test 檔通常放在被測檔案旁：
  ```
  utils/calc.ts
  utils/calc.test.ts
  ```
  除非專案慣例是 `tests/unit/` 集中式。

## Locator 與查詢（Component Test）

- 優先用**可見文字 / role / label** 查找元素
  - `@testing-library/vue` / `@testing-library/react`：`getByRole`, `getByText`, `getByLabelText`
  - Vue Test Utils：`wrapper.find('[data-testid="..."]')` 搭配 `data-testid`
- 避免用 CSS class name 或實作細節的 selector（DOM 一改就爛）
- 需要 E2E 層級的互動（多頁切換、真 browser）請改用 Playwright

## Mock 策略

- **只 mock 外部依賴**（第三方 API、檔案系統、時間、network）
  ```ts
  vi.mock('axios')
  vi.mock('node:fs')
  vi.useFakeTimers()
  ```
- **不 mock 被測對象本身**，也不 mock 其直接相依的函式
- Spy 用 `vi.spyOn()`，收尾時 `vi.restoreAllMocks()`
- Store（Pinia / Zustand）原則上用真實 store + 初始化資料；只在極端情境 mock
- **過度 mock 反而讓 test 保護性變差** — 寧可寫 integration 層級，用真依賴

## Async 與 Promise

- Async test 一定 `await`：
  ```ts
  await expect(fetchUser()).resolves.toMatchObject({ id: 1 })
  await expect(fetchUser()).rejects.toThrow('not found')
  ```
- `Promise` 沒 `await` → Vitest 會報 Unhandled Rejection
- 測 timer 用 `vi.useFakeTimers()` + `vi.advanceTimersByTime(1000)`，不要真的等時間

## Setup / Teardown

- **共用初始化**：`beforeEach` 每個 test 前重置狀態，避免 test 間互相汙染
- **高成本的一次性設定**：`beforeAll`
- **收尾**：`afterEach` 清 mock、清 DOM（JSDOM）、清 timer

```ts
afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})
```

## 覆蓋邊界

寫 test 時主動想這些情境：

| 類別     | 具體 case                             |
| -------- | ------------------------------------- |
| 空值     | `null`, `undefined`, `''`, `[]`, `{}` |
| 邊界數字 | `0`, `-1`, `Number.MAX_SAFE_INTEGER`  |
| 錯誤路徑 | API 失敗、驗證失敗、權限不足          |
| 異常資料 | 重複、超長字串、特殊字元、中英混雜    |

Happy path 是最低標準，**邊界 case 才是 test 真正的價值**。

## 執行與效能

- `pnpm vitest run` 跑一次（CI / 驗證用）
- `pnpm vitest` watch 模式（開發用）
- `--changed` 只跑改過的 test
- `--related <file>` 跑跟某檔相關的 test
- 預設平行（`threads`）；遇到原生模組 / native fetch 相關 segfault，切 `pool: 'forks'` 或 `vmForks`

## 常見陷阱

- **import 路徑**：Vitest 不自動吃 `tsconfig.json` 的 `baseUrl` / `paths`；用 `vite-tsconfig-paths` plugin 或改相對路徑
- **package exports / conditions**：monorepo 或自訂 exports 要在 config 的 `ssr.resolve.conditions` 加上
- **Flaky test**：不要 skip，找根因（通常是 race condition / 外部依賴 / 狀態殘留）
- **過度複雜的 test**：拆成多個小 test，每個只驗一件事

## 反模式

- ❌ `describe('calcSplit', () => it('works'))` — 描述毫無資訊
- ❌ 一個 test 裡放 20 行操作 + 10 個 expect
- ❌ 把內部函式 mock 掉只為了讓 test 過
- ❌ `console.log` 當 assertion
- ❌ 寫 test 只為拉覆蓋率，沒實際驗證行為
