<!-- SPECTRA:START v1.0.1 -->

# Spectra Instructions

This project uses Spectra for Spec-Driven Development(SDD). Specs live in `openspec/specs/`, change proposals in `openspec/changes/`.

## Use `$spectra-*` skills when:

- A discussion needs structure before coding → `$spectra-discuss`
- User wants to plan, propose, or design a change → `$spectra-propose`
- Tasks are ready to implement → `$spectra-apply`
- There's an in-progress change to continue → `$spectra-ingest`
- User asks about specs or how something works → `$spectra-ask`
- Implementation is done → `$spectra-archive`

## Workflow

discuss? → propose → apply ⇄ ingest → archive

- `discuss` is optional — skip if requirements are clear
- Requirements change mid-work? `ingest` → resume `apply`

## Parked Changes

Changes can be parked（暫存）— temporarily moved out of `openspec/changes/`. Parked changes won't appear in `spectra list` but can be found with `spectra list --parked`. To restore: `spectra unpark <name>`. The `$spectra-apply` and `$spectra-ingest` skills handle parked changes automatically.

<!-- SPECTRA:END -->

# Agent Instructions

## Language

- 所有回覆請使用**繁體中文**

## Project Overview

Field-To-Table 是一個使用 Turborepo 建構的菜單規劃應用程式（monorepo），包含 React 前端與 Hono.js 後端搭配 PostgreSQL 資料庫。

## Monorepo Structure

- `apps/frontend/` - React + Vite + TanStack Router（file-based routing）
- `apps/backend/` - Hono.js API，搭配 OpenAPI/Swagger
- `packages/shared/` - 共用的 Zod schemas（前後端共用驗證）

## Tech Stack

- **Frontend**: React, Vite, TanStack Router, TanStack Query, Zustand, Tailwind CSS v4
- **Backend**: Hono.js, `@hono/zod-openapi`, Drizzle ORM, PostgreSQL
- **Auth**: Better Auth（email/password + Google OAuth）
- **Testing**: Vitest（Unit / Component）+ React Testing Library、Playwright（E2E）
- **Package Manager**: pnpm

## Testing

### 指令（皆從 `apps/frontend/` 執行）

```bash
pnpm test             # Vitest CI 模式（Unit + Component）
pnpm test:watch       # Vitest watch 模式
pnpm test:ui          # Vitest 網頁 UI（debug 失敗用）
pnpm test:e2e         # Playwright E2E
pnpm test:e2e:ui      # Playwright UI 模式（逐步重現）
```

### 測試檔案放置規則

每條測試同時有兩個維度：**Mode**（生命週期）× **Type**（工具）。

| Mode        | 意義                    | 位置                                              |
| ----------- | ----------------------- | ------------------------------------------------- |
| `once`      | 一次性驗證，**不進 CI** | `apps/frontend/tests/scratch/`                    |
| `permanent` | 長期守護，**進 CI**     | co-located `*.test.ts(x)` 或 `apps/frontend/e2e/` |

| Type                 | 工具                                                             |
| -------------------- | ---------------------------------------------------------------- |
| `Unit` / `Component` | Vitest + React Testing Library（用 `userEvent`，禁 `fireEvent`） |
| `E2E`                | Playwright                                                       |

### 規範

- 測試描述用**繁體中文**
- 遵循 AAA（Arrange → Act → Assert），一個 `it` 只驗一件事
- Mock 僅限外部 I/O（fetch、時間、fs），不 mock 被測目標自身
- 查詢優先序：`getByRole` > `getByLabelText` > `getByText` > …（`getByTestId` 是最後手段）
- 不在沒裝好測試依賴的情況下擅自 `pnpm add` — 先跟使用者確認

### Claude Code 專屬

Claude Code 環境下，使用者說「要驗這次改動 / 寫測試 / 規劃測試」時，呼叫 `@tester` subagent，它會依 diff 輸出 `[mode / type]` 標記的建議清單並撰寫對應測試。其他 agent 工具（Codex 等）沒這個子代理，就依上面的放置規則與規範直接寫。

## PR Review Guidelines

- 檢查是否有安全性問題（SQL injection、XSS、敏感資訊外洩等）
- 確認程式碼風格一致性
- 檢查型別安全性（TypeScript）
- 確認 API 端點是否有適當的認證保護
- 檢查是否有未處理的錯誤情況
