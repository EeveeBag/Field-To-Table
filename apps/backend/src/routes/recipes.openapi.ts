import { createRoute, z } from '@hono/zod-openapi'
import { db } from '../db/index.js'
import { recipes } from '../db/schema/index.js'
import { eq, ilike, and, desc } from 'drizzle-orm'
import { createAuthenticatedApp } from '../lib/createAuthenticatedApp.js'
import {
  createDataResponseSchema,
  createPaginatedResponseSchema
} from '../schemas/common.schema.js'
import {
  recipeResponseSchema,
  createRecipeSchema,
  updateRecipeSchema,
  recipeQuerySchema
} from '../schemas/recipe.schema.js'
import { count } from 'drizzle-orm'
import { coerceMainIngredient } from '../constants/recipe.js'

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
    404: {
      description: '菜譜不存在',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      }
    }
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
    400: {
      description: '驗證失敗',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      }
    }
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
    404: {
      description: '菜譜不存在',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      }
    }
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
    404: {
      description: '菜譜不存在',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      }
    }
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
      data: data.map((r) => ({
        ...r,
        mainIngredient: coerceMainIngredient(r.mainIngredient),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString()
      })),
      pagination: {
        page,
        limit,
        total: totalResult ? total : 0
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
        data: {
          ...newRecipe[0],
          mainIngredient: coerceMainIngredient(newRecipe[0].mainIngredient),
          createdAt: newRecipe[0].createdAt.toISOString(),
          updatedAt: newRecipe[0].updatedAt.toISOString()
        }
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
        data: {
          ...data[0],
          mainIngredient: coerceMainIngredient(data[0].mainIngredient),
          createdAt: data[0].createdAt.toISOString(),
          updatedAt: data[0].updatedAt.toISOString()
        }
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
        data: {
          ...updatedRecipe[0],
          mainIngredient: coerceMainIngredient(updatedRecipe[0].mainIngredient),
          createdAt: updatedRecipe[0].createdAt.toISOString(),
          updatedAt: updatedRecipe[0].updatedAt.toISOString()
        }
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
