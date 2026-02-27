import { createRoute, z } from '@hono/zod-openapi'
import { createAuthenticatedApp } from '../lib/createAuthenticatedApp.js'
import { createDataResponseSchema } from '../schemas/common.schema.js'
import {
  RECIPE_TYPE_MAP,
  MAIN_INGREDIENT_MAP,
  MENU_INGREDIENTS_MAP
} from '../constants/recipe.js'
import {
  RecipeTypeEnum,
  MainIngredientEnum,
  type RecipeType,
  type MainIngredient
} from '@repo/shared/schemas'

// ==================== Schemas ====================

// 菜譜類型選項 schema
const recipeTypeOptionSchema = z.object({
  value: RecipeTypeEnum.openapi({
    description: '菜譜類型值',
    example: 'main'
  }),
  label: z.string().openapi({
    description: '選項顯示名稱',
    example: '主菜'
  })
})

// 主食材選項 schema
const mainIngredientOptionSchema = z.object({
  value: MainIngredientEnum.openapi({
    description: '主食材類型值',
    example: 'pork'
  }),
  label: z.string().openapi({
    description: '選項顯示名稱',
    example: '豬肉'
  })
})

const recipeTypeOptionsResponseSchema = createDataResponseSchema(z.array(recipeTypeOptionSchema))
const mainIngredientOptionsResponseSchema = createDataResponseSchema(
  z.array(mainIngredientOptionSchema)
)

// 菜單篩選選項 schema（types + ingredients 巢狀結構）
const menuIngredientsResponseSchema = createDataResponseSchema(
  z.object({
    types: z.record(RecipeTypeEnum, z.string()).openapi({
      description: '菜單類型映射',
      example: { main: '主菜', side: '配菜' }
    }),
    ingredients: z.record(RecipeTypeEnum, z.record(z.string(), z.string())).openapi({
      description: '各類型對應的食材映射',
      example: { main: { pork: '豬肉', beef: '牛肉' } }
    })
  })
)

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
          schema: recipeTypeOptionsResponseSchema
        }
      }
    }
  }
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
          schema: mainIngredientOptionsResponseSchema
        }
      }
    }
  }
})

// GET /api/options/menu-ingredients - 取得菜單篩選選項（類型 + 食材）
const getMenuIngredientsRoute = createRoute({
  method: 'get',
  path: '/menu-ingredients',
  summary: '取得菜單篩選選項',
  description: '取得菜單篩選用的類型與對應食材映射（含 drink / other 等 UI 篩選類型）',
  tags: ['Options'],
  responses: {
    200: {
      description: '成功取得菜單篩選選項',
      content: {
        'application/json': {
          schema: menuIngredientsResponseSchema
        }
      }
    }
  }
})

// 鏈式呼叫以支援 RPC 類型推導
const routes = createAuthenticatedApp()
  .openapi(getRecipeTypesRoute, async (c) => {
    const data = (Object.keys(RECIPE_TYPE_MAP) as RecipeType[]).map((value) => ({
      value,
      label: RECIPE_TYPE_MAP[value]
    }))

    return c.json({ data })
  })
  .openapi(getMainIngredientsRoute, async (c) => {
    const data = (Object.keys(MAIN_INGREDIENT_MAP) as MainIngredient[]).map((value) => ({
      value,
      label: MAIN_INGREDIENT_MAP[value]
    }))

    return c.json({ data })
  })
  .openapi(getMenuIngredientsRoute, async (c) => {
    return c.json({
      data: {
        types: RECIPE_TYPE_MAP,
        ingredients: MENU_INGREDIENTS_MAP
      }
    })
  })

export default routes
