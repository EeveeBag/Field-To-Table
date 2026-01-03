import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '@/features/menu'

export const Route = createFileRoute('/')({
  component: HomePage,
})
