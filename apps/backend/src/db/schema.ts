import {
  pgTable,
  text,
  integer,
  timestamp,
  pgEnum,
  decimal,
  boolean,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

// ==================== Better Auth Tables ====================
// Better Auth 認證相關資料表

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
)

// ==================== Application Tables ====================
// 應用程式資料表

// 定義菜譜類型 ENUM
export const recipeTypeEnum = pgEnum('recipe_type', [
  'main',
  'side',
  'soup',
  'dessert',
])

// Recipes 表（菜譜）
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
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})

// MenuSets 表（菜單組）
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
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})

// MenuSetDishes 表（菜單組菜色關聯）
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
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

// ==================== Relations ====================
// 關聯關係定義

// Better Auth Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  recipes: many(recipes),
  menuSets: many(menuSets),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

// Application Relations
export const recipesRelations = relations(recipes, ({ one }) => ({
  user: one(user, {
    fields: [recipes.userId],
    references: [user.id],
  }),
}))

export const menuSetsRelations = relations(menuSets, ({ one, many }) => ({
  user: one(user, {
    fields: [menuSets.userId],
    references: [user.id],
  }),
  dishes: many(menuSetDishes),
}))

export const menuSetDishesRelations = relations(menuSetDishes, ({ one }) => ({
  menuSet: one(menuSets, {
    fields: [menuSetDishes.menuSetId],
    references: [menuSets.id],
  }),
  recipe: one(recipes, {
    fields: [menuSetDishes.recipeId],
    references: [recipes.id],
  }),
}))
