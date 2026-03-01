import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useMenuIngredients } from '@/features/menu/hooks/useMenu'
import type { Recipe } from '@/features/menu/types'

interface RecipeListCardProps {
  recipe: Recipe
  onEdit?: () => void
}

export function RecipeListCard({ recipe, onEdit }: RecipeListCardProps) {
  const { data: menuIngredients } = useMenuIngredients()
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = (event: React.MouseEvent) => {
    event.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <article className="relative flex flex-col gap-3 overflow-visible rounded-2xl bg-white p-4 pb-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm text-earthTone-200 mb-1">{menuIngredients?.types[recipe.type] ?? recipe.type}</p>
          <h2 className="text-lg font-bold text-primary mb-1 flex items-center gap-2">
            {recipe.name}
            <span className="text-sm font-normal text-earthTone-200">{recipe.servings} 人份</span>
          </h2>
          <p className="text-sm text-content">
            主食材：{menuIngredients?.ingredients[recipe.type]?.[recipe.mainIngredient] ?? recipe.mainIngredient}
          </p>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-2 bg-earthTone-150 rounded-full hover:bg-earthTone-200/30 transition-colors"
          >
            <Pencil size={20} color="#4a3c2b" />
          </button>
        )}
      </div>

      {isExpanded && !!recipe.ingredientsText && (
        <div className="w-full rounded-xl bg-earthTone-100 px-4 py-3">
          <p className="mb-2 text-sm font-medium text-earthTone-200">食材摘要</p>
          <p className="whitespace-pre-line text-sm text-primary leading-relaxed">
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
