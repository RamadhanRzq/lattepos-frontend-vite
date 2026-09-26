import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/api'
import { useOrgStore } from '@/components/layout'
import { Modal, PageLoading, Pagination } from '@/components/ui'
import { listMovements, recordMovement } from '../api'
import { listProducts } from '@/features/products/api'
import type { StockMovement } from '../api'
import type { Product } from '@/features/products/api'

const TYPE_LABEL: Record<string, string> = {
  in: 'Masuk',
  out: 'Keluar',
  adjustment: 'Penyesuaian',
  return: 'Retur',
}

function formatTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function StockPage() {
  const { orgSlug, storeId, ready } = useOrgStore()
  const [items, setItems] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [productId, setProductId] = useState('')
  const [type, setType] = useState('in')
  const [quantity, setQuantity] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const productById: Record<string, string> = Object.fromEntries(
    products.map((p) => [p.id, p.name]),
  )

  async function fetchMovements(p: number, l: number, t: string) {
    setLoading(true)
    try {
      const [list, prods] = await Promise.all([
        listMovements(orgSlug, storeId, {
          type: t || undefined,
          page: p,
          limit: l,
        }),
        products.length === 0
          ? listProducts(orgSlug, storeId, { limit: 100 })
          : null,
      ])
      setItems(list.data)
      setTotal(list.total)
      setPage(list.page)
      setLimit(list.limit)
      if (prods) setProducts(prods.data)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal memuat stok.'))
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
    void fetchMovements(1, 20, '')
  }, [ready, orgSlug, storeId])

  function openCreate() {
    setProductId('')
    setType('in')
    setQuantity('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setProductId('')
    setType('in')
    setQuantity('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!productId || !orgSlug || !storeId) return
    const qty = Number(quantity)
    if (!qty || qty <= 0) {
      toast.error('Qty harus lebih dari 0.')
      return
    }
    setSaving(true)
    try {
      await recordMovement(orgSlug, storeId, {
        product_id: productId,
        type,
        quantity: qty,
      })
      await fetchMovements(1, limit, filterType)
      closeModal()
      toast.success('Movement dicatat.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mencatat movement.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[22px] font-bold tracking-[-0.01em] text-text-primary">
          Stok
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="h-9 rounded-lg bg-primary px-4 text-[13px] font-bold text-white hover:bg-primary-hover"
          >
            + Catat
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value)
            void fetchMovements(1, limit, e.target.value)
          }}
          className="h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none"
          aria-label="Filter tipe"
        >
          <option value="">Semua tipe</option>
          <option value="in">Masuk</option>
          <option value="out">Keluar</option>
          <option value="adjustment">Penyesuaian</option>
          <option value="return">Retur</option>
        </select>
      </div>
      {loading ? (
        <PageLoading />
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-text-secondary">
          Belum ada movement.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-level-1">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-[12px] font-medium text-text-secondary">
                    Produk
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium text-text-secondary">
                    Tipe
                  </th>
                  <th className="px-4 py-3 text-right text-[12px] font-medium text-text-secondary">
                    Sebelum - Sesudah
                  </th>
                  <th className="px-4 py-3 text-right text-[12px] font-medium text-text-secondary">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-[12px] font-medium text-text-secondary">
                    Waktu
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-border last:border-0 hover:bg-bg"
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {productById[m.product_id] ?? m.product_id}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {TYPE_LABEL[m.type] ?? m.type}
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {m.stock_before} - {m.stock_after}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-text-primary">
                      {m.type === 'out' ? '-' : '+'}
                      {m.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-[12px] text-text-secondary">
                      {formatTime(m.created_at)}
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
            onPage={(p) => void fetchMovements(p, limit, filterType)}
            onLimit={(l) => void fetchMovements(1, l, filterType)}
          />
        </>
      )}
      <Modal open={modalOpen} title="Catat Movement" onClose={closeModal}>
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex flex-col gap-3"
        >
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none"
            aria-label="Produk"
          >
            <option value="">Pilih produk...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (stok {p.stock})
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none"
            aria-label="Tipe movement"
          >
            <option value="in">Masuk</option>
            <option value="out">Keluar</option>
            <option value="adjustment">Penyesuaian</option>
            <option value="return">Retur</option>
          </select>
          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Qty..."
            inputMode="numeric"
            className="h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
          />
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
              disabled={saving || !productId || !quantity}
              className="h-9 rounded-lg bg-primary px-4 text-[13px] font-bold text-white hover:bg-primary-hover disabled:opacity-40"
            >
              Catat
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
