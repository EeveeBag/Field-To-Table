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

## Git Workflow

### 處理 pnpm-lock.yaml 衝突

專案已設定 `.gitattributes`，當 `pnpm-lock.yaml` 發生合併衝突時：

```bash
# 1. 接受任一方的 lock file（選一個執行）
git checkout --theirs pnpm-lock.yaml  # 使用 main 的版本
# 或
git checkout --ours pnpm-lock.yaml    # 使用當前分支的版本

# 2. 重新生成正確的 lock file
pnpm install

# 3. 加入暫存並繼續合併
git add pnpm-lock.yaml
git merge --continue  # 或 git rebase --continue
```

**建議**：經常從 main 同步更新（`git pull --rebase origin main`）以減少衝突
