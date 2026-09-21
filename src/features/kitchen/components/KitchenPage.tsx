import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/api'
import { useOrgStore } from '@/components/layout'
import { listQueue, updateKitchenStatus, type KitchenSale } from '../api'

const NEXT: Record<string, string> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'served',
}

export function KitchenPage() {
  const { orgs, stores, orgSlug, storeId, ready, changeOrg, changeStore } = useOrgStore()
  const [items, setItems] = useState<KitchenSale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!ready) return
    if (!orgSlug || !storeId) { setLoading(false); return }
    setLoading(true)
    listQueue(orgSlug, storeId)
      .then(setItems)
      .catch((err: unknown) => setError(getErrorMessage(err, 'Gagal memuat antrian dapur.')))
      .finally(() => setLoading(false))
  }, [ready, orgSlug, storeId])

  async function advance(item: KitchenSale) {
    const next = NEXT[item.status]
    if (!next) return
    try {
      const updated = await updateKitchenStatus(orgSlug, storeId, item.id, next)
      setItems((prev) => prev.map((k) => (k.id === item.id ? updated : k)))
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal mengubah status.'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[22px] font-bold tracking-[-0.01em] text-text-primary">Dapur</h2>
        <div className="flex gap-2">
          <select value={orgSlug} onChange={(e) => void changeOrg(e.target.value)} className="h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none" aria-label="Organisasi">
            {orgs.map((o) => <option key={o.id} value={o.slug}>{o.name}</option>)}
          </select>
          <select value={storeId} onChange={(e) => changeStore(e.target.value)} className="h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none" aria-label="Store">
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>
      {error && <div className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-[13px] text-error" role="alert">{error}</div>}
      {loading ? (
        <p className="py-8 text-center text-[13px] text-text-secondary">Memuat...</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-text-secondary">Antrian kosong.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((k) => (
            <li key={k.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 shadow-level-1">
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-text-primary">Sale {k.sale_id.slice(0, 8)}</span>
                <span className="text-[12px] text-text-secondary">{k.status}</span>
              </div>
              {NEXT[k.status] && (
                <button type="button" onClick={() => void advance(k)} className="h-8 rounded-lg bg-primary px-3 text-[12px] font-bold text-white hover:bg-primary-hover">
                  → {NEXT[k.status]}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
