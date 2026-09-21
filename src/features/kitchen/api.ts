import { api } from '@/lib/api'

export interface KitchenSale {
  id: string
  sale_id: string
  organization_id: string
  store_id: string
  status: string
  priority: number
  notes?: string
  created_at: string
  updated_at: string
}

const path = (orgSlug: string, storeId: string) =>
  `/org/${orgSlug}/stores/${storeId}/kitchen`

export async function listQueue(orgSlug: string, storeId: string): Promise<KitchenSale[]> {
  const { data } = await api.get<{ data: KitchenSale[] }>(
    `${path(orgSlug, storeId)}/queue`,
  )

  return data.data
}

export async function updateKitchenStatus(
  orgSlug: string,
  storeId: string,
  id: string,
  status: string,
): Promise<KitchenSale> {
  const { data } = await api.patch<KitchenSale>(
    `${path(orgSlug, storeId)}/${id}/status`,
    { status },
  )

  return data
}