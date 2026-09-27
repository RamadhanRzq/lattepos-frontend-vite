import { createFileRoute } from '@tanstack/react-router'
import { TablesPage } from '@/features/tables'

export const Route = createFileRoute('/_app/tables')({
  component: TablesPage,
})
