import { useState } from 'react'

type RecipeType = 'main' | 'side' | 'soup' | 'dessert'
interface Recipe {
  id: string
  name: string
  type: RecipeType
  mainIngredient: string
  servings: number
  ingredientsText?: string
  steps?: string
  notes?: string
}

type ListTab = 'my' | 'suggested'

export function MenuDetails() {
  const filteredRecipes: Recipe[] = [
    {
      id: '1',
      type: 'main',
      name: '紅燒牛肉麵',
      servings: 2,
      mainIngredient: '牛肉',
      ingredientsText: '牛肉、麵條、蔥、薑、蒜、醬油、八角、冰糖'
    }
  ]
  const recipeTypeLabels: Record<RecipeType, string> = {
    main: '主菜',
    side: '副菜',
    soup: '湯',
    dessert: '甜點'
  }

  const [activeListTab, setActiveListTab] = useState<ListTab>('my')
  const expandedRecipeId: string | null = null

  const handleRecipeCardClick = () => {}
  const toggleExpand = () => {}
  const isFavoriteRecipe = () => false
  const handleFavoriteClick = () => {}

  return (
    <>
      {filteredRecipes.map((recipe) => {
        const isExpanded = expandedRecipeId === recipe.id
        const isFav = isFavoriteRecipe()

        return (
          <article
            key={recipe.id}
            className="relative flex flex-col gap-[0.8rem] overflow-visible rounded-2xl bg-white p-4 pb-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
          >
            <div className="flex w-full items-start justify-between gap-2">
              <button
                type="button"
                className="flex-1 cursor-pointer border-0 bg-transparent p-0 text-left"
                onClick={() => handleRecipeCardClick()}
              >
                <p className="m-0 text-[0.85rem] text-[#8d7c63]">{recipeTypeLabels[recipe.type]}</p>

                <h2 className="m-0 mb-1 flex items-center gap-1 text-[18px] text-[#34251a]">
                  {recipe.name}
                  <span className="text-[0.85rem] text-[#8d7c63]">{recipe.servings} 人份</span>
                </h2>

                <p className="m-0 text-[0.9rem] text-[#6b655d]">主食材：{recipe.mainIngredient}</p>
              </button>

              <div className="flex items-center gap-1.5">
                {activeListTab === 'suggested' && (
                  <button
                    type="button"
                    className={[
                      'grid h-9 w-9 place-items-center rounded-full border-0 bg-black/5 text-[#a38341]',
                      isFav ? 'bg-[#f5e0b8] text-[#c27b2d]' : ''
                    ].join(' ')}
                    aria-pressed={isFav}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFavoriteClick()
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4.5 w-4.5 fill-current"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 20.5l-1.45-1.32C6 15 3 11.64 3 7.75 3 5 5 3 7.5 3A5 5 0 0 1 12 5.09 5 5 0 0 1 16.5 3C19 3 21 5 21 7.75c0 3.89-3 7.25-7.55 11.43L12 20.5Z"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Vue <Transition>：React 這裡先用條件渲染（你要動畫再加 CSS/Framer Motion） */}
            {isExpanded && !!recipe.ingredientsText && (
              <div className="w-full origin-top rounded-xl bg-earthTone-100 px-3 py-2.5">
                <p className="mb-1 text-[0.85rem] font-semibold text-[#7a6856]">食材摘要</p>
                <p className="m-0 whitespace-pre-line text-[0.85rem] leading-[1.4]">
                  {recipe.ingredientsText}
                </p>
              </div>
            )}

            <button
              type="button"
              className={[
                'absolute left-1/2 h-4 w-6 -translate-x-1/2 cursor-pointer border-0 bg-transparent p-0 leading-none',
                isExpanded ? '-bottom-0.5' : '-bottom-1.5'
              ].join(' ')}
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand()
              }}
              aria-expanded={isExpanded}
            >
              <span
                className={[
                  'mx-auto block h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-[#3b2d1f] transition-transform duration-200 ease',
                  isExpanded ? 'rotate-180' : ''
                ].join(' ')}
              />
            </button>
          </article>
        )
      })}
    </>
  )
}
