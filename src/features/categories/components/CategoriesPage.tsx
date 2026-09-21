import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/api'
import { useOrgStore } from '@/components/layout'
import { createCategory, deleteCategory, listCategories, updateCategory, type Category } from '../api'

export function CategoriesPage() {
  const { orgs, stores, orgSlug, storeId, ready, changeOrg, changeStore } = useOrgStore()
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!ready) return
    if (!orgSlug || !storeId) { setLoading(false); return }
    setLoading(true)
    listCategories(orgSlug, storeId)
      .then(setItems)
      .catch((err: unknown) => setError(getErrorMessage(err, 'Gagal memuat kategori.')))
      .finally(() => setLoading(false))
  }, [ready, orgSlug, storeId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !orgSlug || !storeId) return
    setSaving(true)
    setError('')
    try {
      const input = { name: name.trim(), slug: '', description: '', parent_id: null }
      if (editing) {
        const updated = await updateCategory(orgSlug, storeId, editing.id, input)
        setItems((prev) => prev.map((c) => (c.id === editing.id ? updated : c)))
      } else {
        const created = await createCategory(orgSlug, storeId, input)
        setItems((prev) => [...prev, created])
      }
      setName('')
      setEditing(null)
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal menyimpan kategori.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus kategori ini?')) return
    try {
      await deleteCategory(orgSlug, storeId, id)
      setItems((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal menghapus kategori.'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[22px] font-bold tracking-[-0.01em] text-text-primary">Kategori</h2>
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
      <form onSubmit={(e) => void handleSubmit(e)} className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kategori baru..." className="h-9 flex-1 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none" />
        <button type="submit" disabled={saving || !name.trim()} className="h-9 shrink-0 rounded-lg bg-primary px-4 text-[13px] font-bold text-white hover:bg-primary-hover disabled:opacity-40">{editing ? 'Simpan' : 'Tambah'}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setName('') }} className="h-9 rounded-lg border border-border px-3 text-[13px] text-text-secondary hover:bg-bg">Batal</button>}
      </form>
      {loading ? (
        <p className="py-8 text-center text-[13px] text-text-secondary">Memuat...</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-text-secondary">Belum ada kategori.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 shadow-level-1">
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-text-primary">{c.name}</span>
                <span className="text-[12px] text-text-secondary">{c.slug}</span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setEditing(c); setName(c.name) }} className="text-[12px] font-medium text-primary hover:underline">Ubah</button>
                <button type="button" onClick={() => void handleDelete(c.id)} className="text-[12px] font-medium text-secondary hover:underline">Hapus</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
