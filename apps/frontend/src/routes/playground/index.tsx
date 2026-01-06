import { createFileRoute } from '@tanstack/react-router'
import { PlaygroundPage } from '@/playground'

export const Route = createFileRoute('/playground/')({
  component: PlaygroundPage,
})
