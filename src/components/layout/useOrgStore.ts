import { useEffect, useState } from 'react'
import { listOrgs, listStores, selectOrg, getSavedOrgSlug, getSavedStoreId, saveOrgStore, type Organization, type Store } from '@/features/org/api'

interface Ctx {
  orgs: Organization[]
  stores: Store[]
  orgSlug: string
  storeId: string
  ready: boolean
  changeOrg: (slug: string) => Promise<void>
  changeStore: (sid: string) => void
}

export function useOrgStore(): Ctx {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [orgSlug, setOrgSlug] = useState(getSavedOrgSlug())
  const [storeId, setStoreId] = useState(getSavedStoreId())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    (async () => {
      const orgList = await listOrgs().catch(() => [])
      setOrgs(orgList)
      const slug = getSavedOrgSlug() || orgList[0]?.slug || ''
      if (!slug) { setReady(true); return }
      setOrgSlug(slug)
      const storeList = await listStores(slug).catch(() => [])
      setStores(storeList)
      const sid = getSavedStoreId() || storeList[0]?.id || ''
      setStoreId(sid)
      setReady(true)
    })()
  }, [])

  async function changeOrg(slug: string) {
    await selectOrg(slug).catch(() => null)
    setOrgSlug(slug)
    setStoreId('')
    const storeList = await listStores(slug)
    setStores(storeList)
    const sid = storeList[0]?.id || ''
    setStoreId(sid)
    if (sid) saveOrgStore(slug, sid)
  }

  function changeStore(sid: string) {
    setStoreId(sid)
    saveOrgStore(orgSlug, sid)
  }

  return { orgs, stores, orgSlug, storeId, ready, changeOrg, changeStore }
}
