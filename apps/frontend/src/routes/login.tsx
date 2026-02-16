import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '@/features/auth/login'
import { authClient } from '@/shared/auth/client'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined
  }),
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (session.data) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage
})
