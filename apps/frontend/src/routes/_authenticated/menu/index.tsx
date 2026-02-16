import { createFileRoute } from '@tanstack/react-router'
import { MenuPage } from '@/features/menu/list'

export const Route = createFileRoute('/_authenticated/menu/')({
  component: MenuPage,
})
