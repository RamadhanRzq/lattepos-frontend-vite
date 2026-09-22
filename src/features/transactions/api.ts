import { api } from '@/lib/api'

export interface TransactionItem {
  id: string
  sale_id: string
  product_id: string
  variant_id?: string | null
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

export interface Transaction {
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
  items?: TransactionItem[]
  created_at: string
  updated_at: string
}

export interface TransactionList {
  data: Transaction[]
  total: number
  page: number
  limit: number
}

export interface DailyReport {
  date: string
  store_id: string
  count: number
  grand_total: number
  by_status: Record<string, number>
  by_payment: Record<string, number>
  by_hour: Record<string, number>
  items: { product_id: string; quantity: number; subtotal: number }[]
}

function path(orgSlug: string, storeId: string, id = '') {
  return `/org/${orgSlug}/stores/${storeId}/transactions${id ? `/${id}` : ''}`
}

export async function listTransactions(
  orgSlug: string,
  storeId: string,
  params?: { status?: string; page?: number; limit?: number },
): Promise<TransactionList> {
  const { data } = await api.get<TransactionList>(path(orgSlug, storeId), { params })
  return data
}

export async function getTransaction(
  orgSlug: string,
  storeId: string,
  id: string,
): Promise<Transaction> {
  const { data } = await api.get<Transaction>(path(orgSlug, storeId, id))
  return data
}

export async function cancelTransaction(
  orgSlug: string,
  storeId: string,
  id: string,
): Promise<Transaction> {
  const { data } = await api.patch<Transaction>(`${path(orgSlug, storeId, id)}/cancel`)
  return data
}

export async function getDailyReport(
  orgSlug: string,
  storeId: string,
  date?: string,
): Promise<DailyReport> {
  const { data } = await api.get<DailyReport>(`${path(orgSlug, storeId)}/daily`, {
    params: date ? { date } : undefined,
  })
  return data
}
