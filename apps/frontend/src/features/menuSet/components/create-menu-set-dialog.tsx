import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface CreateMenuSetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateMenuSetDialog({ open, onOpenChange }: CreateMenuSetDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [servings, setServings] = useState('4')
  const [selectedRecipes] = useState<string[]>([])

  const myRecipes = [
    { id: '1', name: '紅燒牛肉麵' },
    { id: '2', name: '番茄蛋花湯' },
    { id: '3', name: '清炒時蔬' }
  ]

  const favoriteRecipes = [
    { id: '4', name: '宮保雞丁' },
    { id: '5', name: '麻婆豆腐' }
  ]

  const handleAddRecipe = () => {}

  const handleCreate = () => {
    console.log({ name, description, servings, selectedRecipes })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-white rounded-3xl max-w-md p-6 max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="flex flex-row justify-between items-center mb-4">
          <DialogTitle className="text-2xl font-bold text-primary">建立新的菜單組</DialogTitle>
          <DialogClose asChild>
            <button className="px-4 py-2 bg-earthTone-150 rounded-lg text-content text-sm font-medium hover:bg-earthTone-150/80 transition-colors">
              關閉
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <label className="block text-content text-sm mb-2">菜單組名稱</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：週末晚餐"
              className="border-2 border-earthTone-150 bg-earthTone-100 focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)] py-3"
            />
          </div>

          <div>
            <label className="block text-content text-sm mb-2">描述（選填）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="這組菜單的備註"
              rows={3}
              className="w-full rounded-2xl border-2 border-earthTone-150 bg-earthTone-100 px-3 py-3 text-base transition-[border-color,box-shadow] duration-200 ease-in-out focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)] resize-y"
            />
          </div>

          <div>
            <label className="block text-content text-sm mb-2">幾人份</label>
            <Input
              type="number"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              min="1"
              className="border-2 border-earthTone-150 bg-earthTone-100 focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)] py-3"
            />
          </div>

          <div className="bg-earthTone-100 rounded-2xl p-4">
            <p className="text-content font-medium mb-4">選擇要加入的菜色</p>

            <Tabs defaultValue="my" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="my" className="flex-1">
                  自己的菜譜
                </TabsTrigger>
                <TabsTrigger value="favorite" className="flex-1">
                  收藏菜譜
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my">
                <div className="flex gap-2 items-center">
                  <Select>
                    <SelectTrigger className="flex-1 border-2 border-orange-300 bg-white py-3 font-normal text-earthTone-200">
                      <SelectValue placeholder="選擇菜譜" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {myRecipes.map((recipe) => (
                          <SelectItem key={recipe.id} value={recipe.id}>
                            {recipe.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <button
                    onClick={handleAddRecipe}
                    className="p-2 hover:bg-earthTone-150 rounded-lg transition-colors"
                  >
                    <Plus size={24} color="#4a3c2b" />
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="favorite">
                <div className="flex gap-2 items-center">
                  <Select>
                    <SelectTrigger className="flex-1 border-2 border-orange-300 bg-white py-3 font-normal text-earthTone-200">
                      <SelectValue placeholder="選擇菜譜" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {favoriteRecipes.map((recipe) => (
                          <SelectItem key={recipe.id} value={recipe.id}>
                            {recipe.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <button
                    onClick={handleAddRecipe}
                    className="p-2 hover:bg-earthTone-150 rounded-lg transition-colors"
                  >
                    <Plus size={24} color="#4a3c2b" />
                  </button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="mt-6 flex flex-row justify-center gap-3">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="px-8 py-2 rounded-lg border-2 border-earthTone-200 text-content hover:bg-earthTone-100"
            >
              取消
            </Button>
          </DialogClose>
          <Button
            onClick={handleCreate}
            className="px-8 py-2 rounded-lg bg-orange-300 text-white hover:bg-orange-300/90"
          >
            建立菜單組
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
