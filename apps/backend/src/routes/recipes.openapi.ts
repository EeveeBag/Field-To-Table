import { createRoute, z } from '@hono/zod-openapi'
import { db } from '../db/index.js'
import { recipes } from '../db/schema/index.js'
import { eq, ilike, and, desc, count } from 'drizzle-orm'
import { createAuthenticatedApp } from '../lib/createAuthenticatedApp.js'
import {
  createDataResponseSchema,
  createPaginatedResponseSchema,
  createErrorResponse
} from '../schemas/common.schema.js'
import { formatDates, formatDatesArray, omit } from '../utils/transform.js'
import {
  recipeResponseSchema,
  createRecipeSchema,
  updateRecipeSchema,
  recipeQuerySchema
} from '../schemas/recipe.schema.js'

// Route definitions
const listRecipesRoute = createRoute({
  method: 'get',
  path: '/',
  summary: '取得菜譜列表',
  description: '取得所有菜譜，支援搜尋、類型篩選、主食材篩選和分頁',
  tags: ['Recipes'],
  request: {
    query: recipeQuerySchema
  },
  responses: {
    200: {
      description: '成功取得菜譜列表',
      content: {
        'application/json': {
          schema: createPaginatedResponseSchema(recipeResponseSchema)
        }
      }
    }
  }
})

const getRecipeRoute = createRoute({
  method: 'get',
  path: '/{id}',
  summary: '取得單一菜譜詳情',
  tags: ['Recipes'],
  request: {
    params: z.object({
      id: z.string().openapi({ example: 'clhqx2w0x0000qzrmn2q8h4k2' })
    })
  },
  responses: {
    200: {
      description: '成功取得菜譜',
      content: {
        'application/json': {
          schema: createDataResponseSchema(recipeResponseSchema)
        }
      }
    },
    404: createErrorResponse('菜譜不存在')
  }
})

const createRecipeRoute = createRoute({
  method: 'post',
  path: '/',
  summary: '新增菜譜',
  tags: ['Recipes'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createRecipeSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: '成功新增菜譜',
      content: {
        'application/json': {
          schema: createDataResponseSchema(recipeResponseSchema)
        }
      }
    },
    400: createErrorResponse('驗證失敗')
  }
})

const updateRecipeRoute = createRoute({
  method: 'put',
  path: '/{id}',
  summary: '更新菜譜',
  tags: ['Recipes'],
  request: {
    params: z.object({
      id: z.string()
    }),
    body: {
      content: {
        'application/json': {
          schema: updateRecipeSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: '成功更新菜譜',
      content: {
        'application/json': {
          schema: createDataResponseSchema(recipeResponseSchema)
        }
      }
    },
    404: createErrorResponse('菜譜不存在')
  }
})

const deleteRecipeRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  summary: '刪除菜譜',
  tags: ['Recipes'],
  request: {
    params: z.object({
      id: z.string()
    })
  },
  responses: {
    204: {
      description: '成功刪除菜譜'
    },
    404: createErrorResponse('菜譜不存在')
  }
})

// 鏈式呼叫以支援 RPC 類型推導
const routes = createAuthenticatedApp()
  .openapi(listRecipesRoute, async (c) => {
    const { search, type, mainIngredient, page, limit } = c.req.valid('query')
    const user = c.get('user')

    const conditions = [eq(recipes.userId, user.id)]
    if (search) {
      conditions.push(ilike(recipes.name, `%${search}%`))
    }
    if (type) {
      conditions.push(eq(recipes.type, type))
    }
    if (mainIngredient) {
      conditions.push(eq(recipes.mainIngredient, mainIngredient))
    }

    const offset = (page - 1) * limit

    const data = await db
      .select()
      .from(recipes)
      .where(and(...conditions))
      .orderBy(desc(recipes.createdAt))
      .limit(limit)
      .offset(offset)

    const totalResult = await db
      .select({ count: count() })
      .from(recipes)
      .where(and(...conditions))

    const total = totalResult[0].count

    return c.json({
      data: formatDatesArray(data).map((r) => omit(r, 'userId')),
      pagination: {
        page,
        limit,
        total
      }
    })
  })
  .openapi(createRecipeRoute, async (c) => {
    const body = c.req.valid('json')
    const user = c.get('user')

    const newRecipe = await db
      .insert(recipes)
      .values({
        ...body,
        userId: user.id
      })
      .returning()

    return c.json(
      {
        data: omit(formatDates(newRecipe[0]), 'userId')
      },
      201
    )
  })
  .openapi(getRecipeRoute, async (c) => {
    const { id } = c.req.valid('param')
    const user = c.get('user')

    const data = await db
      .select()
      .from(recipes)
      .where(and(eq(recipes.id, id), eq(recipes.userId, user.id)))

    if (data.length === 0) {
      return c.json({ error: 'Recipe not found' }, 404)
    }

    return c.json(
      {
        data: omit(formatDates(data[0]), 'userId')
      },
      200
    )
  })
  .openapi(updateRecipeRoute, async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const user = c.get('user')

    const updatedRecipe = await db
      .update(recipes)
      .set({
        ...body,
        updatedAt: new Date()
      })
      .where(and(eq(recipes.id, id), eq(recipes.userId, user.id)))
      .returning()

    if (updatedRecipe.length === 0) {
      return c.json({ error: 'Recipe not found' }, 404)
    }

    return c.json(
      {
        data: omit(formatDates(updatedRecipe[0]), 'userId')
      },
      200
    )
  })
  .openapi(deleteRecipeRoute, async (c) => {
    const { id } = c.req.valid('param')
    const user = c.get('user')

    const deleted = await db
      .delete(recipes)
      .where(and(eq(recipes.id, id), eq(recipes.userId, user.id)))
      .returning()

    if (deleted.length === 0) {
      return c.json({ error: 'Recipe not found' }, 404)
    }

    return c.body(null, 204)
  })

export default routes
