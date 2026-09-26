import { createFileRoute } from '@tanstack/react-router'
import { RawMaterialsPage } from '@/features/rawmaterials'

export const Route = createFileRoute('/_app/rawmaterial')({
  component: RawMaterialsPage,
})
