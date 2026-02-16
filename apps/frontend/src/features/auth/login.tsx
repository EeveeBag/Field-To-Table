import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { signIn } from '@/shared/auth/client'
import { isDev } from '@/shared/lib/env'
import { useRouter, useSearch } from '@tanstack/react-router'

export function LoginPage() {
  const router = useRouter()
  const { redirect } = useSearch({ from: '/login' })

  const [account, setAccount] = useState(isDev ? import.meta.env.VITE_MAIL : '')
  const [password, setPassword] = useState(isDev ? import.meta.env.VITE_PASSWORD : '')

  const login = async () => {
    try {
      await signIn.email({
        email: account,
        password: password
      })
      router.history.push(redirect || '/')
    } catch (error) {
      // FIX: 後續再處理失敗邏輯
      console.error('登入失敗:', error)
    } finally {
      setAccount('')
      setPassword('')
    }
  }

  return (
    <main className="p-4">
      <h1 className="text-3xl font-semibold text-earthTone-300 mb-5">Login</h1>
      <Input
        value={account}
        type="email"
        placeholder="請輸入帳號..."
        className={cn(
          'border-2 mb-3',
          'focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)]'
        )}
        onChange={(e) => setAccount(e.target.value)}
      />
      <Input
        value={password}
        type="password"
        placeholder="請輸入密碼..."
        className={cn(
          'border-2 mb-3',
          'focus:outline-none focus:border-orange-300 focus:shadow-[0_0_0_3px_rgba(194,139,61,0.2)]'
        )}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex justify-end">
        <Button type="submit" variant="outline" onClick={login} className="cursor-pointer">
          登入
        </Button>
      </div>
    </main>
  )
}
