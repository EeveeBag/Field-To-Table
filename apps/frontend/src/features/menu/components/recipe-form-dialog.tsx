import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

import { useMenuIngredients } from '@/features/menu/hooks/useMenu'

import type { RecipeType, MainIngredient } from '@repo/shared/schemas'
import type { Recipe } from '@/features/menu/types'

interface RecipeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipe?: Recipe | null
  isReadOnly?: boolean
}

export function RecipeFormDialog({
  open,
  onOpenChange,
  recipe,
  isReadOnly = false
}: RecipeFormDialogProps) {
  const isEditing = !!recipe

  const [name, setName] = useState(recipe?.name || '')
  const [servings, setServings] = useState(recipe?.servings?.toString() || '-')
  const [type, setType] = useState<RecipeType | 'all'>(recipe?.type ?? 'all')
  const [mainIngredient, setIngredient] = useState<MainIngredient | 'all'>(
    recipe?.mainIngredient ?? 'all'
  )
  const [ingredientsText, setIngredientsText] = useState(recipe?.ingredientsText || '')
  const [steps, setSteps] = useState(recipe?.steps || '')
  const [notes, setNotes] = useState(recipe?.notes || '')

  const { data: menuIngredients } = useMenuIngredients()

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

  const title = isReadOnly ? '查看菜譜' : isEditing ? '編輯菜譜' : '新增菜譜'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-white rounded-3xl max-w-md p-6 max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="flex flex-row justify-between items-center mb-4">
          <DialogTitle className="text-2xl font-bold text-primary">{title}</DialogTitle>
          <DialogDescription className="sr-only">菜譜詳細資訊</DialogDescription>
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
              value={isReadOnly ? recipe?.name || '' : name}
              onChange={(e) => setName(e.target.value)}
              disabled={isReadOnly}
              className="border-2 border-earthTone-150 bg-white focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)] py-3"
            />
          </div>

          <div>
            <label className="block text-earthTone-200 text-sm mb-2">幾人份</label>
            <Input
              type="number"
              value={isReadOnly ? recipe?.servings?.toString() || '' : servings}
              onChange={(e) => setServings(e.target.value)}
              disabled={isReadOnly}
              min="1"
              className="border-2 border-earthTone-150 bg-white focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)] py-3"
            />
          </div>

          <div>
            <label className="block text-earthTone-200 text-sm mb-2">主類別</label>

            <Select
              value={type}
              onValueChange={(value) => {
                const newType = value as RecipeType | 'all'
                setType(newType)
                setIngredient('all')
              }}
              disabled={isReadOnly}
            >
              <SelectTrigger className="border-orange-300 bg-earthTone-100 border-[1.5px] w-full py-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">全部</SelectItem>
                  {menuIngredients &&
                    Object.entries(menuIngredients.types).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-earthTone-200 text-sm mb-2">主食材</label>
            <Select
              value={mainIngredient}
              onValueChange={(value) => setIngredient(value as MainIngredient | 'all')}
              disabled={isReadOnly}
            >
              <SelectTrigger className="border-orange-300 bg-earthTone-100 border-[1.5px] w-full py-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">全部</SelectItem>
                  {menuIngredients &&
                    Object.entries(
                      type === 'all'
                        ? Object.values(menuIngredients.ingredients).reduce(
                            (acc, items) => ({ ...acc, ...items }),
                            {}
                          )
                        : (menuIngredients.ingredients[type] ?? {})
                    ).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-earthTone-200 text-sm mb-2">食材（文字輸入即可）</label>
            <textarea
              value={isReadOnly ? recipe?.ingredientsText || '' : ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className="w-full rounded-2xl border-2 border-earthTone-150 bg-white px-3 py-3 text-base transition-[border-color,box-shadow] duration-200 ease-in-out focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)] resize-y"
            />
          </div>

          <div>
            <label className="block text-earthTone-200 text-sm mb-2">步驟</label>
            <textarea
              value={isReadOnly ? recipe?.steps || '' : steps}
              onChange={(e) => setSteps(e.target.value)}
              disabled={isReadOnly}
              rows={4}
              className="w-full rounded-2xl border-2 border-earthTone-150 bg-white px-3 py-3 text-base transition-[border-color,box-shadow] duration-200 ease-in-out focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)] resize-y"
            />
          </div>

          <div>
            <label className="block text-earthTone-200 text-sm mb-2">備註 / 連結</label>
            <Input
              value={isReadOnly ? recipe?.notes || '' : notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isReadOnly}
              className="border-2 border-earthTone-150 bg-white focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)] py-3"
            />
          </div>
        </div>

        {!isReadOnly && (
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
        )}
      </DialogContent>
    </Dialog>
  )
}
