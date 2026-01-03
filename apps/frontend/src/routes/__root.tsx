import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="min-h-dvh bg-earthTone-50 font-sans-tc text-primary">
      <Outlet />
    </div>
  )
}
