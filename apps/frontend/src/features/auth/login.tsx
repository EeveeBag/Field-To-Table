import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  return (
    <main className="p-4">
      <h1 className="text-3xl font-semibold text-earthTone-300 mb-5">Login</h1>
      <Input
        placeholder="請輸入帳號..."
        className={cn(
          'border-2 mb-3',
          'focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)]'
        )}
      />
      <Input
        placeholder="請輸入密碼..."
        className={cn(
          'border-2 mb-3',
          'focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)]'
        )}
      />
      <div className="flex justify-end">
        <Button variant="outline">登入</Button>
      </div>
    </main>
  )
}
