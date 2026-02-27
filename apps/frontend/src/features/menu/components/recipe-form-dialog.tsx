import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface Recipe {
  id: string
  type: 'main' | 'side' | 'soup' | 'dessert'
  typeName?: string
  name: string
  servings: number
  mainIngredient: string
  ingredientsText?: string
  steps?: string
  notes?: string
}

interface RecipeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipe?: Recipe | null
}

export function RecipeFormDialog({ open, onOpenChange, recipe }: RecipeFormDialogProps) {
  const isEditing = !!recipe

  const [name, setName] = useState('')
  const [servings, setServings] = useState('2')
  const [type, setType] = useState<string>('main')
  const [mainIngredient, setMainIngredient] = useState<string>('豬')
  const [ingredientsText, setIngredientsText] = useState('')
  const [steps, setSteps] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = () => {
    console.log({
      name,
      servings,
      type,
      mainIngredient,
      ingredientsText,
      steps,
      notes
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-white rounded-3xl max-w-md p-6 max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="flex flex-row justify-between items-center mb-4">
          <DialogTitle className="text-2xl font-bold text-primary">
            {isEditing ? '編輯菜譜' : '新增菜譜'}
          </DialogTitle>
          <DialogClose asChild>
            <button className="px-4 py-2 bg-earthTone-150 rounded-lg text-content text-sm font-medium hover:bg-earthTone-150/80 transition-colors">
              關閉
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-earthTone-200 text-sm mb-2">名稱</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-2 border-earthTone-150 bg-white focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)] py-3"
            />
          </div>

          <div>
            <label className="block text-earthTone-200 text-sm mb-2">幾人份</label>
            <Input
              type="number"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              min="1"
              className="border-2 border-earthTone-150 bg-white focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)] py-3"
            />
          </div>

          <div>
            <label className="block text-earthTone-200 text-sm mb-2">主類別</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="border-orange-300 bg-earthTone-100 border-[1.5px] w-full py-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="main">主菜</SelectItem>
                  <SelectItem value="side">副菜</SelectItem>
                  <SelectItem value="soup">湯</SelectItem>
                  <SelectItem value="dessert">甜點</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-earthTone-200 text-sm mb-2">主食材</label>
            <Select value={mainIngredient} onValueChange={setMainIngredient}>
              <SelectTrigger className="border-orange-300 bg-earthTone-100 border-[1.5px] w-full py-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="豬">豬</SelectItem>
                  <SelectItem value="牛">牛</SelectItem>
                  <SelectItem value="雞">雞</SelectItem>
                  <SelectItem value="魚">魚</SelectItem>
                  <SelectItem value="菜">菜</SelectItem>
                  <SelectItem value="蛋">蛋</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-earthTone-200 text-sm mb-2">食材（文字輸入即可）</label>
            <textarea
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border-2 border-earthTone-150 bg-white px-3 py-3 text-base transition-[border-color,box-shadow] duration-200 ease-in-out focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)] resize-y"
            />
          </div>

          <div>
            <label className="block text-earthTone-200 text-sm mb-2">步驟</label>
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border-2 border-earthTone-150 bg-white px-3 py-3 text-base transition-[border-color,box-shadow] duration-200 ease-in-out focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)] resize-y"
            />
          </div>

          <div>
            <label className="block text-earthTone-200 text-sm mb-2">備註 / 連結</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-2 border-earthTone-150 bg-white focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)] py-3"
            />
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
            onClick={handleSubmit}
            className="px-8 py-2 rounded-lg bg-orange-300 text-white hover:bg-orange-300/90"
          >
            {isEditing ? '儲存變更' : '新增菜譜'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
