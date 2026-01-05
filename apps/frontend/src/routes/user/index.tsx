import { createFileRoute } from '@tanstack/react-router'
import { InfoPage } from '@/features/user'

export const Route = createFileRoute('/user/')({
  component: InfoPage,
})
