import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'

import type { RecipeType } from '@repo/shared/schemas'

export interface Recipe {
  id: string
  name: string
  type: RecipeType
  mainIngredient: string
  servings: number
  ingredientsText?: string
  isFavorite?: boolean
}

interface RecipeCardProps {
  recipe: Recipe
  buttonRender?: () => React.ReactNode
}

const recipeTypeLabels: Record<RecipeType, string> = {
  main: '主菜',
  side: '副菜',
  soup: '湯',
  dessert: '甜點'
}

export function RecipeCard({ recipe, buttonRender }: RecipeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = (event: React.MouseEvent) => {
    event.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <article className="relative flex flex-col gap-[0.8rem] overflow-visible rounded-2xl bg-white p-4 pb-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex w-full items-start justify-between gap-2">
        <Link
          className="flex-1 cursor-pointer border-0 bg-transparent p-0 text-left"
          to="/menu/$id"
          params={{ id: recipe.id }}
        >
          <p className="m-0 text-[0.85rem] text-[#8d7c63]">{recipeTypeLabels[recipe.type]}</p>
          <h2 className="m-0 mb-1 flex items-center gap-1 text-[18px] text-[#34251a]">
            {recipe.name}
            <span className="text-[0.85rem] text-[#8d7c63]">{recipe.servings} 人份</span>
          </h2>
          <p className="m-0 text-[0.9rem] text-[#6b655d]">主食材：{recipe.mainIngredient}</p>
        </Link>
        {buttonRender?.()}
      </div>

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
        className={cn(
          'absolute left-1/2 h-4 w-6 -translate-x-1/2 cursor-pointer border-0 bg-transparent p-0 leading-none',
          isExpanded ? '-bottom-0.5' : '-bottom-1.5'
        )}
        onClick={toggleExpand}
      >
        <span
          className={cn(
            'mx-auto block h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-[#3b2d1f] transition-transform duration-200 ease',
            isExpanded ? 'rotate-180' : ''
          )}
        />
      </button>
    </article>
  )
}
