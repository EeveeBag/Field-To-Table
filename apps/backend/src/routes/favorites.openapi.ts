import { createRoute, z } from '@hono/zod-openapi'
import { db } from '../db/index.js'
import { favorites, recipes } from '../db/schema/index.js'
import { eq, and, desc, count } from 'drizzle-orm'
import { createAuthenticatedApp } from '../lib/createAuthenticatedApp.js'
import {
  createDataResponseSchema,
  createPaginatedResponseSchema,
  createErrorResponse
} from '../schemas/common.schema.js'
import { formatDates } from '../utils/transform.js'
import {
  favoriteWithRecipeResponseSchema,
  favoriteResponseSchema,
  createFavoriteSchema,
  favoriteQuerySchema
} from '../schemas/favorite.schema.js'

// ==================== Routes ====================

// GET /api/favorites - 取得收藏列表
const listFavoritesRoute = createRoute({
  method: 'get',
  path: '/',
  summary: '取得收藏列表',
  description: '取得使用者的所有收藏菜譜，支援分頁',
  tags: ['Favorites'],
  request: {
    query: favoriteQuerySchema
  },
  responses: {
    200: {
      description: '成功取得收藏列表',
      content: {
        'application/json': {
          schema: createPaginatedResponseSchema(favoriteWithRecipeResponseSchema)
        }
      }
    }
  }
})

// POST /api/favorites - 新增收藏
const createFavoriteRoute = createRoute({
  method: 'post',
  path: '/',
  summary: '新增收藏',
  description: '將菜譜加入收藏',
  tags: ['Favorites'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createFavoriteSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: '成功新增收藏',
      content: {
        'application/json': {
          schema: createDataResponseSchema(favoriteResponseSchema)
        }
      }
    },
    400: createErrorResponse('菜譜不存在'),
    409: createErrorResponse('已經收藏過此菜譜')
  }
})

// DELETE /api/favorites/:recipeId - 移除收藏
const deleteFavoriteRoute = createRoute({
  method: 'delete',
  path: '/{recipeId}',
  summary: '移除收藏',
  description: '將菜譜從收藏中移除',
  tags: ['Favorites'],
  request: {
    params: z.object({
      recipeId: z.string().openapi({
        description: '要移除收藏的菜譜 ID',
        example: 'clhqx2w0x0000qzrmn2q8h4k2'
      })
    })
  },
  responses: {
    204: {
      description: '成功移除收藏'
    },
    404: createErrorResponse('收藏不存在')
  }
})

// 鏈式呼叫以支援 RPC 類型推導
const routes = createAuthenticatedApp()
  .openapi(listFavoritesRoute, async (c) => {
    const { page, limit } = c.req.valid('query')
    const user = c.get('user')

    const offset = (page - 1) * limit

    // 查詢收藏列表，並 JOIN recipes 表獲取菜譜詳情
    const data = await db
      .select({
        recipeId: favorites.recipeId,
        createdAt: favorites.createdAt,
        recipe: {
          id: recipes.id,
          name: recipes.name,
          type: recipes.type,
          mainIngredient: recipes.mainIngredient,
          servings: recipes.servings,
          ingredientsText: recipes.ingredientsText,
          steps: recipes.steps,
          notes: recipes.notes,
          createdAt: recipes.createdAt,
          updatedAt: recipes.updatedAt
        }
      })
      .from(favorites)
      .innerJoin(recipes, eq(favorites.recipeId, recipes.id))
      .where(eq(favorites.userId, user.id))
      .orderBy(desc(favorites.createdAt))
      .limit(limit)
      .offset(offset)

    // 計算總數
    const totalResult = await db
      .select({ count: count() })
      .from(favorites)
      .where(eq(favorites.userId, user.id))

    return c.json({
      data: data.map((f) => ({
        recipeId: f.recipeId,
        recipe: formatDates(f.recipe),
        createdAt: f.createdAt.toISOString()
      })),
      pagination: {
        page,
        limit,
        total: totalResult[0].count
      }
    })
  })
  .openapi(createFavoriteRoute, async (c) => {
    const { recipeId } = c.req.valid('json')
    const user = c.get('user')

    // 檢查菜譜是否存在
    const recipe = await db.select().from(recipes).where(eq(recipes.id, recipeId)).limit(1)

    if (recipe.length === 0) {
      return c.json({ error: 'Recipe not found' }, 400)
    }

    // 檢查是否已經收藏
    const existingFavorite = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, user.id), eq(favorites.recipeId, recipeId)))
      .limit(1)

    if (existingFavorite.length > 0) {
      return c.json({ error: 'Recipe already in favorites' }, 409)
    }

    // 新增收藏
    const newFavorite = await db
      .insert(favorites)
      .values({
        userId: user.id,
        recipeId: recipeId
      })
      .returning()

    return c.json(
      {
        data: {
          recipeId: newFavorite[0].recipeId,
          createdAt: newFavorite[0].createdAt.toISOString()
        }
      },
      201
    )
  })
  .openapi(deleteFavoriteRoute, async (c) => {
    const { recipeId } = c.req.valid('param')
    const user = c.get('user')

    // 刪除收藏
    const deleted = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, user.id), eq(favorites.recipeId, recipeId)))
      .returning()

    if (deleted.length === 0) {
      return c.json({ error: 'Favorite not found' }, 404)
    }

    return c.body(null, 204)
  })

export default routes
