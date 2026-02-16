import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Plus, ChevronRight } from 'lucide-react'

interface AddToMenuDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddToMenuDialog({ open, onOpenChange }: AddToMenuDialogProps) {
  const [selectedMenuSet, setSelectedMenuSet] = useState<string | null>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          // 覆蓋預設的居中定位，改為底部彈出
          'fixed bottom-0 left-0 right-0 top-auto translate-x-0 translate-y-0',
          'mx-auto max-w-3xl w-full',
          'rounded-t-3xl bg-[#F8F3E7] border-none',
          'p-0 pb-safe',
          // 使用 Tailwind animate 類別
          'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom',
          'data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom',
          'duration-300'
        )}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-[#8B7355] mb-1">加入菜單組</p>
              <DialogTitle className="text-2xl font-bold text-earthTone-300 tracking-wide">
                選擇一組菜單
              </DialogTitle>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="px-6 py-2 bg-[#E5D4B8] rounded-full text-earthTone-300 font-medium hover:bg-[#D9C7AB] transition-colors"
            >
              關閉
            </button>
          </div>

          <button
            className={cn(
              'w-full p-6 mb-4 rounded-2xl',
              'border-2 border-dashed border-[#C28B3D]',
              'bg-white/50',
              'hover:bg-white/70 transition-colors',
              'text-left'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-[#C28B3D] bg-white flex items-center justify-center shrink-0">
                <Plus size={24} color="#C28B3D" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-earthTone-300 mb-1">建立新的菜單組</h3>
                <p className="text-sm text-[#8B7355]">Create new menu set</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedMenuSet('quick-dinner')}
            className={cn(
              'w-full p-6 mb-4 rounded-2xl',
              'border-2 transition-all',
              selectedMenuSet === 'quick-dinner'
                ? 'border-[#C28B3D] bg-[#FFF8E7]'
                : 'border-[#E5D4B8] bg-white/70 hover:bg-white'
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center shrink-0',
                  selectedMenuSet === 'quick-dinner' ? 'bg-[#C28B3D]' : 'bg-[#E5D4B8]'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-3',
                    selectedMenuSet === 'quick-dinner'
                      ? 'bg-white border-white'
                      : 'border-[#8B7355]'
                  )}
                />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-earthTone-300 mb-1">快速晚餐組合</h3>
                <p className="text-sm text-[#8B7355]">簡單快速的三道式晚餐</p>
              </div>
              <ChevronRight size={24} color="#8B7355" />
            </div>
          </button>

          <button
            className={cn(
              'w-full py-4 rounded-2xl font-bold text-lg',
              'bg-[#C28B3D] text-white',
              'hover:bg-[#B37B2D] transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            disabled={!selectedMenuSet}
          >
            加入菜單組
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
