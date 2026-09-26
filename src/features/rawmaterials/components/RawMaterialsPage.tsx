import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/api'
import { useOrgStore } from '@/components/layout'
import { ConfirmDialog, Modal, PageLoading, Pagination } from '@/components/ui'
import { listCategories } from '@/features/categories/api'
import type { Category } from '@/features/categories/api'
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from '@/features/products/api'
import type { Product } from '@/features/products/api'

const UNIT_OPTIONS = ['kg', 'gram', 'liter', 'ml', 'pcs', 'pack', 'box']

export function RawMaterialsPage() {
  const { orgSlug, storeId, ready } = useOrgStore()
  const [items, setItems] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [unit, setUnit] = useState('kg')
  const [stock, setStock] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const categoryById: Record<string, string> = Object.fromEntries(
    categories.map((c) => [c.id, c.name]),
  )

  async function fetchMaterials(p: number, l: number, s: string, c: string) {
    setLoading(true)
    try {
      const list = await listProducts(orgSlug, storeId, {
        search: s || undefined,
        category_id: c || undefined,
        product_type: 'RAW_MATERIAL',
        page: p,
        limit: l,
      })
      setItems(list.data)
      setTotal(list.total)
      setPage(list.page)
      setLimit(list.limit)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal memuat bahan baku.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!ready) return
    if (!orgSlug || !storeId) {
      setLoading(false)
      return
    }
    listCategories(orgSlug, storeId)
      .catch(() => [] as Category[])
      .then(setCategories)
    void fetchMaterials(1, 20, '', '')
  }, [ready, orgSlug, storeId])

  function openCreate() {
    setEditing(null)
    setName('')
    setSku('')
    setUnit('kg')
    setStock('')
    setFormCategoryId(categoryId || '')
    setModalOpen(true)
  }

  function openEdit(m: Product) {
    setEditing(m)
    setName(m.name)
    setSku(m.sku)
    setUnit(m.unit || 'kg')
    setStock(String(m.stock))
    setFormCategoryId(m.category_id ?? '')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !sku.trim()) {
      toast.error('Nama dan kode wajib diisi.')
      return
    }
    setSaving(true)
    try {
      const input = {
        name: name.trim(),
        sku: sku.trim(),
        description: editing?.description ?? '',
        product_type: 'RAW_MATERIAL' as const,
        price: editing?.price ?? 0,
        stock: Number(stock) || 0,
        unit: unit.trim() || 'pcs',
        category_id: formCategoryId || null,
        image_url: editing?.image_url ?? '',
        ...(editing ? { is_active: editing.is_active } : {}),
      }
      if (editing) {
        await updateProduct(orgSlug, storeId, editing.id, input)
        await fetchMaterials(page, limit, search, categoryId)
      } else {
        await createProduct(orgSlug, storeId, input)
        await fetchMaterials(1, limit, search, categoryId)
      }
      closeModal()
      toast.success(editing ? 'Bahan baku diubah.' : 'Bahan baku ditambah.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menyimpan bahan baku.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(m: Product) {
    setDeleting(true)
    try {
      await deleteProduct(orgSlug, storeId, m.id)
      const nextPage = items.length === 1 && page > 1 ? page - 1 : page
      await fetchMaterials(nextPage, limit, search, categoryId)
      toast.success('Bahan baku dihapus.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menghapus bahan baku.'))
    } finally {
      setDeleting(false)
      setPendingDelete(null)
    }
  }

  const field =
    'h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[22px] font-bold tracking-[-0.01em] text-text-primary">
          Bahan Baku
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className="h-9 rounded-lg bg-primary px-4 text-[13px] font-bold text-white hover:bg-primary-hover"
        >
          + Tambah
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter')
              void fetchMaterials(1, limit, search, categoryId)
          }}
          placeholder="Cari bahan baku..."
          className={`w-52 ${field}`}
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={field}
          aria-label="Filter kategori"
        >
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void fetchMaterials(1, limit, search, categoryId)}
          className="h-9 rounded-lg border border-border px-3 text-[13px] text-text-secondary hover:bg-bg"
        >
          Cari
        </button>
      </div>

      {loading ? (
        <PageLoading />
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-text-secondary">
          {search || categoryId
            ? 'Tidak ada bahan baku yang cocok.'
            : 'Belum ada bahan baku.'}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-level-1">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-[12px] font-medium text-text-secondary">
                    Bahan
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium text-text-secondary">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-right text-[12px] font-medium text-text-secondary">
                    Stok
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium text-text-secondary">
                    Satuan
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium text-text-secondary">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[12px] font-medium text-text-secondary">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-border last:border-0 hover:bg-bg"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary">
                          {m.name}
                        </span>
                        <span className="text-[12px] text-text-secondary">
                          {m.sku}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {m.category_id
                        ? (categoryById[m.category_id] ?? '-')
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-text-primary">
                      {m.stock}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{m.unit}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          m.is_active
                            ? 'inline-block rounded-full bg-success/10 px-2 py-0.5 text-[12px] font-medium text-success'
                            : 'inline-block rounded-full bg-bg px-2 py-0.5 text-[12px] font-medium text-text-secondary'
                        }
                      >
                        {m.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(m)}
                          className="text-[12px] font-medium text-primary hover:underline"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(m)}
                          className="text-[12px] font-medium text-secondary hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            total={total}
            limit={limit}
            onPage={(p) => void fetchMaterials(p, limit, search, categoryId)}
            onLimit={(l) => void fetchMaterials(1, l, search, categoryId)}
          />
        </>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Ubah Bahan Baku' : 'Tambah Bahan Baku'}
        onClose={closeModal}
      >
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex flex-col gap-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama bahan, mis. Susu Segar"
            autoFocus
            className={field}
          />
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Kode, mis. BB-001"
            className={field}
          />
          <div className="flex gap-2">
            <input
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Stok awal"
              inputMode="numeric"
              className={`flex-1 ${field}`}
            />
            <select
              value={UNIT_OPTIONS.includes(unit) ? unit : 'lainnya'}
              onChange={(e) =>
                setUnit(e.target.value === 'lainnya' ? '' : e.target.value)
              }
              className={`w-28 ${field}`}
              aria-label="Satuan"
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
              <option value="lainnya">lainnya</option>
            </select>
          </div>
          {!UNIT_OPTIONS.includes(unit) && (
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Satuan, mis. botol"
              className={field}
            />
          )}
          <select
            value={formCategoryId}
            onChange={(e) => setFormCategoryId(e.target.value)}
            className={field}
            aria-label="Kategori"
          >
            <option value="">Tanpa kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="h-9 rounded-lg border border-border px-4 text-[13px] text-text-secondary hover:bg-bg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim() || !sku.trim()}
              className="h-9 rounded-lg bg-primary px-4 text-[13px] font-bold text-white hover:bg-primary-hover disabled:opacity-40"
            >
              {editing ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Hapus Bahan Baku"
        message={pendingDelete ? `Hapus ${pendingDelete.name}?` : ''}
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && void handleDelete(pendingDelete)}
      />
    </div>
  )
}
