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
