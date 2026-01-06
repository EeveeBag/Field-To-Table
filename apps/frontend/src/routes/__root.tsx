import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-dvh bg-earthTone-50 font-sans-tc text-primary">
        <Outlet />
      </div>
    </QueryClientProvider>
  )
}
