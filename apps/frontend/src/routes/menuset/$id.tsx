import { createFileRoute } from '@tanstack/react-router'
import { MenuSetDetailPage } from '@/features/menuSet/detail'

export const Route = createFileRoute('/menuset/$id')({
  component: MenuSetDetailPage,
})
