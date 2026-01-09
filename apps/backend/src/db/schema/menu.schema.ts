import { pgTable, text, integer, timestamp, decimal } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { user } from './auth.schema.js'
import { recipes } from './recipe.schema.js'

// ==================== Menu Tables ====================

/**
 * 菜單組表
 */
export const menuSets = pgTable('menu_sets', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  servings: integer('servings').notNull().default(4),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull()
})

/**
 * 菜單組菜色關聯表
 */
export const menuSetDishes = pgTable('menu_set_dishes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  menuSetId: text('menu_set_id')
    .notNull()
    .references(() => menuSets.id, { onDelete: 'cascade' }),
  recipeId: text('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  multiplier: decimal('multiplier', { precision: 3, scale: 1 }).default('1.0'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull()
})

// ==================== Menu Relations ====================

export const menuSetsRelations = relations(menuSets, ({ one, many }) => ({
  user: one(user, {
    fields: [menuSets.userId],
    references: [user.id]
  }),
  dishes: many(menuSetDishes)
}))

export const menuSetDishesRelations = relations(menuSetDishes, ({ one }) => ({
  menuSet: one(menuSets, {
    fields: [menuSetDishes.menuSetId],
    references: [menuSets.id]
  }),
  recipe: one(recipes, {
    fields: [menuSetDishes.recipeId],
    references: [recipes.id]
  })
}))
