import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/api'
import { useOrgStore } from '@/components/layout'
import { ConfirmDialog, Modal, PageLoading, Pagination } from '@/components/ui'
import { cancelTransaction, getTransaction, listTransactions } from '../api'
import type { Transaction } from '../api'

function formatRupiah(v: number) {
  return `Rp ${v.toLocaleString('id-ID')}`
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

export function TransactionsPage() {
  const { orgSlug, storeId, ready } = useOrgStore()
  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [detail, setDetail] = useState<Transaction | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [pendingCancel, setPendingCancel] = useState<Transaction | null>(null)
  const [cancelling, setCancelling] = useState(false)

  async function fetchTransactions(p: number, l: number, s: string) {
    setLoading(true)
    try {
      const list = await listTransactions(orgSlug, storeId, {
        status: s || undefined,
        page: p,
        limit: l,
      })
      setItems(list.data)
      setTotal(list.total)
      setPage(list.page)
      setLimit(list.limit)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal memuat transaksi.'))
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
    void fetchTransactions(1, 20, '')
  }, [ready, orgSlug, storeId])

  async function openDetail(t: Transaction) {
    setDetail(t)
    setDetailOpen(true)
    try {
      const full = await getTransaction(orgSlug, storeId, t.id)
      setDetail(full)
    } catch {
      // list row cukup, biarkan detail ringkas
    }
  }

  async function handleCancel(t: Transaction) {
    if (!pendingCancel || pendingCancel.id !== t.id) {
      setPendingCancel(t)
      return
    }
    setCancelling(true)
    try {
      await cancelTransaction(orgSlug, storeId, t.id)
      await fetchTransactions(page, limit, status)
      toast.success('Transaksi dibatalkan.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal membatalkan transaksi.'))
    } finally {
      setCancelling(false)
      setPendingCancel(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[22px] font-bold tracking-[-0.01em] text-text-primary">
          Transaksi
        </h2>
      </div>
      <div className="flex gap-2">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            void fetchTransactions(1, limit, e.target.value)
          }}
          className="h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none"
          aria-label="Filter status"
        >
          <option value="">Semua status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {loading ? (
        <PageLoading />
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-text-secondary">
          Belum ada transaksi.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-level-1">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-[12px] font-medium text-text-secondary">
                    ID
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium text-text-secondary">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium text-text-secondary">
                    Bayar
                  </th>
                  <th className="px-4 py-3 text-right text-[12px] font-medium text-text-secondary">
                    Total
                  </th>
                  <th className="px-4 py-3 text-right text-[12px] font-medium text-text-secondary">
                    Waktu
                  </th>
                  <th className="px-4 py-3 text-right text-[12px] font-medium text-text-secondary">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-border last:border-0 hover:bg-bg"
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {t.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          t.status === 'cancelled'
                            ? 'inline-block rounded-full bg-bg px-2 py-0.5 text-[12px] font-medium text-text-secondary'
                            : t.status === 'completed'
                              ? 'inline-block rounded-full bg-success/10 px-2 py-0.5 text-[12px] font-medium text-success'
                              : 'inline-block rounded-full bg-warning/10 px-2 py-0.5 text-[12px] font-medium text-warning'
                        }
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{t.payment_method}</td>
                    <td className="px-4 py-3 text-right font-bold text-text-primary">
                      {formatRupiah(t.grand_total)}
                    </td>
                    <td className="px-4 py-3 text-right text-[12px] text-text-secondary">
                      {formatTime(t.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => void openDetail(t)}
                          className="text-[12px] font-medium text-primary hover:underline"
                        >
                          Detail
                        </button>
                        {t.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => setPendingCancel(t)}
                            className="text-[12px] font-medium text-secondary hover:underline"
                          >
                            Batal
                          </button>
                        )}
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
            onPage={(p) => void fetchTransactions(p, limit, status)}
            onLimit={(l) => void fetchTransactions(1, l, status)}
          />
        </>
      )}
      <Modal
        open={detailOpen}
        title="Detail Transaksi"
        onClose={() => setDetailOpen(false)}
      >
        {detail && (
          <div className="flex flex-col gap-3 text-[13px]">
            <div className="flex justify-between">
              <span className="text-text-secondary">ID</span>
              <span className="font-medium text-text-primary">{detail.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Status</span>
              <span className="font-medium text-text-primary">{detail.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Pembayaran</span>
              <span className="font-medium text-text-primary">{detail.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Total</span>
              <span className="font-bold text-text-primary">
                {formatRupiah(detail.grand_total)}
              </span>
            </div>
            {detail.notes && (
              <p className="text-text-secondary">Catatan: {detail.notes}</p>
            )}
            {detail.items && detail.items.length > 0 && (
              <div className="flex flex-col gap-1 border-t border-border pt-3">
                {detail.items.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span className="text-text-secondary">
                      {it.product_id.slice(0, 8)} x {it.quantity}
                    </span>
                    <span className="font-medium text-text-primary">
                      {formatRupiah(it.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
      <ConfirmDialog
        open={pendingCancel !== null}
        title="Batalkan Transaksi"
        message={
          pendingCancel ? `Batalkan transaksi ${pendingCancel.id.slice(0, 8)}?` : ''
        }
        confirmLabel="Batalkan"
        busy={cancelling}
        onCancel={() => setPendingCancel(null)}
        onConfirm={() => pendingCancel && void handleCancel(pendingCancel)}
      />
    </div>
  )
}
