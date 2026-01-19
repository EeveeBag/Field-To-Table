import { pgTable, text, integer, timestamp, index, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { user } from './auth.schema.js'
import { recipeTypeEnum } from './enums.js'

// ==================== Recipe Tables ====================

/**
 * 菜譜表
 */
export const recipes = pgTable('recipes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  type: recipeTypeEnum('type').notNull(),
  mainIngredient: text('main_ingredient').notNull(),
  subIngredient: text('sub_ingredient'),
  servings: integer('servings').notNull().default(2),
  ingredientsText: text('ingredients_text'),
  steps: text('steps'),
  notes: text('notes'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull()
})

/**
 * 收藏表
 */
export const favorites = pgTable(
  'favorites',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    recipeId: text('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull()
  },
  (table) => [
    index('idx_favorites_user').on(table.userId),
    index('idx_favorites_recipe').on(table.recipeId),
    // 複合唯一約束：每個使用者對同一個菜譜只能收藏一次
    unique('unique_user_recipe').on(table.userId, table.recipeId)
  ]
)

// ==================== Recipe Relations ====================

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  user: one(user, {
    fields: [recipes.userId],
    references: [user.id]
  }),
  favorites: many(favorites)
}))

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(user, {
    fields: [favorites.userId],
    references: [user.id]
  }),
  recipe: one(recipes, {
    fields: [favorites.recipeId],
    references: [recipes.id]
  })
}))
