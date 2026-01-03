import { createFileRoute } from '@tanstack/react-router'
import { MenuDetailPage } from '@/features/menu/detail'

export const Route = createFileRoute('/menu/$id')({
  component: MenuDetailPage,
})
