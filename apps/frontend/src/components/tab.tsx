import { useRouter } from '@tanstack/react-router'
import { cn } from '@/shared/lib/cn'

export function Tab() {
  const router = useRouter()
  const RouteButtons = [
    {
      name: '首頁',
      href: '/'
    },
    {
      name: '菜單組',
      href: '/menuset'
    },
    {
      name: '菜譜',
      href: '/menu'
    },
    {
      name: '我的',
      href: '/user'
    }
  ]

  const currentRoute = router.state.location.pathname

  return (
    <div className="absolute bottom-0 w-full">
      <div className="flex justify-center px-4 py-2 bg-offWhite gap-1">
        {RouteButtons.map((item) => (
          <a
            href={item.href}
            key={item.name}
            className={cn(
              'w-20 h-10 rounded-4xl flex items-center justify-center text-sm',
              { 'bg-orange-100': currentRoute === item.href },
              currentRoute === item.href ? 'text-black font-medium' : 'text-content'
            )}
          >
            {item.name}
          </a>
        ))}
      </div>
    </div>
  )
}
