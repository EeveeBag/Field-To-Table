import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RecipeCard } from './components/recipe-card'
import { RecipeTypeEnum } from '@repo/shared/schemas'
import { PlusIcon, HeartIcon, HeartSolidIcon } from '@/components/ui/icon'

export function HomePage() {
  const [myRecipes] = useState([
    {
      id: '1',
      type: RecipeTypeEnum.enum.main,
      name: '紅燒牛肉麵',
      servings: 2,
      mainIngredient: '牛肉',
      ingredientsText: '牛肉、麵條、蔥、薑、蒜、醬油、八角、冰糖'
    }
  ])

  const [recommendedRecipes, setRecommendedRecipes] = useState([
    {
      id: '2',
      type: RecipeTypeEnum.enum.soup,
      name: '番茄蛋花湯',
      servings: 4,
      mainIngredient: '番茄',
      ingredientsText: '番茄、雞蛋、蔥、鹽、胡椒粉',
      isFavorite: true
    }
  ])

  const toggleFavorite = (recipeId: string) => {
    setRecommendedRecipes((prevRecipes) =>
      prevRecipes.map((recipe) =>
        recipe.id === recipeId ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
      )
    )
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
          <p className="mb-1 text-earthTone-200 text-xs">菜色類型</p>
          <Select value="apple">
            <SelectTrigger className="border-orange-300 bg-[#F8F3E7] border-[1.5px] w-full  'focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)]'">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-1/2">
          <p className="mb-1 text-earthTone-200 text-xs">主食材</p>
          <Select value="apple">
            <SelectTrigger className="border-orange-300 bg-[#F8F3E7] border-[1.5px] w-full focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
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
                buttonRender={() => (
                  <button className="p-2 bg-orange-100 rounded-full">
                    <PlusIcon size={24} color="#4a3c2b" />
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
                      onClick={() => toggleFavorite(recipe.id)}
                    >
                      {recipe.isFavorite ? (
                        <HeartSolidIcon size={24} color="#7b6a56" />
                      ) : (
                        <HeartIcon size={24} />
                      )}
                    </button>
                    <button className="p-2 bg-orange-100 rounded-full">
                      <PlusIcon size={24} color="#4a3c2b" />
                    </button>
                  </div>
                )}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
