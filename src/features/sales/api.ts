import { api } from '@/lib/api'

export interface SaleItemInput {
  product_id: string
  variant_id?: string | null
  quantity: number
}

export interface Sale {
  id: string
  store_id: string
  organization_id: string
  user_id: string
  total_amount: number
  discount_amount: number
  tax_amount: number
  grand_total: number
  payment_method: string
  status: string
  notes?: string
  created_at: string
}

const path = (orgSlug: string, storeId: string) =>
  `/org/${orgSlug}/stores/${storeId}/sales`

export async function createSale(
  orgSlug: string,
  storeId: string,
  input: { payment_method: string; items: SaleItemInput[]; notes?: string },
): Promise<Sale> {
  const { data } = await api.post(path(orgSlug, storeId), {
    payment_method: input.payment_method,
    discount_amount: 0,
    tax_amount: 0,
    notes: input.notes ?? '',
    items: input.items,
  })
  return data
}

export async function cancelSale(orgSlug: string, storeId: string, id: string): Promise<Sale> {
  const { data } = await api.patch(`${path(orgSlug, storeId)}/${id}/cancel`)
  return data
}
