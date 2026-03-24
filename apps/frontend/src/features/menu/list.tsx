import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RecipeListCard } from './components/recipe-list-card'
import { RecipeFormDialog } from './components/recipe-form-dialog'
import type { Recipe } from './types'

const mockMyRecipes: Recipe[] = [
  {
    id: '1',
    type: 'side' as const,
    name: '紅蘿蔔炒蛋',
    servings: 3,
    mainIngredient: 'vegetable' as const,
    ingredientsText: '紅蘿蔔 2條\n雞蛋 3個',
    steps:
      '1. 紅蘿蔔切絲。\n2. 先不開火，放入紅蘿蔔絲入炒鍋。\n3. 加入一碗水、加一些鹽巴與三～五湯匙的油。\n4. 蓋鍋開中火炒至水滾，然後翻一下，可以等久一點，',
    notes: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    type: 'main' as const,
    name: '蒜炒豬肉義大利麵',
    servings: 2,
    mainIngredient: 'pork' as const,
    ingredientsText: '義大利麵 200g\n豬肉片 150g\n蒜頭 5瓣',
    steps: '1. 煮麵。\n2. 炒豬肉。\n3. 加入蒜頭爆香。',
    notes: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    type: 'side' as const,
    name: '炒空心菜',
    servings: 2,
    mainIngredient: 'vegetable' as const,
    ingredientsText: '空心菜 1把\n蒜頭 3瓣',
    steps: '1. 熱油。\n2. 爆香蒜頭。\n3. 下空心菜快炒。',
    notes: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    type: 'soup' as const,
    name: '番茄蛋花湯',
    servings: 4,
    mainIngredient: 'vegetable' as const,
    ingredientsText: '番茄 2顆\n雞蛋 2個',
    steps: '1. 番茄切塊。\n2. 煮滾水後放入番茄。\n3. 打入蛋花。',
    notes: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

const mockFavoriteRecipes: Recipe[] = [
  {
    id: '5',
    type: 'main' as const,
    name: '紅燒牛肉麵',
    servings: 2,
    mainIngredient: 'beef' as const,
    ingredientsText: '牛腩 300g\n麵條 2份',
    steps: '1. 牛肉切塊。\n2. 紅燒燉煮。',
    notes: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

export function MenuPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)

  const handleAddRecipe = () => {
    setEditingRecipe(null)
    setDialogOpen(true)
  }

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setDialogOpen(true)
  }

  return (
    <main className="mx-auto max-w-3xl h-[calc(100dvh-24px-56px)] flex flex-col">
      <div className="shrink-0">
        <p className="text-title text-sm tracking-wider md:text-base mb-1">RECIPE LIBRARY</p>

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold tracking-wide">菜單組</h1>
          <button
            onClick={handleAddRecipe}
            className="w-14 h-14 bg-orange-300 rounded-full flex items-center justify-center hover:bg-orange-300/90 transition-colors"
          >
            <Plus size={28} color="#ffffff" strokeWidth={2.5} />
          </button>
        </div>

        <Input
          placeholder="搜尋菜名或主食材"
          className="border-2 border-earthTone-150 mb-4 focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)]"
        />

        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <p className="mb-1 text-earthTone-200 text-xs">類型</p>
            <Select defaultValue="all">
              <SelectTrigger className="border-orange-300 bg-earthTone-100 border-[1.5px] w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="main">主菜</SelectItem>
                  <SelectItem value="side">副菜</SelectItem>
                  <SelectItem value="soup">湯</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="w-1/2">
            <p className="mb-1 text-earthTone-200 text-xs">主食材</p>
            <Select defaultValue="all">
              <SelectTrigger className="border-orange-300 bg-earthTone-100 border-[1.5px] w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="meat">肉</SelectItem>
                  <SelectItem value="vegetable">菜</SelectItem>
                  <SelectItem value="fish">魚</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs 区域 - 可滚动 */}
      <Tabs defaultValue="my" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full shrink-0">
          <TabsTrigger value="my" className="flex-1">
            我的菜譜
          </TabsTrigger>
          <TabsTrigger value="favorite" className="flex-1">
            收藏
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="flex-1 min-h-0 overflow-y-auto mt-4">
          <div className="flex flex-col gap-4 pb-4">
            {mockMyRecipes.map((recipe) => (
              <RecipeListCard
                key={recipe.id}
                recipe={recipe}
                onEdit={() => handleEditRecipe(recipe)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorite" className="flex-1 min-h-0 overflow-y-auto mt-4">
          <div className="flex flex-col gap-4 pb-4">
            {mockFavoriteRecipes.map((recipe) => (
              <RecipeListCard
                key={recipe.id}
                recipe={recipe}
                onEdit={() => handleEditRecipe(recipe)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <RecipeFormDialog
        key={editingRecipe?.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        recipe={editingRecipe}
      />
    </main>
  )
}
