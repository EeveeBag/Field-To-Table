# 使用 Node.js 22 LTS（與專案 engines 要求一致）
FROM node:22-alpine

WORKDIR /app

# 跳過 lefthook（容器內無 .git）
ENV LEFTHOOK=0

RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

# 先複製 manifest 後裝依賴，最大化 Docker layer cache
COPY .npmrc pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# tsx 已搬到 backend dependencies，故 --prod 仍會安裝
RUN pnpm install --frozen-lockfile --prod --filter=backend...

COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

EXPOSE 8080

# 直接 exec tsx 確保 PID 1 正確處理 SIGTERM
CMD ["pnpm", "exec", "tsx", "src/index.ts"]
