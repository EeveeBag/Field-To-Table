import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function HomePage() {
  return (
    <main className="mx-auto max-w-3xl">
      <p className="text-title text-sm tracking-wider md:text-base mb-1">
        本週靈感
      </p>
      <h1 className="text-xl font-bold mb-4 tracking-wider">
        快速找到要煮的菜
      </h1>
      <Input
        placeholder="搜尋菜名"
        className={cn(
          'border-2 mb-4',
          'focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)]',
        )}
      />
      <div className="flex gap-4">
        <div className="w-1/2">
          <p className="mb-1 text-earthTone-200 text-xs">菜色類型</p>
          <Select value="apple">
            <SelectTrigger className="border-orange-300 bg-[#F8F3E7] border-[1.5px] w-full  'focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)]'">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-1/2">
          <p className="mb-1 text-earthTone-200 text-xs">主食材</p>
          <Select value="apple">
            <SelectTrigger className="border-orange-300 bg-[#F8F3E7] border-[1.5px] w-full focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </main>
  )
}
