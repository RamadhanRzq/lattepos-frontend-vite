import { api } from '@/lib/api'

export interface StockMovement {
  id: string
  organization_id: string
  store_id: string
  product_id: string
  variant_id?: string | null
  type: string
  quantity: number
  stock_before: number
  stock_after: number
  notes?: string
  created_at: string
}

export interface StockList {
  data: StockMovement[]
  total: number
  page: number
  limit: number
}

const path = (orgSlug: string, storeId: string) =>
  `/org/${orgSlug}/stores/${storeId}/stock-movements`

export async function listMovements(orgSlug: string, storeId: string, params?: { product_id?: string; type?: string }): Promise<StockList> {
  const { data } = await api.get<StockList>(path(orgSlug, storeId), { params })
  return data
}

export async function recordMovement(
  orgSlug: string,
  storeId: string,
  input: { product_id: string; type: string; quantity: number; notes?: string },
): Promise<StockMovement> {
  const { data } = await api.post<StockMovement>(path(orgSlug, storeId), {
    product_id: input.product_id,
    variant_id: null,
    type: input.type,
    quantity: input.quantity,
    reference_type: '',
    reference_id: '',
    notes: input.notes ?? '',
    allow_negative: false,
  })
  return data
}
