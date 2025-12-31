import { createRoute, z } from '@hono/zod-openapi'
import { createAuthenticatedApp } from '../lib/createAuthenticatedApp.js'
import { createDataResponseSchema } from '../schemas/common.schema.js'
import { RECIPE_TYPE_MAP, MAIN_INGREDIENT_MAP } from '../constants/recipe.js'

const app = createAuthenticatedApp()

// ==================== Schemas ====================

const optionItemSchema = z.object({
  value: z.string().openapi({
    description: '選項值（用於 API 傳送）',
    example: 'main',
  }),
  label: z.string().openapi({
    description: '選項顯示名稱（用於 UI 顯示）',
    example: '主菜',
  }),
})

const optionsResponseSchema = createDataResponseSchema(z.array(optionItemSchema))

// ==================== Routes ====================

// GET /api/options/recipe-types - 取得菜譜類型選項
const getRecipeTypesRoute = createRoute({
  method: 'get',
  path: '/recipe-types',
  summary: '取得菜譜類型選項',
  description: '取得所有可用的菜譜類型（主類別）選項',
  tags: ['Options'],
  responses: {
    200: {
      description: '成功取得菜譜類型選項',
      content: {
        'application/json': {
          schema: optionsResponseSchema,
        },
      },
    },
  },
})

app.openapi(getRecipeTypesRoute, async (c) => {
  const data = Object.entries(RECIPE_TYPE_MAP).map(([value, label]) => ({
    value,
    label,
  }))

  return c.json({ data })
})

// GET /api/options/main-ingredients - 取得主食材選項
const getMainIngredientsRoute = createRoute({
  method: 'get',
  path: '/main-ingredients',
  summary: '取得主食材選項',
  description: '取得所有可用的主食材選項',
  tags: ['Options'],
  responses: {
    200: {
      description: '成功取得主食材選項',
      content: {
        'application/json': {
          schema: optionsResponseSchema,
        },
      },
    },
  },
})

app.openapi(getMainIngredientsRoute, async (c) => {
  const data = Object.entries(MAIN_INGREDIENT_MAP).map(([value, label]) => ({
    value,
    label,
  }))

  return c.json({ data })
})

export default app
