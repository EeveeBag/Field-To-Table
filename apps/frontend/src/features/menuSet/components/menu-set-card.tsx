import { ChevronRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface MenuSetCardProps {
  menuSet: {
    id: string
    name: string
    description: string
    mainDishes: number
    sideDishes: number
    servings: number
  }
}

export function MenuSetCard({ menuSet }: MenuSetCardProps) {
  return (
    <Link
      to="/menuset/$id"
      params={{ id: menuSet.id }}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow block"
    >
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-primary mb-2">{menuSet.name}</h2>
          <p className="text-content text-sm mb-3">{menuSet.description}</p>
          <p className="text-earthTone-200 text-sm">
            主菜 {menuSet.mainDishes}，副菜 {menuSet.sideDishes}
          </p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <div className="px-4 py-2 bg-earthTone-100 rounded-full">
            <span className="text-content text-sm whitespace-nowrap">
              {menuSet.servings} 人份
            </span>
          </div>
          <ChevronRight size={24} color="#7b6a56" />
        </div>
      </div>
    </Link>
  )
}
