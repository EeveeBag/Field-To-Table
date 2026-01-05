# Field To Table

A monorepo for frontend and backend applications using Turborepo.

## Tech Stack

- **Frontend**: React + Vite (TypeScript)
  - 路由: TanStack Router（file-based routing）
  - 錯誤追蹤: Sentry
  - 樣式: Tailwind CSS
  - 資料驗證: Zod
  - 資料請求與快取: Tanstack Query
  - 狀態管理: Zustand

- **Backend**: Hono.js + Drizzle ORM + PostgreSQL
- **Auth**: Better Auth
- **Package Manager**: pnpm v10+
- **Node**: v22+

## Project Structure

```
apps/
├── frontend/     # React + Vite (port 3000)
└── backend/      # Hono.js API (port 8080)

packages/         # Shared packages (e.g., API types for Hono RPC)
```

## Getting Started

### Prerequisites

- Node.js >= 22.20.0
- pnpm >= 10.0.0

### Installation

```bash
pnpm install
```

### Environment Setup

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with your values
```

### Development

```bash
# Run all apps
pnpm dev

# Run specific app
pnpm dev:frontend
pnpm dev:backend
```

### Build

```bash
# Build all apps
pnpm build

# Build specific app
pnpm build:frontend
pnpm build:backend
```

### Other Commands

```bash
pnpm lint         # Run ESLint
pnpm check-types  # Run TypeScript type checking
pnpm format       # Format code with Prettier
```

## Backend Database

The backend uses PostgreSQL with Drizzle ORM.

```bash
cd apps/backend

# Start local database (Docker)
docker-compose up -d

# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema directly (dev only)
pnpm db:push
```
