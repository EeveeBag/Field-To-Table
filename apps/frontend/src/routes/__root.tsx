import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()
import { Tab } from '@/components/tab.tsx'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <div className="p-6">404 Not Found</div>
})

function RootLayout() {
  return (
<<<<<<< HEAD
    <>
      <div className="relative min-h-dvh bg-earthTone-50 font-sans-tc text-primary md:px-20 px-5 pt-6">
=======
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-dvh bg-earthTone-50 font-sans-tc text-primary">
>>>>>>> main
        <Outlet />
      </div>
      <Tab />
    </QueryClientProvider>
  )
}
