import { createFileRoute } from '@tanstack/react-router'
import { KitchenPage } from '@/features/kitchen'

export const Route = createFileRoute('/_app/kitchen')({
  component: KitchenPage,
})
