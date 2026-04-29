# Field To Table

這是一個使用 Turborepo 管理的 monorepo，包含前端與後端應用程式。

## 技術棧

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

## 專案結構

```
apps/
├── frontend/     # React + Vite（3000 port）
└── backend/      # Hono.js API（8080 port）

packages/         # 共用套件（例如 Hono RPC 的 API 型別）
```

## Agent Skills 管理

此專案以 `.agents/skills/` 作為 skills 的唯一來源目錄，`.claude/skills` 不維護獨立內容，而是透過軟連結指向 `../.agents/skills`。

- 新增、編輯、刪除 skills 時，應以 `.agents/skills/` 為主
- `.claude/skills` 的內容應與 `.agents/skills/` 保持一致，因為它只是 symlink 映射

### 導入共用 Skills

共用 [Skills CLI](https://github.com/vercel-labs/skills) 透過以下指令導入：

```bash
pnpm dlx skills add EeveeBag/Eevee-Skills
```

共用 skills 的來源為 GitHub 專案：
[Eevee-Skills](https://github.com/EeveeBag/Eevee-Skills)

### 維護規則

1. 先用 `pnpm dlx skills add EeveeBag/Eevee-Skills` 導入或更新共用 skills
2. 以 `.agents/skills/` 作為實際維護位置
3. 保持 `.claude/skills -> ../.agents/skills` 的軟連結結構，不要把 `.claude/skills` 改回實體資料夾
4. 提交變更時，應以 `.agents/skills/*` 與 `.claude/skills` 這個 symlink 的組合為準

## 開始使用

### 前置需求

- Node.js >= 22.20.0
- pnpm >= 10.0.0

### 安裝

```bash
pnpm install
```

### 環境設定

```bash
# 後端
cp apps/backend/.env.example apps/backend/.env
# 依需求編輯 apps/backend/.env
```

### 開發

```bash
# 啟動所有應用
pnpm dev

# 啟動指定應用
pnpm dev:frontend
pnpm dev:backend
```

### 建置

```bash
# 建置所有應用
pnpm build

# 建置 frontend（backend 採 tsx，無需 build）
pnpm build:frontend
```

### 其他常用指令

```bash
pnpm lint         # 執行 ESLint
pnpm check-types  # 執行 TypeScript 型別檢查
pnpm format       # 使用 Prettier 格式化程式碼
```

## 後端資料庫

後端使用 PostgreSQL 與 Drizzle ORM。

```bash
cd apps/backend

# 啟動本機資料庫（Docker）
docker-compose up -d

# 產生 migration
pnpm db:generate

# 執行 migration
pnpm db:migrate

# 直接推送 schema（僅限開發環境）
pnpm db:push
```

## Git 工作流程

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
