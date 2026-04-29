# 使用 Node.js 22 LTS（與專案 engines 要求一致）
FROM node:22-alpine

WORKDIR /app

# 跳過 lefthook（容器內無 .git，且不需要 git hook）
ENV LEFTHOOK=0

# 安裝 pnpm
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

# 先複製 workspace manifest，最大化 layer cache
COPY .npmrc pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# 只安裝生產依賴（包含 backend 的 workspace 依賴 @repo/shared）
# tsx 已在 backend dependencies，--prod 也會被裝進來
RUN pnpm install --frozen-lockfile --prod --filter=backend...

# 複製 source（沒有 build 步驟，tsx 直接吃 src/）
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

EXPOSE 8080

# tsx src/index.ts
CMD ["pnpm", "start"]
