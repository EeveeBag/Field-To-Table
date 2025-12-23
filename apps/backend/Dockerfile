# 使用 Node.js 20 LTS（與 .node-version 一致）
FROM node:20-alpine AS builder

# 設定工作目錄
WORKDIR /app

# 複製 package 檔案
COPY package*.json ./

# 安裝依賴（使用 ci 以確保版本鎖定）
RUN npm ci

# 複製所有原始碼
COPY . .

# 編譯 TypeScript
RUN npm run build

# 生產環境映像檔
FROM node:20-alpine

WORKDIR /app

# 只複製必要的檔案
COPY package*.json ./
RUN npm ci --omit=dev

# 從 builder 階段複製編譯後的檔案
COPY --from=builder /app/dist ./dist

# 暴露端口（Zeabur 會自動處理）
EXPOSE 8080

# 啟動應用程式
CMD ["npm", "start"]
