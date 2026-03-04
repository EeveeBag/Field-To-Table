import { useState, useEffect, useRef } from 'react'

import { Plus, Heart } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { RecipeTypeEnum, MainIngredientEnum } from '@repo/shared/schemas'

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
import { AddToMenuSetDialog } from './components/add-to-menu-set-dialog'
import { RecipeFormDialog } from './components/recipe-form-dialog'

import { useMenu, useMenuIngredients, useMenuDetails } from './hooks/useMenu'

import type { RecipeType, MainIngredient } from '@repo/shared/schemas'

export function HomePage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  useEffect(() => {
    debounceRef.current = setTimeout(() => setSearch(searchInput), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchInput])

  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [menuType, setMenuType] = useState<RecipeType | 'all'>('all')
  const [ingredient, setIngredient] = useState<MainIngredient | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const { data: recipes } = useMenu({
    search: !search ? undefined : search,
    type: menuType === 'all' ? undefined : menuType,
    mainIngredient: ingredient === 'all' ? undefined : ingredient
  })

  const { data: menuIngredients } = useMenuIngredients()

  const { data: recipeDetails } = useMenuDetails(selectedRecipeId ?? '', {
    enabled: !!viewDialogOpen && !!selectedRecipeId
  })

  const [recommendedRecipes, setRecommendedRecipes] = useState([
    {
      id: '2',
      type: RecipeTypeEnum.enum.soup,
      name: '番茄蛋花湯',
      servings: 4,
      mainIngredient: MainIngredientEnum.enum.vegetable,
      ingredientsText: '番茄、雞蛋、蔥、鹽、胡椒粉',
      steps:
        '1. 番茄切塊，雞蛋打散\n2. 熱鍋下油，爆香蔥段\n3. 加入番茄炒軟\n4. 倒入高湯，煮開後加入雞蛋液\n5. 調味後即可盛盤',
      notes: '可依個人喜好調整口味',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
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

  // 打開加入菜單組的彈窗
  const handleAddToMenuSet = (recipeId: string) => {
    setSelectedRecipeId(recipeId)
    console.log('recipe ID:', selectedRecipeId)
    setDialogOpen(true)
  }

  // 打開檢視詳情的彈窗
  const handleViewRecipe = (id: string) => {
    setSelectedRecipeId(id)
    setViewDialogOpen(true)
  }

  return (
    <main className="mx-auto max-w-3xl">
      {/* <pre>{JSON.stringify(recipes, null, 2)}</pre> */}

      <p className="text-title text-sm tracking-wider md:text-base mb-1">本週靈感</p>
      <h1 className="text-xl font-bold mb-4 tracking-wider">快速找到要煮的菜</h1>
      <Input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
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
              const newType = value as RecipeType | 'all'
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
                {menuIngredients &&
                  Object.entries(menuIngredients.types as Record<string, string>).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    )
                  )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-1/2">
          <p className="mb-1 text-earthTone-200 text-xs">主食材</p>
          <Select
            value={ingredient}
            onValueChange={(value) => setIngredient(value as MainIngredient | 'all')}
          >
            <SelectTrigger className="border-orange-300 bg-[#F8F3E7] border-[1.5px] w-full focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">全部</SelectItem>
                {menuIngredients &&
                  Object.entries(
                    (menuType === 'all'
                      ? Object.values(menuIngredients.ingredients).reduce<Record<string, string>>(
                          (acc, items) => ({ ...acc, ...items }),
                          {}
                        )
                      : (menuIngredients.ingredients[menuType] ?? {})) as Record<string, string>
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
            {recipes?.data?.map((item) => (
              <RecipeCard
                key={item.id}
                recipe={item}
                onClick={() => handleViewRecipe(item.id)}
                buttonRender={() => (
                  <button
                    className="p-2 bg-orange-100 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToMenuSet(item.id)
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
        key={selectedRecipeId}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        recipe={recipeDetails}
        isReadOnly
      />
    </main>
  )
}
