import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { authClient } from '@/shared/auth/client'
import { Tab } from '@/components/tab'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession()

    if (!session.data) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }

    return { session: session.data }
  },
  component: () => (
    <>
      <Outlet />
      <Tab />
    </>
  )
})
