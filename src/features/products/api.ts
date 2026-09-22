import { api } from '@/lib/api'

export interface Product {
  id: string
  store_id: string
  organization_id: string
  name: string
  sku: string
  description?: string
  price: number
  stock: number
  unit: string
  category_id?: string | null
  image_url?: string
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface ProductList {
  data: Product[]
  total: number
  page: number
  limit: number
}

export interface ProductInput {
  name: string
  sku: string
  description: string
  price: number
  stock: number
  unit: string
  category_id?: string | null
  image_url: string
  is_active?: boolean
}

function path(orgSlug: string, storeId: string, id = '') {
  return `/org/${orgSlug}/stores/${storeId}/products${id ? `/${id}` : ''}`
}

export async function listProducts(
  orgSlug: string,
  storeId: string,
  params?: {
    search?: string
    category_id?: string
    page?: number
    limit?: number
  },
) {
  const { data } = await api.get<ProductList>(path(orgSlug, storeId), {
    params,
  })
  return data
}

export async function createProduct(
  orgSlug: string,
  storeId: string,
  input: ProductInput,
) {
  const { data } = await api.post<Product>(path(orgSlug, storeId), input)
  return data
}

export async function updateProduct(
  orgSlug: string,
  storeId: string,
  id: string,
  input: ProductInput,
) {
  const { data } = await api.put<Product>(path(orgSlug, storeId, id), input)
  return data
}

export async function deleteProduct(
  orgSlug: string,
  storeId: string,
  id: string,
) {
  await api.delete(path(orgSlug, storeId, id))
}
