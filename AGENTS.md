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
- **Package Manager**: pnpm

## PR Review Guidelines

- 檢查是否有安全性問題（SQL injection、XSS、敏感資訊外洩等）
- 確認程式碼風格一致性
- 檢查型別安全性（TypeScript）
- 確認 API 端點是否有適當的認證保護
- 檢查是否有未處理的錯誤情況
