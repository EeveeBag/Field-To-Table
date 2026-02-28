import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
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
import { RecipeCard } from './components/recipe-card'
import type { Recipe } from './types'
import { RecipeTypeEnum, MainIngredientEnum } from '@repo/shared/schemas'
import { Plus, Heart } from 'lucide-react'
import { AddToMenuSetDialog } from './components/add-to-menu-set-dialog'
import { RecipeFormDialog } from './components/recipe-form-dialog'
import { MenuTypes, MenuIngredients } from './constants'
import type { MenuTypeKey } from './constants'

export function HomePage() {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [menuType, setMenuType] = useState<MenuTypeKey | 'all'>('all')
  const [ingredient, setIngredient] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewRecipe, setViewRecipe] = useState<Recipe | null>(null)

  const [myRecipes] = useState([
    {
      id: '1',
      type: RecipeTypeEnum.enum.main,
      name: '紅燒牛肉麵',
      servings: 2,
      mainIngredient: MainIngredientEnum.enum.beef,
      ingredientsText: '牛肉、麵條、蔥、薑、蒜、醬油、八角、冰糖'
    }
  ])

  const [recommendedRecipes, setRecommendedRecipes] = useState([
    {
      id: '2',
      type: RecipeTypeEnum.enum.soup,
      name: '番茄蛋花湯',
      servings: 4,
      mainIngredient: MainIngredientEnum.enum.vegetable,
      ingredientsText: '番茄、雞蛋、蔥、鹽、胡椒粉',
      isFavorite: true
    }
  ])

  // 點擊愛心，這裡可以做樂觀更新
  const toggleFavorite = (recipeId: string) => {
    setRecommendedRecipes((prevRecipes) =>
      prevRecipes.map((recipe) =>
        recipe.id === recipeId ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
      )
    )
  }

  const handleAddToMenuSet = (recipeId: string) => {
    setSelectedRecipeId(recipeId)
    console.log('recipe ID:', selectedRecipeId)
    setDialogOpen(true)
  }

  const handleViewRecipe = (recipe: Recipe) => {
    setViewRecipe(recipe)
    setViewDialogOpen(true)
  }

  return (
    <main className="mx-auto max-w-3xl">
      <p className="text-title text-sm tracking-wider md:text-base mb-1">本週靈感</p>
      <h1 className="text-xl font-bold mb-4 tracking-wider">快速找到要煮的菜</h1>
      <Input
        placeholder="搜尋菜名"
        className={cn(
          'border-2 mb-5',
          'focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)]'
        )}
      />

      <div className="flex gap-4 mb-5">
        <div className="w-1/2">
          <p className="mb-1 text-earthTone-200 text-xs">類型</p>
          <Select
            value={menuType}
            onValueChange={(value) => {
              const newType = value as MenuTypeKey | 'all'
              setMenuType(newType)
              setIngredient('all')
            }}
          >
            <SelectTrigger className="border-orange-300 bg-[#F8F3E7] border-[1.5px] w-full  'focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)]'">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">全部</SelectItem>
                {Object.entries(MenuTypes).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-1/2">
          <p className="mb-1 text-earthTone-200 text-xs">主食材</p>
          <Select value={ingredient} onValueChange={(value) => setIngredient(value)}>
            <SelectTrigger className="border-orange-300 bg-[#F8F3E7] border-[1.5px] w-full focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">全部</SelectItem>
                {Object.entries(
                  menuType === 'all'
                    ? Object.values(MenuIngredients).reduce<Record<string, string>>(
                        (acc, ingredients) => ({ ...acc, ...ingredients }),
                        {}
                      )
                    : MenuIngredients[menuType]
                ).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Tabs defaultValue="my">
          <TabsList className="w-full">
            <TabsTrigger value="my">我的菜單</TabsTrigger>
            <TabsTrigger value="recommended">推薦</TabsTrigger>
          </TabsList>
          <TabsContent value="my" className="flex flex-col gap-4">
            {myRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => handleViewRecipe(recipe)}
                buttonRender={() => (
                  <button
                    className="p-2 bg-orange-100 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToMenuSet(recipe.id)
                    }}
                  >
                    <Plus size={24} color="#4a3c2b" />
                  </button>
                )}
              />
            ))}
          </TabsContent>
          <TabsContent value="recommended" className="flex flex-col gap-4">
            {recommendedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                buttonRender={() => (
                  <div className="flex gap-2">
                    <button
                      className={cn('p-2 bg-earthTone-100 rounded-full')}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(recipe.id)
                      }}
                    >
                      {recipe.isFavorite ? (
                        <Heart size={24} fill="#7b6a56" color="#7b6a56" />
                      ) : (
                        <Heart size={24} color="#7b6a56" />
                      )}
                    </button>
                    <button
                      className="p-2 bg-orange-100 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToMenuSet(recipe.id)
                      }}
                    >
                      <Plus size={24} color="#4a3c2b" />
                    </button>
                  </div>
                )}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <AddToMenuSetDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <RecipeFormDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        recipe={viewRecipe}
        isReadOnly
      />
    </main>
  )
}
