import { createFileRoute } from '@tanstack/react-router'
import { MenuSetPage } from '@/features/menuSet/index'

export const Route = createFileRoute('/menuset/')({
  component: MenuSetPage,
})
