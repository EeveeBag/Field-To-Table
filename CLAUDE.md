<!-- SPECTRA:START v1.0.1 -->

# Spectra Instructions

This project uses Spectra for Spec-Driven Development(SDD). Specs live in `openspec/specs/`, change proposals in `openspec/changes/`.

## Use `/spectra:*` skills when:

- A discussion needs structure before coding → `/spectra:discuss`
- User wants to plan, propose, or design a change → `/spectra:propose`
- Tasks are ready to implement → `/spectra:apply`
- There's an in-progress change to continue → `/spectra:ingest`
- User asks about specs or how something works → `/spectra:ask`
- Implementation is done → `/spectra:archive`

## Workflow

discuss? → propose → apply ⇄ ingest → archive

- `discuss` is optional — skip if requirements are clear
- Requirements change mid-work? Plan mode → `ingest` → resume `apply`

## Parked Changes

Changes can be parked（暫存）— temporarily moved out of `openspec/changes/`. Parked changes won't appear in `spectra list` but can be found with `spectra list --parked`. To restore: `spectra unpark <name>`. The `/spectra:apply` and `/spectra:ingest` skills handle parked changes automatically.

<!-- SPECTRA:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Field-To-Table is a menu planning application built as a monorepo using Turborepo. The project consists of a React frontend and a Hono.js backend with PostgreSQL database.

## Commands

### Development

```bash
pnpm dev              # Run all apps (frontend on https://localhost:3000, backend on http://localhost:8080)
pnpm dev:frontend     # Run frontend only
pnpm dev:backend      # Run backend only
```

### Build & Quality

```bash
pnpm build            # Build all apps
pnpm lint             # Run ESLint across all apps
pnpm check-types      # Run TypeScript type checking
pnpm format           # Format code with Prettier
```

### Testing (from apps/frontend/)

```bash
pnpm test             # Run Vitest (Unit + Component) in CI mode
pnpm test:watch       # Vitest watch mode
pnpm test:ui          # Vitest web UI（debug 失敗用）
pnpm test:e2e         # Run Playwright E2E
pnpm test:e2e:ui      # Playwright UI mode（逐步重現）
```

### Database (from apps/backend/)

```bash
cd apps/backend
docker-compose up -d          # Start PostgreSQL and pgAdmin
pnpm db:generate              # Generate Drizzle migrations
pnpm db:migrate               # Run migrations
pnpm db:push                  # Push schema directly (dev only)
```

## Architecture

### Monorepo Structure

- `apps/frontend/` - React + Vite + TanStack Router (file-based routing)
- `apps/backend/` - Hono.js API with OpenAPI/Swagger support
- `packages/shared/` - Shared Zod schemas for validation (used by both apps)

### Backend Architecture

- **Framework**: Hono.js with `@hono/zod-openapi` for type-safe OpenAPI routes
- **Database**: PostgreSQL with Drizzle ORM (`apps/backend/src/db/schema.ts`)
- **Auth**: Better Auth with email/password and Google OAuth
- **Routes**: OpenAPI routes in `apps/backend/src/routes/*.openapi.ts`
- **Auth middleware**: Use `createAuthenticatedApp()` from `src/lib/createAuthenticatedApp.ts` for protected routes
- **API docs**: Swagger UI at `/doc`, OpenAPI spec at `/openapi.json`

### Frontend Architecture

- **Routing**: TanStack Router with file-based routes in `src/routes/`
- **API Client**: Hono RPC client (`src/api/client.ts`) for type-safe API calls - imports backend types directly via `@repo/backend` alias
- **State**: TanStack Query for server state, Zustand for client state
- **Styling**: Tailwind CSS v4

### Type Sharing

The backend exports `AppType` from `apps/backend/src/index.ts`, which the frontend imports to get full type inference for API calls via Hono's RPC client.

### Environment Setup

Backend requires `.env` file - copy from `apps/backend/.env.example` and configure:

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Auth secret key
- `BETTER_AUTH_URL` - Backend URL (affects cookie security)
- `FRONTEND_URL_DEV` / `FRONTEND_URL_PROD` - Frontend URLs for CORS
- Google OAuth credentials (optional)

## Rules

### Third-Party Package Issue Handling

For ANY question involving third-party packages, libraries, frameworks, or tools (including npm packages, UI libraries, build tools, lint tools, etc.), ALWAYS apply the `.claude/skills/package-issue-sop/SKILL.md` workflow and output format FIRST. Skip this SOP only if the user explicitly says "don't use SOP" or similar.

### Testing Workflow

使用者說「要驗這次改動 / 要寫測試 / 規劃測試」時，呼叫 `@tester` subagent。tester 會：

1. 用 diff 分析改動 → 輸出建議清單，每條標 `[mode / type]`
2. 跟使用者釐清邊界與規則
3. 確認後依維度撰寫：
   - Type `Unit` / `Component` → Vitest + `vitest-best-practices` skill
   - Type `E2E` → Playwright + `playwright-best-practices` skill
   - Mode `once` → `apps/frontend/tests/scratch/`
   - Mode `permanent` → co-located `*.test.ts(x)` 或 `apps/frontend/e2e/`
4. 執行並提示失敗診斷（`show-trace` / `--ui`）

除非使用者主動要求，否則**不要自動呼叫** tester — 等使用者決定「要驗」再啟動。
