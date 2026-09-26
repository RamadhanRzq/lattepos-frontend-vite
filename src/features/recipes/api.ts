import { api } from '@/lib/api'

export interface RecipeItem {
  id: string
  recipe_id: string
  ingredient_product_id: string
  ingredient_name?: string
  ingredient_sku?: string
  quantity: number
  unit: string
  wastage_percentage: number
  sequence: number
  notes?: string
}

export interface Recipe {
  id: string
  organization_id: string
  store_id: string
  product_id: string
  name: string
  version: number
  yield_quantity: number
  is_active: boolean
  notes?: string
  items: RecipeItem[]
  created_at: string
  updated_at: string
}

export interface RecipeItemInput {
  ingredient_product_id: string
  quantity: number
  unit: string
  wastage_percentage: number
  notes: string
}

export interface RecipeInput {
  name: string
  version: number
  yield_quantity: number
  is_active: boolean
  notes: string
  items: RecipeItemInput[]
}

function path(orgSlug: string, storeId: string, productId: string, id = '') {
  const base = `/org/${orgSlug}/stores/${storeId}/products/${productId}/recipes`
  return id ? `${base}/${id}` : base
}

export async function listRecipes(
  orgSlug: string,
  storeId: string,
  productId: string,
) {
  const { data } = await api.get<Recipe[]>(path(orgSlug, storeId, productId))
  return data
}

export async function createRecipe(
  orgSlug: string,
  storeId: string,
  productId: string,
  input: RecipeInput,
) {
  const { data } = await api.post<Recipe>(
    path(orgSlug, storeId, productId),
    input,
  )
  return data
}

export async function updateRecipe(
  orgSlug: string,
  storeId: string,
  productId: string,
  id: string,
  input: RecipeInput,
) {
  const { data } = await api.put<Recipe>(
    path(orgSlug, storeId, productId, id),
    input,
  )
  return data
}

export async function deleteRecipe(
  orgSlug: string,
  storeId: string,
  productId: string,
  id: string,
) {
  await api.delete(path(orgSlug, storeId, productId, id))
}

export async function activateRecipe(
  orgSlug: string,
  storeId: string,
  productId: string,
  id: string,
  isActive: boolean,
) {
  const { data } = await api.patch<Recipe>(
    `${path(orgSlug, storeId, productId, id)}/activate`,
    {
      is_active: isActive,
    },
  )
  return data
}
