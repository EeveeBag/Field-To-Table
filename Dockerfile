# 使用 Node.js 22 LTS（與專案 engines 要求一致）
FROM node:22-alpine AS builder

# 設定工作目錄
WORKDIR /app

# 安裝 pnpm
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

# 複製 workspace 配置檔案
COPY .npmrc ./
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# 複製 packages/shared 的 package.json
COPY packages/shared/package.json ./packages/shared/

# 複製 backend 的 package.json
COPY apps/backend/package.json ./apps/backend/

# 安裝所有依賴（包含 workspace 依賴）
RUN pnpm install --frozen-lockfile

# 複製 shared package 原始碼並編譯
COPY packages/shared ./packages/shared
RUN pnpm --filter=@repo/shared build

# 複製 backend 原始碼
COPY apps/backend ./apps/backend

# 編譯 TypeScript
RUN pnpm --filter=backend build

# 生產環境映像檔
FROM node:22-alpine

WORKDIR /app

# 安裝 pnpm
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

# 複製 workspace 配置檔案
COPY .npmrc ./
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# 複製 packages/shared 的 package.json
COPY packages/shared/package.json ./packages/shared/

# 複製 backend 的 package.json
COPY apps/backend/package.json ./apps/backend/

# 只安裝生產依賴（使用 ... 語法包含 workspace 依賴）
RUN pnpm install --frozen-lockfile --prod --filter=backend...

# 從 builder 階段複製 shared package 編譯後的檔案
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# 從 builder 階段複製 backend 編譯後的檔案
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# 設定工作目錄為 backend
WORKDIR /app/apps/backend

# 暴露端口（Zeabur 會自動處理）
EXPOSE 8080

# 啟動應用程式
CMD ["pnpm", "start"]
