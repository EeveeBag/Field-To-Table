import { Link } from '@tanstack/react-router'
import { cn } from '@/shared/lib/cn'

const RouteButtons = [
  { name: '首頁', href: '/' },
  { name: '菜單組', href: '/menuset' },
  { name: '菜譜', href: '/menu' },
  { name: '我的', href: '/user' }
]

export function Tab() {
  return (
    <div className="fixed bottom-0 left-0 w-full z-10">
      <div className="flex justify-center px-4 py-2 bg-offWhite gap-1">
        {RouteButtons.map((item) => (
          <Link
            to={item.href}
            key={item.name}
            activeOptions={{ exact: item.href === '/' }}
            className={cn(
              'w-20 h-10 rounded-4xl flex items-center justify-center text-sm text-content'
            )}
            activeProps={{
              className: 'bg-orange-100 text-black font-medium'
            }}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
