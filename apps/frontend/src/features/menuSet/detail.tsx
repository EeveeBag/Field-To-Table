import { useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const mockMenuSetData = {
  id: '1',
  name: '快速晚餐組合',
  description: '簡單快速的三道式晚餐',
  servings: 2,
  dishes: [
    {
      id: '1',
      type: 'main',
      typeName: '主菜',
      name: '煎鮭魚',
      category: '魚',
      ingredients: [{ name: '鮭魚', amount: '1片' }]
    },
    {
      id: '2',
      type: 'side',
      typeName: '副菜',
      name: '炒空心菜',
      category: '菜',
      ingredients: [
        { name: '空心菜', amount: '1包' },
        { name: '蒜頭', amount: '3個' }
      ]
    },
    {
      id: '3',
      type: 'side',
      typeName: '副菜',
      name: '櫛瓜煎蛋',
      category: '菜',
      ingredients: [
        { name: '櫛瓜', amount: '1條' },
        { name: '雞蛋', amount: '3個' }
      ]
    }
  ]
}

export function MenuSetDetailPage() {
  const { id } = useParams({ from: '/menuset/$id' })
  const [isEditing, setIsEditing] = useState(false)

  const [editName, setEditName] = useState(mockMenuSetData.name)
  const [editDescription, setEditDescription] = useState(mockMenuSetData.description)
  const [editServings, setEditServings] = useState(mockMenuSetData.servings.toString())

  const handleSave = () => {
    console.log({ id, editName, editDescription, editServings })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditName(mockMenuSetData.name)
    setEditDescription(mockMenuSetData.description)
    setEditServings(mockMenuSetData.servings.toString())
    setIsEditing(false)
  }

  return (
    <main className="mx-auto max-w-3xl h-[calc(100dvh-24px-56px)] flex flex-col">
      <Link
        to="/menuset"
        className="inline-flex items-center gap-2 text-title hover:text-title/80 transition-colors mb-4 shrink-0"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">菜單組列表</span>
      </Link>

      <div className="bg-white rounded-2xl p-6 mb-4 shrink-0 max-h-[45vh] overflow-y-auto">
        <p className="text-earthTone-200 text-sm mb-3">菜單組詳情</p>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-earthTone-200 text-sm mb-2">名稱</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border-2 border-earthTone-150 bg-white focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)] py-3"
              />
            </div>

            <div>
              <label className="block text-earthTone-200 text-sm mb-2">描述</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border-2 border-earthTone-150 bg-white px-3 py-3 text-base transition-[border-color,box-shadow] duration-200 ease-in-out focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)] resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={editServings}
                onChange={(e) => setEditServings(e.target.value)}
                min="1"
                className="w-32 border-2 border-earthTone-150 bg-white focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)] py-3"
              />
              <span className="text-content">人份</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="px-6 py-2 rounded-lg border-2 border-earthTone-200 text-content hover:bg-earthTone-100"
              >
                取消
              </Button>
              <Button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg bg-orange-300 text-white hover:bg-orange-300/90"
              >
                儲存
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-primary mb-2">{mockMenuSetData.name}</h1>
            <p className="text-content mb-4">{mockMenuSetData.description}</p>
            <div className="flex justify-between items-center">
              <div className="px-4 py-2 bg-earthTone-150 rounded-full">
                <span className="text-content text-sm">{mockMenuSetData.servings} 人份</span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 border-2 border-earthTone-200 rounded-lg text-content text-sm font-medium hover:bg-earthTone-100 transition-colors"
              >
                編輯
              </button>
            </div>
          </>
        )}
      </div>

      <Tabs defaultValue="dishes" className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="w-full mb-4 shrink-0">
          <TabsTrigger value="dishes" className="flex-1">
            菜色列表
          </TabsTrigger>
          <TabsTrigger value="ingredients" className="flex-1">
            食材清單
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dishes" className="flex-1 min-h-0">
          <div className="bg-white rounded-2xl p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold text-primary mb-4 shrink-0">菜色列表</h2>
            <div className="space-y-3 overflow-y-auto flex-1">
              {mockMenuSetData.dishes.map((dish) => (
                <div key={dish.id} className="bg-earthTone-100 rounded-xl p-4">
                  <p className="text-earthTone-200 text-sm mb-1">{dish.typeName}</p>
                  <p className="text-primary font-medium">
                    {dish.name}（{dish.typeName}/{dish.category}）
                  </p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ingredients" className="flex-1 min-h-0">
          <div className="bg-white rounded-2xl p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold text-primary mb-4 shrink-0">食材清單</h2>
            <div className="space-y-3 overflow-y-auto flex-1">
              {mockMenuSetData.dishes.map((dish) => (
                <div key={dish.id} className="bg-earthTone-100 rounded-xl p-4">
                  <p className="text-title font-medium mb-2">{dish.name}</p>
                  <div className="space-y-1">
                    {dish.ingredients.map((ingredient, idx) => (
                      <p key={idx} className="text-content text-sm">
                        {ingredient.name} {ingredient.amount}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
