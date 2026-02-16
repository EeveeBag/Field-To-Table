import { createFileRoute } from '@tanstack/react-router'
import { MenuSetDetailPage } from '@/features/menuSet/detail'

export const Route = createFileRoute('/_authenticated/menuset/$id')({
  component: MenuSetDetailPage,
})
