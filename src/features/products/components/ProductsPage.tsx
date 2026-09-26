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
} from '../api'
import type { Product } from '../api'

export function ProductsPage() {
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
  const [price, setPrice] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const categoryById: Record<string, string> = Object.fromEntries(
    categories.map((c) => [c.id, c.name]),
  )

  async function fetchProducts(p: number, l: number, s: string, c: string) {
    setLoading(true)
    try {
      const list = await listProducts(orgSlug, storeId, {
        search: s || undefined,
        category_id: c || undefined,
        product_type: 'MENU',
        page: p,
        limit: l,
      })
      setItems(list.data)
      setTotal(list.total)
      setPage(list.page)
      setLimit(list.limit)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal memuat produk.'))
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
    void fetchProducts(1, 20, '', '')
  }, [ready, orgSlug, storeId])

  function applyFilters() {
    void fetchProducts(1, limit, search, categoryId)
  }

  function openCreate() {
    setEditing(null)
    setName('')
    setSku('')
    setPrice('')
    setFormCategoryId(categoryId || '')
    setModalOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setName(p.name)
    setSku(p.sku)
    setPrice(String(p.price))
    setFormCategoryId(p.category_id ?? '')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
    setName('')
    setSku('')
    setPrice('')
    setFormCategoryId('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !sku.trim()) {
      toast.error('Nama dan SKU wajib diisi.')
      return
    }
    setSaving(true)
    try {
      const input = {
        name: name.trim(),
        sku: sku.trim(),
        description: '',
        product_type: 'MENU' as const,
        price: Number(price) || 0,
        stock: editing?.stock ?? 0,
        unit: editing?.unit ?? 'pcs',
        category_id: formCategoryId || null,
        image_url: '',
        ...(editing ? { is_active: editing.is_active } : {}),
      }
      if (editing) {
        await updateProduct(orgSlug, storeId, editing.id, input)
        await fetchProducts(page, limit, search, categoryId)
      } else {
        await createProduct(orgSlug, storeId, input)
        await fetchProducts(1, limit, search, categoryId)
      }
      closeModal()
      toast.success(editing ? 'Produk diubah.' : 'Produk ditambah.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menyimpan produk.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(p: Product) {
    if (!pendingDelete || pendingDelete.id !== p.id) {
      setPendingDelete(p)
      return
    }
    setDeleting(true)
    try {
      await deleteProduct(orgSlug, storeId, p.id)
      const nextPage = items.length === 1 && page > 1 ? page - 1 : page
      await fetchProducts(nextPage, limit, search, categoryId)
      toast.success('Produk dihapus.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menghapus produk.'))
    } finally {
      setDeleting(false)
      setPendingDelete(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[22px] font-bold tracking-[-0.01em] text-text-primary">
          Produk
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="h-9 rounded-lg bg-primary px-4 text-[13px] font-bold text-white hover:bg-primary-hover"
          >
            + Tambah
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') applyFilters()
          }}
          placeholder="Cari produk..."
          className="h-9 w-52 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none"
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
          onClick={applyFilters}
          className="h-9 rounded-lg border border-border px-3 text-[13px] text-text-secondary hover:bg-bg"
        >
          Cari
        </button>
      </div>
      {loading ? (
        <PageLoading />
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-text-secondary">
          Belum ada produk.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-level-1">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-[12px] font-medium text-text-secondary">
                    Produk
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium text-text-secondary">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-right text-[12px] font-medium text-text-secondary">
                    Harga Jual
                  </th>
                  <th className="px-4 py-3 text-right text-[12px] font-medium text-text-secondary">
                    Stok
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
                {items.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0 hover:bg-bg"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary">
                          {p.name}
                        </span>
                        <span className="text-[12px] text-text-secondary">
                          {p.sku}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {p.category_id
                        ? (categoryById[p.category_id] ?? '-')
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-text-primary">
                      Rp {p.price.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-right text-text-primary">
                      {p.stock}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          p.is_active
                            ? 'inline-block rounded-full bg-success/10 px-2 py-0.5 text-[12px] font-medium text-success'
                            : 'inline-block rounded-full bg-bg px-2 py-0.5 text-[12px] font-medium text-text-secondary'
                        }
                      >
                        {p.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="text-[12px] font-medium text-primary hover:underline"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(p)}
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
            onPage={(p) => void fetchProducts(p, limit, search, categoryId)}
            onLimit={(l) => void fetchProducts(1, l, search, categoryId)}
          />
        </>
      )}
      <Modal
        open={modalOpen}
        title={editing ? 'Ubah Produk' : 'Tambah Produk'}
        onClose={closeModal}
      >
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex flex-col gap-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama produk..."
            autoFocus
            className="h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
          />
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="SKU..."
            className="h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Harga..."
            inputMode="numeric"
            className="h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
          />
          <select
            value={formCategoryId}
            onChange={(e) => setFormCategoryId(e.target.value)}
            className="h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none"
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
        title="Hapus Produk"
        message={pendingDelete ? `Hapus ${pendingDelete.name}?` : ''}
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && void handleDelete(pendingDelete)}
      />
    </div>
  )
}
