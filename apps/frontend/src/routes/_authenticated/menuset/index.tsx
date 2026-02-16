import { createFileRoute } from '@tanstack/react-router'
import { MenuSetPage } from '@/features/menuSet/index'

export const Route = createFileRoute('/_authenticated/menuset/')({
  component: MenuSetPage,
})
