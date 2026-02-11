import { createFileRoute } from '@tanstack/react-router'
import { PlaygroundPage } from '@/features/playground'

export const Route = createFileRoute('/playground/')({
  component: PlaygroundPage
})
