import { api } from '@/lib/api'

export interface Organization {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Store {
  id: string
  organization_id: string
  name: string
  code: string
  address?: string
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function listOrgs() {
  const { data } = await api.get<Organization[]>('/organizations')
  return data
}

export async function listStores(orgSlug: string) {
  const { data } = await api.get<Store[]>(`/org/${orgSlug}/stores`)
  return data
}

export async function selectOrg(slug: string) {
  const { data } = await api.post<{ token: string; token_type: string }>(`/org/${slug}/auth/select`)
  localStorage.setItem('access_token', data.token)
  return data
}

const ORG_KEY = 'lattepos_org_slug'
const STORE_KEY = 'lattepos_store_id'

export function getSavedOrgSlug() {
  return localStorage.getItem(ORG_KEY) || ''
}

export function getSavedStoreId() {
  return localStorage.getItem(STORE_KEY) || ''
}

export function saveOrgStore(orgSlug: string, storeId: string) {
  localStorage.setItem(ORG_KEY, orgSlug)
  localStorage.setItem(STORE_KEY, storeId)
}
