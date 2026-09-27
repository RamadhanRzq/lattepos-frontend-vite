import { api } from '@/lib/api'

export type TableStatus = 'available' | 'occupied' | 'reserved'

export interface RestaurantTable {
  id: string
  organization_id: string
  store_id: string
  name: string
  area: string
  capacity: number
  status: TableStatus
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TableInput {
  name: string
  area: string
  capacity: number
  is_active: boolean
}

function path(orgSlug: string, storeId: string, id = '', suffix = '') {
  const base = `/org/${orgSlug}/stores/${storeId}/tables`
  return `${base}${id ? `/${id}` : ''}${suffix}`
}

export async function listTables(
  orgSlug: string,
  storeId: string,
  filter?: { status?: TableStatus; area?: string },
) {
  const { data } = await api.get<RestaurantTable[]>(path(orgSlug, storeId), {
    params: filter,
  })
  return data
}

export async function createTable(
  orgSlug: string,
  storeId: string,
  input: TableInput,
) {
  const { data } = await api.post<RestaurantTable>(
    path(orgSlug, storeId),
    input,
  )
  return data
}

export async function updateTable(
  orgSlug: string,
  storeId: string,
  id: string,
  input: TableInput,
) {
  const { data } = await api.put<RestaurantTable>(
    path(orgSlug, storeId, id),
    input,
  )
  return data
}

export async function updateTableStatus(
  orgSlug: string,
  storeId: string,
  id: string,
  status: TableStatus,
) {
  const { data } = await api.patch<RestaurantTable>(
    path(orgSlug, storeId, id, '/status'),
    { status },
  )
  return data
}

export async function deleteTable(
  orgSlug: string,
  storeId: string,
  id: string,
) {
  await api.delete(path(orgSlug, storeId, id))
}
