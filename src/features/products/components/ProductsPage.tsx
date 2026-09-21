import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/api'
import { useOrgStore } from '@/components/layout'
import { listCategories } from '@/features/categories/api'
import { createProduct, deleteProduct, listProducts, updateProduct, type Product } from '../api'
import type { Category } from '@/features/categories/api'

export function ProductsPage() {
  const { orgs, stores, orgSlug, storeId, ready, changeOrg, changeStore } = useOrgStore()
  const [items, setItems] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!ready) return
    if (!orgSlug || !storeId) { setLoading(false); return }
    (async () => {
      try {
        const [list, cats] = await Promise.all([
          listProducts(orgSlug, storeId),
          listCategories(orgSlug, storeId).catch(() => [] as Category[]),
        ])
        setItems(list.data)
        setCategories(cats)
      } catch (err) {
        setError(getErrorMessage(err, 'Gagal memuat produk.'))
      } finally {
        setLoading(false)
      }
    })()
  }, [ready, orgSlug, storeId])

  async function reload() {
    setLoading(true)
    setError('')
    try {
      const list = await listProducts(orgSlug, storeId, {
        search: search || undefined,
        category_id: categoryId || undefined,
      })
      setItems(list.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat produk.'))
    } finally {
      setLoading(false)
    }
  }

  function startEdit(p: Product) {
    setEditing(p)
    setName(p.name)
    setSku(p.sku)
    setPrice(String(p.price))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !sku.trim()) return
    setSaving(true)
    setError('')
    try {
      const input = {
        name: name.trim(),
        sku: sku.trim(),
        description: '',
        price: Number(price) || 0,
        stock: editing?.stock ?? 0,
        unit: editing?.unit ?? 'pcs',
        category_id: editing?.category_id ?? (categoryId || null),
        image_url: '',
        ...(editing ? { is_active: editing.is_active } : {}),
      }
      if (editing) {
        const updated = await updateProduct(orgSlug, storeId, editing.id, input)
        setItems((prev) => prev.map((p) => (p.id === editing.id ? updated : p)))
      } else {
        const created = await createProduct(orgSlug, storeId, input)
        setItems((prev) => [...prev, created])
      }
      setName(''); setSku(''); setPrice(''); setEditing(null)
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal menyimpan produk.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Hapus ${p.name}?`)) return
    try {
      await deleteProduct(orgSlug, storeId, p.id)
      setItems((prev) => prev.filter((x) => x.id !== p.id))
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal menghapus produk.'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[22px] font-bold tracking-[-0.01em] text-text-primary">Produk</h2>
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
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama produk..." className="h-9 min-w-40 flex-1 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none" />
        <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU..." className="h-9 w-32 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Harga..." inputMode="numeric" className="h-9 w-28 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none" />
        <button type="submit" disabled={saving || !name.trim() || !sku.trim()} className="h-9 rounded-lg bg-primary px-4 text-[13px] font-bold text-white hover:bg-primary-hover disabled:opacity-40">{editing ? 'Simpan' : 'Tambah'}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setName(''); setSku(''); setPrice('') }} className="h-9 rounded-lg border border-border px-3 text-[13px] text-text-secondary hover:bg-bg">Batal</button>}
      </form>
      <div className="flex gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void reload() }} placeholder="Cari produk..." className="h-9 w-52 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none" />
        <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); }} className="h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none" aria-label="Filter kategori">
          <option value="">Semua kategori</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="button" onClick={() => void reload()} className="h-9 rounded-lg border border-border px-3 text-[13px] text-text-secondary hover:bg-bg">Cari</button>
      </div>
      {loading ? (
        <p className="py-8 text-center text-[13px] text-text-secondary">Memuat...</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-text-secondary">Belum ada produk.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 shadow-level-1">
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-text-primary">{p.name}</span>
                <span className="text-[12px] text-text-secondary">{p.sku} · Rp {p.price.toLocaleString('id-ID')} · stok {p.stock}</span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => startEdit(p)} className="text-[12px] font-medium text-primary hover:underline">Ubah</button>
                <button type="button" onClick={() => void handleDelete(p)} className="text-[12px] font-medium text-secondary hover:underline">Hapus</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
