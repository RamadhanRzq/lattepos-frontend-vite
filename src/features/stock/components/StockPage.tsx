import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/api'
import { useOrgStore } from '@/components/layout'
import { listMovements, recordMovement, type StockMovement } from '../api'
import { listProducts, type Product } from '@/features/products/api'

export function StockPage() {
  const { orgs, stores, orgSlug, storeId, ready, changeOrg, changeStore } = useOrgStore()
  const [items, setItems] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [productId, setProductId] = useState('')
  const [type, setType] = useState('in')
  const [quantity, setQuantity] = useState('')
  const [saving, setSaving] = useState(false)

  const productById: Record<string, string> = Object.fromEntries(products.map((p) => [p.id, p.name]))

  useEffect(() => {
    if (!ready) return
    if (!orgSlug || !storeId) { setLoading(false); return }
    setLoading(true)
    Promise.all([listMovements(orgSlug, storeId), listProducts(orgSlug, storeId)])
      .then(([list, prods]) => {
        setItems(list.data)
        setProducts(prods.data)
      })
      .catch((err: unknown) => setError(getErrorMessage(err, 'Gagal memuat stok.')))
      .finally(() => setLoading(false))
  }, [ready, orgSlug, storeId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!productId || !orgSlug || !storeId) return
    const qty = Number(quantity)
    if (!qty || qty <= 0) return
    setSaving(true)
    setError('')
    try {
      const created = await recordMovement(orgSlug, storeId, { product_id: productId, type, quantity: qty })
      setItems((prev) => [created, ...prev])
      setQuantity('')
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal mencatat movement.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[22px] font-bold tracking-[-0.01em] text-text-primary">Stok</h2>
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
      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-wrap gap-2">
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="h-9 min-w-44 flex-1 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none" aria-label="Produk">
          <option value="">Pilih produk...</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name} (stok {p.stock})</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none" aria-label="Tipe movement">
          <option value="in">Masuk</option>
          <option value="out">Keluar</option>
          <option value="adjustment">Penyesuaian</option>
          <option value="return">Retur</option>
        </select>
        <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Qty..." inputMode="numeric" className="h-9 w-24 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none" />
        <button type="submit" disabled={saving || !productId || !quantity} className="h-9 rounded-lg bg-primary px-4 text-[13px] font-bold text-white hover:bg-primary-hover disabled:opacity-40">Catat</button>
      </form>
      {loading ? (
        <p className="py-8 text-center text-[13px] text-text-secondary">Memuat...</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-text-secondary">Belum ada movement.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 shadow-level-1">
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-text-primary">{productById[m.product_id] ?? m.product_id}</span>
                <span className="text-[12px] text-text-secondary">{m.type} · {m.stock_before} → {m.stock_after}</span>
              </div>
              <span className="text-[13px] font-bold text-text-primary">+{m.quantity}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
