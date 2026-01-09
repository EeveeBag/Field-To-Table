import { relations } from 'drizzle-orm'

// ==================== Re-exports ====================

// Enums
export * from './enums.js'

// Auth schema
export * from './auth.schema.js'

// Recipe schema
export * from './recipe.schema.js'

// Menu schema
export * from './menu.schema.js'

// ==================== Cross-module Relations ====================

// userRelations 需要引用所有模組的表，因此在這裡統一定義
import { user, session, account } from './auth.schema.js'
import { recipes, favorites } from './recipe.schema.js'
import { menuSets } from './menu.schema.js'

/**
 * 使用者關聯（跨模組）
 * 定義 user 與其他所有表的關聯
 */
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  recipes: many(recipes),
  menuSets: many(menuSets),
  favorites: many(favorites)
}))
