import { createRoute, z } from '@hono/zod-openapi'
import { db } from '../db/index.js'
import { menuSets, menuSetDishes, recipes } from '../db/schema.js'
import { eq, and, desc, sql } from 'drizzle-orm'
import {
  createMenuSetSchema,
  updateMenuSetSchema,
  menuSetQuerySchema,
  menuSetResponseSchema,
  type MenuSetWithDishes,
} from '../schemas/menuSet.schema.js'
import { createId } from '@paralleldrive/cuid2'
import { createAuthenticatedApp } from '../lib/createAuthenticatedApp.js'
import {
  createDataResponseSchema,
  createPaginatedResponseSchema,
} from '../schemas/common.schema.js'

const app = createAuthenticatedApp()

// ==================== 輔助函數 ====================

/**
 * 從資料庫查詢結果組裝 MenuSetWithDishes
 */
async function fetchMenuSetWithDishes(
  menuSetId: string,
  userId: string,
): Promise<MenuSetWithDishes | null> {
  // 查詢菜單組基本資料
  const menuSetResult = await db
    .select()
    .from(menuSets)
    .where(and(eq(menuSets.id, menuSetId), eq(menuSets.userId, userId)))
    .limit(1)

  if (menuSetResult.length === 0) {
    return null
  }

  const menuSet = menuSetResult[0]

  // 查詢菜單組的所有菜色（JOIN recipes 取得 type）
  const dishesResult = await db
    .select({
      recipeId: menuSetDishes.recipeId,
      multiplier: menuSetDishes.multiplier,
      type: recipes.type,
      createdAt: menuSetDishes.createdAt,
    })
    .from(menuSetDishes)
    .leftJoin(recipes, eq(menuSetDishes.recipeId, recipes.id))
    .where(eq(menuSetDishes.menuSetId, menuSetId))
    .orderBy(menuSetDishes.createdAt)

  const dishes = dishesResult.map((dish) => ({
    recipeId: dish.recipeId,
    type: dish.type as 'main' | 'side' | 'soup' | 'dessert',
    multiplier: dish.multiplier ? parseFloat(dish.multiplier) : 1.0,
  }))

  return {
    id: menuSet.id,
    name: menuSet.name,
    description: menuSet.description,
    servings: menuSet.servings,
    dishes,
    createdAt: menuSet.createdAt.toISOString(),
    updatedAt: menuSet.updatedAt.toISOString(),
  }
}

// ==================== Routes ====================

// GET /api/menu-sets - 取得菜單組列表
const listMenuSetsRoute = createRoute({
  method: 'get',
  path: '/',
  summary: '取得菜單組列表',
  description: '取得所有菜單組，支援分頁',
  tags: ['Menu Sets'],
  request: {
    query: menuSetQuerySchema,
  },
  responses: {
    200: {
      description: '成功取得菜單組列表',
      content: {
        'application/json': {
          schema: createPaginatedResponseSchema(menuSetResponseSchema),
        },
      },
    },
  },
})

app.openapi(listMenuSetsRoute, async (c) => {
  const { page, limit } = c.req.valid('query')
  const user = c.get('user')

  const offset = (page - 1) * limit

  // 查詢菜單組列表
  const menuSetsList = await db
    .select()
    .from(menuSets)
    .where(eq(menuSets.userId, user.id))
    .orderBy(desc(menuSets.createdAt))
    .limit(limit)
    .offset(offset)

  // 查詢總數
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(menuSets)
    .where(eq(menuSets.userId, user.id))

  const total = totalResult[0]?.count || 0

  // 為每個菜單組查詢 dishes
  const data = await Promise.all(
    menuSetsList.map(async (menuSet) => {
      const dishesResult = await db
        .select({
          recipeId: menuSetDishes.recipeId,
          multiplier: menuSetDishes.multiplier,
          type: recipes.type,
        })
        .from(menuSetDishes)
        .leftJoin(recipes, eq(menuSetDishes.recipeId, recipes.id))
        .where(eq(menuSetDishes.menuSetId, menuSet.id))
        .orderBy(menuSetDishes.createdAt)

      const dishes = dishesResult.map((dish) => ({
        recipeId: dish.recipeId,
        type: dish.type as 'main' | 'side' | 'soup' | 'dessert',
        multiplier: dish.multiplier ? parseFloat(dish.multiplier) : 1.0,
      }))

      return {
        id: menuSet.id,
        name: menuSet.name,
        description: menuSet.description,
        servings: menuSet.servings,
        dishes,
        createdAt: menuSet.createdAt.toISOString(),
        updatedAt: menuSet.updatedAt.toISOString(),
      }
    }),
  )

  return c.json({
    data,
    pagination: {
      page,
      limit,
      total: Number(total),
    },
  })
})

// GET /api/menu-sets/:id - 取得單一菜單組
const getMenuSetRoute = createRoute({
  method: 'get',
  path: '/{id}',
  summary: '取得單一菜單組詳情',
  tags: ['Menu Sets'],
  request: {
    params: z.object({
      id: z.string().openapi({ example: 'm1' }),
    }),
  },
  responses: {
    200: {
      description: '成功取得菜單組',
      content: {
        'application/json': {
          schema: createDataResponseSchema(menuSetResponseSchema),
        },
      },
    },
    404: {
      description: '菜單組不存在',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
})

app.openapi(getMenuSetRoute, async (c) => {
  const { id } = c.req.valid('param')
  const user = c.get('user')

  const menuSetWithDishes = await fetchMenuSetWithDishes(id, user.id)

  if (!menuSetWithDishes) {
    return c.json({ error: 'Menu set not found' }, 404)
  }

  return c.json(
    {
      data: menuSetWithDishes,
    },
    200,
  )
})

// POST /api/menu-sets - 新增菜單組
const createMenuSetRoute = createRoute({
  method: 'post',
  path: '/',
  summary: '新增菜單組',
  tags: ['Menu Sets'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createMenuSetSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: '成功新增菜單組',
      content: {
        'application/json': {
          schema: createDataResponseSchema(menuSetResponseSchema),
        },
      },
    },
    400: {
      description: '驗證失敗',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
})

app.openapi(createMenuSetRoute, async (c) => {
  const body = c.req.valid('json')
  const user = c.get('user')

  const menuSetId = createId()

  // 使用 transaction 確保資料一致性
  await db.transaction(async (tx) => {
    // 1. 建立菜單組
    await tx.insert(menuSets).values({
      id: menuSetId,
      userId: user.id,
      name: body.name,
      description: body.description || null,
      servings: body.servings,
    })

    // 2. 建立所有菜色關聯
    if (body.dishes && body.dishes.length > 0) {
      const dishesValues = body.dishes.map((dish) => ({
        id: createId(),
        menuSetId: menuSetId,
        recipeId: dish.recipeId,
        multiplier: dish.multiplier?.toString() || '1.0',
      }))

      await tx.insert(menuSetDishes).values(dishesValues)
    }
  })

  // 3. 查詢完整的菜單組資料（包含 dishes）
  const menuSetWithDishes = await fetchMenuSetWithDishes(menuSetId, user.id)

  // menuSetWithDishes 應該一定存在，因為剛剛才建立
  return c.json(
    {
      data: menuSetWithDishes!,
    },
    201,
  )
})

// PUT /api/menu-sets/:id - 更新菜單組
const updateMenuSetRoute = createRoute({
  method: 'put',
  path: '/{id}',
  summary: '更新菜單組',
  tags: ['Menu Sets'],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateMenuSetSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: '成功更新菜單組',
      content: {
        'application/json': {
          schema: createDataResponseSchema(menuSetResponseSchema),
        },
      },
    },
    404: {
      description: '菜單組不存在',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
})

app.openapi(updateMenuSetRoute, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  const user = c.get('user')

  // 使用 transaction 確保資料一致性
  await db.transaction(async (tx) => {
    // 1. 檢查菜單組是否存在且屬於當前用戶
    const existingMenuSet = await tx
      .select()
      .from(menuSets)
      .where(and(eq(menuSets.id, id), eq(menuSets.userId, user.id)))
      .limit(1)

    if (existingMenuSet.length === 0) {
      return
    }

    // 2. 更新菜單組基本資料
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined)
      updateData.description = body.description || null
    if (body.servings !== undefined) updateData.servings = body.servings

    await tx
      .update(menuSets)
      .set(updateData)
      .where(and(eq(menuSets.id, id), eq(menuSets.userId, user.id)))

    // 3. 如果有提供 dishes，則更新菜色關聯
    if (body.dishes !== undefined) {
      // 刪除舊的菜色關聯
      await tx.delete(menuSetDishes).where(eq(menuSetDishes.menuSetId, id))

      // 新增新的菜色關聯
      if (body.dishes.length > 0) {
        const dishesValues = body.dishes.map((dish) => ({
          id: createId(),
          menuSetId: id,
          recipeId: dish.recipeId,
          multiplier: dish.multiplier?.toString() || '1.0',
        }))

        await tx.insert(menuSetDishes).values(dishesValues)
      }
    }
  })

  // 4. 查詢更新後的完整資料
  const menuSetWithDishes = await fetchMenuSetWithDishes(id, user.id)

  if (!menuSetWithDishes) {
    return c.json({ error: 'Menu set not found' }, 404)
  }

  return c.json(
    {
      data: menuSetWithDishes,
    },
    200,
  )
})

// DELETE /api/menu-sets/:id - 刪除菜單組
const deleteMenuSetRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  summary: '刪除菜單組',
  tags: ['Menu Sets'],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    204: {
      description: '成功刪除菜單組',
    },
    404: {
      description: '菜單組不存在',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
})

app.openapi(deleteMenuSetRoute, async (c) => {
  const { id } = c.req.valid('param')
  const user = c.get('user')

  // 刪除菜單組（CASCADE 會自動刪除 menu_set_dishes）
  const deleted = await db
    .delete(menuSets)
    .where(and(eq(menuSets.id, id), eq(menuSets.userId, user.id)))
    .returning()

  if (deleted.length === 0) {
    return c.json({ error: 'Menu set not found' }, 404)
  }

  return c.body(null, 204)
})

export default app
