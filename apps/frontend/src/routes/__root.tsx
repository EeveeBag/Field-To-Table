import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30
    },
    mutations: {
      onError: (error) => {
        toast.error(error.message || '操作失敗，請稍後再試')
      }
    }
  }
})

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <div className="p-6">404 Not Found</div>
})

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative h-dvh overflow-hidden bg-earthTone-50 font-sans-tc text-primary md:px-20 px-5 pt-6">
        <Outlet />
      </div>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
