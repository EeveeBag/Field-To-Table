import { useState } from 'react'
import { Plus } from 'lucide-react'
import { MenuSetCard } from './components/menu-set-card'
import { CreateMenuSetDialog } from './components/create-menu-set-dialog'

export function MenuSetPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const menuSets = [
    {
      id: '1',
      name: '快速晚餐組合',
      description: '簡單快速的三道式晚餐',
      mainDishes: 1,
      sideDishes: 2,
      servings: 2
    },
    {
      id: '2',
      name: '家常週末大餐',
      description: '豐富多樣的週末家庭聚餐',
      mainDishes: 2,
      sideDishes: 3,
      servings: 4
    },
    {
      id: '3',
      name: '清爽健康套餐',
      description: '低卡營養均衡的輕食組合',
      mainDishes: 1,
      sideDishes: 2,
      servings: 2
    }
  ]

  return (
    <main className="mx-auto max-w-3xl pb-20">
      <p className="text-title text-sm tracking-wider md:text-base mb-2">MENU PLANNER</p>

      <div className="flex justify-between items-start mb-4">
        <h1 className="text-4xl font-bold tracking-wide">菜單組</h1>
        <button
          onClick={() => setDialogOpen(true)}
          className="w-14 h-14 bg-orange-300 rounded-full flex items-center justify-center hover:bg-orange-300/90 transition-colors"
        >
          <Plus size={28} color="#ffffff" strokeWidth={2.5} />
        </button>
      </div>

      <p className="text-content text-base mb-6">挑一組喜歡的菜單，直接展開煮飯計畫</p>

      <div className="flex flex-col gap-4">
        {menuSets.map((menuSet) => (
          <MenuSetCard key={menuSet.id} menuSet={menuSet} />
        ))}
      </div>

      <CreateMenuSetDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </main>
  )
}
