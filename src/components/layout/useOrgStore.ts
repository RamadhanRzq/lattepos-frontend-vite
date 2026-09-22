import { useEffect, useState } from 'react'
import {
  listOrgs,
  listStores,
  selectOrg,
  getSavedOrgSlug,
  getSavedStoreId,
  saveOrgStore,
} from '@/features/org/api'
import type { Organization, Store } from '@/features/org/api'

interface Ctx {
  orgs: Organization[]
  stores: Store[]
  orgSlug: string
  storeId: string
  ready: boolean
  changeOrg: (slug: string) => Promise<void>
  changeStore: (sid: string) => void
}

let orgs: Organization[] = []
let stores: Store[] = []
let orgSlug = getSavedOrgSlug()
let storeId = getSavedStoreId()
let ready = false
let initPromise: Promise<void> | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

async function init() {
  if (initPromise) return initPromise
  initPromise = (async () => {
    const orgList = await listOrgs().catch(() => [])
    orgs = orgList
    const slug = getSavedOrgSlug() || orgList[0]?.slug || ''
    if (!slug) {
      ready = true
      emit()
      return
    }
    orgSlug = slug
    emit()
    const storeList = await listStores(slug).catch(() => [])
    stores = storeList
    storeId = getSavedStoreId() || storeList[0]?.id || ''
    ready = true
    emit()
  })()
  return initPromise
}

async function changeOrg(slug: string) {
  await selectOrg(slug).catch(() => null)
  orgSlug = slug
  storeId = ''
  stores = []
  emit()
  const storeList = await listStores(slug).catch(() => [])
  stores = storeList
  storeId = storeList[0]?.id || ''
  if (storeId) saveOrgStore(slug, storeId)
  emit()
}

function changeStore(sid: string) {
  storeId = sid
  saveOrgStore(orgSlug, sid)
  emit()
}

export function useOrgStore(): Ctx {
  const [, setTick] = useState(0)
  useEffect(() => {
    const cb = () => setTick((t) => t + 1)
    listeners.add(cb)
    return () => {
      listeners.delete(cb)
    }
  }, [])
  useEffect(() => {
    void init()
  }, [])
  return { orgs, stores, orgSlug, storeId, ready, changeOrg, changeStore }
}
