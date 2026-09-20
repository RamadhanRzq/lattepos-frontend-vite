import { createFileRoute } from '@tanstack/react-router'
import { CategoriesPage } from '@/features/categories'

export const Route = createFileRoute('/_app/categories')({
  component: CategoriesPage,
})
