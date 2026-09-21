import { api } from '@/lib/api'

export interface Category {
  id: string
  organization_id: string
  store_id: string
  name: string
  slug: string
  description?: string
  parent_id?: string | null
  created_at: string
  updated_at: string
}

export interface CategoryInput {
  name: string
  slug: string
  description: string
  parent_id?: string | null
}

function path(orgSlug: string, storeId: string, id = '') {
  return `/org/${orgSlug}/stores/${storeId}/categories${id ? `/${id}` : ''}`
}

export async function listCategories(orgSlug: string, storeId: string) {
  const { data } = await api.get<Category[]>(path(orgSlug, storeId))
  return data ?? []
}

export async function createCategory(orgSlug: string, storeId: string, input: CategoryInput) {
  const { data } = await api.post<Category>(path(orgSlug, storeId), input)
  return data
}

export async function updateCategory(orgSlug: string, storeId: string, id: string, input: CategoryInput) {
  const { data } = await api.put<Category>(path(orgSlug, storeId, id), input)
  return data
}

export async function deleteCategory(orgSlug: string, storeId: string, id: string) {
  await api.delete(path(orgSlug, storeId, id))
}
