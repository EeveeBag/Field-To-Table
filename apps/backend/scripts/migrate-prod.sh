#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
JOURNAL_PATH="${BACKEND_DIR}/drizzle/meta/_journal.json"

cd "${BACKEND_DIR}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "錯誤：未設定 DATABASE_URL。"
  echo "請先在部署平台設定 DATABASE_URL 後再執行。"
  exit 1
fi

if [[ ! -f "${JOURNAL_PATH}" ]]; then
  echo "錯誤：找不到 migration journal：${JOURNAL_PATH}"
  exit 1
fi

echo "==> 讀取本地 migration 版本"
LOCAL_MAX="$(node -e "const fs=require('node:fs');const p=process.argv[1];const j=JSON.parse(fs.readFileSync(p,'utf8'));const max=j.entries.reduce((m,e)=>Math.max(m,Number(e.when)||0),0);process.stdout.write(String(max));" "${JOURNAL_PATH}")"

echo "==> 執行 drizzle migration"
if ! pnpm db:migrate; then
  echo "錯誤：db:migrate 失敗。"
  echo "若資料庫已存在舊 schema 但缺少 migration 歷史，請先建立 baseline 再重試。"
  exit 1
fi

echo "==> 驗證資料庫 migration 版本"
DB_MAX="$(node --input-type=module -e "import pg from 'pg'; const client = new pg.Client({ connectionString: process.env.DATABASE_URL }); await client.connect(); try { const result = await client.query(\"select coalesce(max(created_at), 0)::bigint as max from drizzle.__drizzle_migrations\"); process.stdout.write(String(result.rows[0]?.max ?? 0)); } finally { await client.end(); }")"

echo "本地最新 created_at: ${LOCAL_MAX}"
echo "資料庫最新 created_at: ${DB_MAX}"

if (( DB_MAX < LOCAL_MAX )); then
  echo "錯誤：資料庫 migration 版本落後於程式碼。"
  exit 1
fi

echo "完成：migration 已同步。"
