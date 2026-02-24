import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema/index.js'
import { env } from '../lib/env.js'

// 建立連線池 (Connection Pool)
const pool = new Pool({
  connectionString: env.DATABASE_URL
})

// 初始化 Drizzle
// 把 schema 傳進去，這樣之後用 db.query 時會有自動補全
export const db = drizzle(pool, { schema })
