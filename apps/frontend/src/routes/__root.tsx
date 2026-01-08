import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Tab } from '@/components/tab.tsx'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <div className="p-6">404 Not Found</div>,
})

function RootLayout() {
  return (
    <>
      <div className="relative min-h-dvh bg-earthTone-50 font-sans-tc text-primary md:px-20 px-5 pt-6">
        <Outlet />
      </div>
      <Tab />
    </>
  )
}
