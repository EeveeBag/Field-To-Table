import { createFileRoute } from '@tanstack/react-router'
import { MenuDetailPage } from '@/features/menu/detail'

export const Route = createFileRoute('/_authenticated/menu/$id')({
  component: MenuDetailPage,
})
