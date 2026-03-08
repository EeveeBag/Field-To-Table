import { createRoute, z } from '@hono/zod-openapi'
import { db } from '../db/index.js'
import { menuSets, menuSetDishes, recipes } from '../db/schema/index.js'
import { eq, and, desc, count, inArray } from 'drizzle-orm'
import {
  createMenuSetSchema,
  updateMenuSetSchema,
  menuSetQuerySchema,
  menuSetResponseSchema,
  addDishToMenuSetSchema,
  type MenuSetWithDishes
} from '../schemas/menuSet.schema.js'
import { createId } from '@paralleldrive/cuid2'
import { createAuthenticatedApp } from '../lib/createAuthenticatedApp.js'
import {
  createDataResponseSchema,
  createPaginatedResponseSchema,
  createErrorResponse
} from '../schemas/common.schema.js'
import { formatDates, omit } from '../utils/transform.js'
import type { RecipeType } from '@repo/shared/schemas'

// ==================== 輔助函數 ====================

/**
 * 從資料庫查詢結果組裝 MenuSetWithDishes
 */
async function fetchMenuSetWithDishes(
  menuSetId: string,
  userId: string
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

  // 查詢菜單組的所有菜色（JOIN recipes 取得 type, name, ingredientsText）
  const dishesResult = await db
    .select({
      recipeId: menuSetDishes.recipeId,
      servings: menuSetDishes.servings,
      type: recipes.type,
      name: recipes.name,
      ingredientsText: recipes.ingredientsText,
      createdAt: menuSetDishes.createdAt
    })
    .from(menuSetDishes)
    .innerJoin(recipes, eq(menuSetDishes.recipeId, recipes.id))
    .where(eq(menuSetDishes.menuSetId, menuSetId))
    .orderBy(menuSetDishes.createdAt)

  const dishes = dishesResult.map((dish) => ({
    recipeId: dish.recipeId,
    type: dish.type as RecipeType,
    servings: dish.servings,
    name: dish.name || '',
    ingredientsText: dish.ingredientsText
  }))

  return {
    ...omit(formatDates(menuSet), 'userId'),
    dishes
  }
}

// ==================== Route Definitions ====================

// GET /api/menu-sets - 取得菜單組列表
const listMenuSetsRoute = createRoute({
  method: 'get',
  path: '/',
  summary: '取得菜單組列表',
  description: '取得所有菜單組，支援分頁',
  tags: ['Menu Sets'],
  request: {
    query: menuSetQuerySchema
  },
  responses: {
    200: {
      description: '成功取得菜單組列表',
      content: {
        'application/json': {
          schema: createPaginatedResponseSchema(menuSetResponseSchema)
        }
      }
    }
  }
})

// GET /api/menu-sets/:id - 取得單一菜單組
const getMenuSetRoute = createRoute({
  method: 'get',
  path: '/{id}',
  summary: '取得單一菜單組詳情',
  tags: ['Menu Sets'],
  request: {
    params: z.object({
      id: z.string().openapi({ example: 'm1' })
    })
  },
  responses: {
    200: {
      description: '成功取得菜單組',
      content: {
        'application/json': {
          schema: createDataResponseSchema(menuSetResponseSchema)
        }
      }
    },
    404: createErrorResponse('菜單組不存在')
  }
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
          schema: createMenuSetSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: '成功新增菜單組',
      content: {
        'application/json': {
          schema: createDataResponseSchema(menuSetResponseSchema)
        }
      }
    },
    400: createErrorResponse('驗證失敗')
  }
})

// PUT /api/menu-sets/:id - 更新菜單組
const updateMenuSetRoute = createRoute({
  method: 'put',
  path: '/{id}',
  summary: '更新菜單組',
  tags: ['Menu Sets'],
  request: {
    params: z.object({
      id: z.string()
    }),
    body: {
      content: {
        'application/json': {
          schema: updateMenuSetSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: '成功更新菜單組',
      content: {
        'application/json': {
          schema: createDataResponseSchema(menuSetResponseSchema)
        }
      }
    },
    404: createErrorResponse('菜單組不存在')
  }
})

// POST /api/menu-sets/:id/dishes - 新增單道菜到菜單組
const addDishToMenuSetRoute = createRoute({
  method: 'post',
  path: '/{id}/dishes',
  summary: '新增單道菜到菜單組',
  description: '快速將一道菜加入現有菜單組，servings 預設使用該菜譜的 servings',
  tags: ['Menu Sets'],
  request: {
    params: z.object({
      id: z.string().openapi({ example: 'm1' })
    }),
    body: {
      content: {
        'application/json': {
          schema: addDishToMenuSetSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: '成功新增菜色到菜單組',
      content: {
        'application/json': {
          schema: createDataResponseSchema(menuSetResponseSchema)
        }
      }
    },
    400: createErrorResponse('菜單組已達 20 道菜上限'),
    404: createErrorResponse('菜單組或菜譜不存在'),
    409: createErrorResponse('該菜譜已存在於此菜單組中')
  }
})

// DELETE /api/menu-sets/:id - 刪除菜單組
const deleteMenuSetRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  summary: '刪除菜單組',
  tags: ['Menu Sets'],
  request: {
    params: z.object({
      id: z.string()
    })
  },
  responses: {
    204: {
      description: '成功刪除菜單組'
    },
    404: createErrorResponse('菜單組不存在')
  }
})

// 鏈式呼叫以支援 RPC 類型推導
const routes = createAuthenticatedApp()
  .openapi(listMenuSetsRoute, async (c) => {
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
      .select({ count: count() })
      .from(menuSets)
      .where(eq(menuSets.userId, user.id))

    const total = totalResult[0]?.count || 0

    const menuSetIds = menuSetsList.map((m) => m.id)

    if (menuSetIds.length === 0) {
      return c.json({
        data: [],
        pagination: {
          page,
          limit,
          total
        }
      })
    }

    const allDishes = await db
      .select({
        menuSetId: menuSetDishes.menuSetId,
        recipeId: menuSetDishes.recipeId,
        servings: menuSetDishes.servings,
        type: recipes.type,
        name: recipes.name,
        ingredientsText: recipes.ingredientsText,
        createdAt: menuSetDishes.createdAt
      })
      .from(menuSetDishes)
      .innerJoin(recipes, eq(menuSetDishes.recipeId, recipes.id))
      .where(inArray(menuSetDishes.menuSetId, menuSetIds))
      .orderBy(menuSetDishes.createdAt)

    const dishesByMenuSetId = allDishes.reduce(
      (acc, dish) => {
        if (!acc[dish.menuSetId]) {
          acc[dish.menuSetId] = []
        }
        acc[dish.menuSetId].push({
          recipeId: dish.recipeId,
          type: dish.type as RecipeType,
          servings: dish.servings,
          name: dish.name || '',
          ingredientsText: dish.ingredientsText
        })
        return acc
      },
      {} as Record<
        string,
        Array<{
          recipeId: string
          type: RecipeType
          servings: number
          name: string
          ingredientsText: string | null
        }>
      >
    )

    const data = menuSetsList.map((menuSet) => ({
      ...omit(formatDates(menuSet), 'userId'),
      dishes: dishesByMenuSetId[menuSet.id] || []
    }))

    return c.json({
      data,
      pagination: {
        page,
        limit,
        total
      }
    })
  })
  .openapi(createMenuSetRoute, async (c) => {
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
        servings: body.servings
      })

      // 2. 建立所有菜色關聯
      if (body.dishes && body.dishes.length > 0) {
        const dishesValues = body.dishes.map((dish) => ({
          id: createId(),
          menuSetId: menuSetId,
          recipeId: dish.recipeId,
          servings: dish.servings
        }))

        await tx.insert(menuSetDishes).values(dishesValues)
      }
    })

    // 3. 查詢完整的菜單組資料（包含 dishes）
    const menuSetWithDishes = await fetchMenuSetWithDishes(menuSetId, user.id)

    // menuSetWithDishes 應該一定存在，因為剛剛才建立
    return c.json(
      {
        data: menuSetWithDishes!
      },
      201
    )
  })
  .openapi(getMenuSetRoute, async (c) => {
    const { id } = c.req.valid('param')
    const user = c.get('user')

    const menuSetWithDishes = await fetchMenuSetWithDishes(id, user.id)

    if (!menuSetWithDishes) {
      return c.json({ error: 'Menu set not found' }, 404)
    }

    return c.json(
      {
        data: menuSetWithDishes
      },
      200
    )
  })
  .openapi(updateMenuSetRoute, async (c) => {
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
        updatedAt: new Date()
      }

      if (body.name !== undefined) updateData.name = body.name
      if (body.description !== undefined) updateData.description = body.description || null
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
            servings: dish.servings
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
        data: menuSetWithDishes
      },
      200
    )
  })
  .openapi(addDishToMenuSetRoute, async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const user = c.get('user')

    // 1 & 2. 並行驗證 menuSet 歸屬（含 dish count）與 recipe 存在
    const [menuSetResult, recipeResult, existingDish] = await Promise.all([
      db
        .select({ id: menuSets.id, dishCount: count(menuSetDishes.id) })
        .from(menuSets)
        .leftJoin(menuSetDishes, eq(menuSets.id, menuSetDishes.menuSetId))
        .where(and(eq(menuSets.id, id), eq(menuSets.userId, user.id)))
        .groupBy(menuSets.id),
      db
        .select({ id: recipes.id, servings: recipes.servings })
        .from(recipes)
        .where(eq(recipes.id, body.recipeId))
        .limit(1),
      db
        .select({ id: menuSetDishes.id })
        .from(menuSetDishes)
        .where(
          and(
            eq(menuSetDishes.menuSetId, id),
            eq(menuSetDishes.recipeId, body.recipeId)
          )
        )
        .limit(1)
    ])

    if (menuSetResult.length === 0) {
      return c.json({ error: 'Menu set not found' }, 404)
    }

    if (recipeResult.length === 0) {
      return c.json({ error: 'Recipe not found' }, 404)
    }

    // 3. 檢查重複菜譜
    if (existingDish.length > 0) {
      return c.json({ error: '該菜譜已存在於此菜單組中' }, 409)
    }

    // 4. 檢查菜色數量上限
    if (menuSetResult[0].dishCount >= 20) {
      return c.json({ error: '菜單組已達 20 道菜上限' }, 400)
    }

    // 5. INSERT 新的 menuSetDish（servings 取自 recipe）並更新 updatedAt
    await db.transaction(async (tx) => {
      await tx.insert(menuSetDishes).values({
        id: createId(),
        menuSetId: id,
        recipeId: body.recipeId,
        servings: recipeResult[0].servings
      })

      await tx
        .update(menuSets)
        .set({ updatedAt: new Date() })
        .where(eq(menuSets.id, id))
    })

    // 6. 回傳完整資料
    const menuSetWithDishes = await fetchMenuSetWithDishes(id, user.id)

    return c.json(
      {
        data: menuSetWithDishes!
      },
      201
    )
  })
  .openapi(deleteMenuSetRoute, async (c) => {
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

export default routes
