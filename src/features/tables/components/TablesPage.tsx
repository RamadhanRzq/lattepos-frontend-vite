import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/api'
import { useOrgStore } from '@/components/layout'
import { ConfirmDialog, Modal, PageLoading } from '@/components/ui'
import {
  createTable,
  deleteTable,
  listTables,
  updateTable,
  updateTableStatus,
} from '../api'
import type { RestaurantTable, TableStatus } from '../api'

const STATUS_META: Record<TableStatus, { label: string; className: string }> = {
  available: {
    label: 'Kosong',
    className: 'bg-success/15 text-success border-success/30',
  },
  occupied: {
    label: 'Terisi',
    className: 'bg-secondary/15 text-secondary border-secondary/30',
  },
  reserved: {
    label: 'Reservasi',
    className: 'bg-accent-yellow/15 text-accent-yellow border-accent-yellow/30',
  },
}

const STATUS_ORDER: TableStatus[] = ['available', 'occupied', 'reserved']

const inputClass =
  'h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none'

export function TablesPage() {
  const { orgSlug, storeId, ready } = useOrgStore()
  const [items, setItems] = useState<RestaurantTable[]>([])
  const [loading, setLoading] = useState(true)
  const [areaFilter, setAreaFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<TableStatus | ''>('')

  const [editing, setEditing] = useState<RestaurantTable | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    area: '',
    capacity: 4,
    is_active: true,
  })

  const [pendingDelete, setPendingDelete] = useState<RestaurantTable | null>(
    null,
  )
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!ready) return
    if (!orgSlug || !storeId) {
      setLoading(false)
      return
    }
    setLoading(true)
    listTables(orgSlug, storeId)
      .then(setItems)
      .catch((err: unknown) =>
        toast.error(getErrorMessage(err, 'Gagal memuat meja.')),
      )
      .finally(() => setLoading(false))
  }, [ready, orgSlug, storeId])

  const areas = useMemo(
    () => [...new Set(items.map((t) => t.area).filter(Boolean))].sort(),
    [items],
  )

  const visible = useMemo(
    () =>
      items.filter(
        (t) =>
          (!areaFilter || t.area === areaFilter) &&
          (!statusFilter || t.status === statusFilter),
      ),
    [items, areaFilter, statusFilter],
  )

  function openCreate() {
    setEditing(null)
    setForm({ name: '', area: areaFilter || '', capacity: 4, is_active: true })
    setModalOpen(true)
  }

  function openEdit(t: RestaurantTable) {
    setEditing(t)
    setForm({
      name: t.name,
      area: t.area,
      capacity: t.capacity,
      is_active: t.is_active,
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orgSlug || !storeId) return
    if (!form.name.trim()) {
      toast.error('Nama meja wajib diisi.')
      return
    }
    setSaving(true)
    try {
      const input = {
        name: form.name.trim(),
        area: form.area.trim(),
        capacity: Number(form.capacity) || 0,
        is_active: form.is_active,
      }
      if (editing) {
        const updated = await updateTable(orgSlug, storeId, editing.id, input)
        setItems((prev) => prev.map((t) => (t.id === editing.id ? updated : t)))
        toast.success('Meja diubah.')
      } else {
        const created = await createTable(orgSlug, storeId, input)
        setItems((prev) => [...prev, created])
        toast.success('Meja ditambah.')
      }
      closeModal()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menyimpan meja.'))
    } finally {
      setSaving(false)
    }
  }

  async function cycleStatus(t: RestaurantTable) {
    if (!orgSlug || !storeId) return
    const next =
      STATUS_ORDER[(STATUS_ORDER.indexOf(t.status) + 1) % STATUS_ORDER.length]
    const prevStatus = t.status
    setItems((prev) =>
      prev.map((x) => (x.id === t.id ? { ...x, status: next } : x)),
    )
    try {
      const updated = await updateTableStatus(orgSlug, storeId, t.id, next)
      setItems((prev) => prev.map((x) => (x.id === t.id ? updated : x)))
    } catch (err) {
      setItems((prev) =>
        prev.map((x) => (x.id === t.id ? { ...x, status: prevStatus } : x)),
      )
      toast.error(getErrorMessage(err, 'Gagal mengubah status meja.'))
    }
  }

  async function handleDelete(t: RestaurantTable) {
    if (!orgSlug || !storeId) return
    setDeleting(true)
    try {
      await deleteTable(orgSlug, storeId, t.id)
      setItems((prev) => prev.filter((x) => x.id !== t.id))
      toast.success('Meja dihapus.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menghapus meja.'))
    } finally {
      setDeleting(false)
      setPendingDelete(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[22px] font-bold tracking-[-0.01em] text-text-primary">
          Meja
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className={inputClass}
          >
            <option value="">Semua area</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as TableStatus | '')
            }
            className={inputClass}
          >
            <option value="">Semua status</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={openCreate}
            className="h-9 rounded-lg bg-primary px-4 text-[13px] font-bold text-white hover:bg-primary-hover"
          >
            + Tambah
          </button>
        </div>
      </div>

      {loading ? (
        <PageLoading />
      ) : visible.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-text-secondary">
          Belum ada meja.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((t) => (
            <div
              key={t.id}
              className={`flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-level-1 ${
                t.is_active ? '' : 'opacity-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[15px] font-bold text-text-primary">
                    {t.name}
                  </p>
                  <p className="text-[12px] text-text-secondary">
                    {t.area || 'Tanpa area'} · {t.capacity} orang
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_META[t.status].className}`}
                >
                  {STATUS_META[t.status].label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void cycleStatus(t)}
                  className="h-8 rounded-lg border border-border px-3 text-[12px] font-medium text-text-primary hover:bg-bg"
                >
                  Ubah status
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(t)}
                  className="h-8 rounded-lg border border-border px-3 text-[12px] font-medium text-primary hover:bg-bg"
                >
                  Ubah
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(t)}
                  className="h-8 rounded-lg border border-border px-3 text-[12px] font-medium text-secondary hover:bg-bg"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Ubah Meja' : 'Tambah Meja'}
        onClose={closeModal}
      >
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex flex-col gap-3"
        >
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama meja, mis. Meja 1..."
            autoFocus
            className={inputClass}
          />
          <input
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
            placeholder="Area, mis. Indoor / Outdoor..."
            className={inputClass}
          />
          <input
            type="number"
            min={0}
            value={form.capacity}
            onChange={(e) =>
              setForm({ ...form, capacity: Number(e.target.value) })
            }
            placeholder="Kapasitas orang..."
            className={inputClass}
          />
          <label className="flex items-center gap-2 text-[13px] text-text-primary">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
              className="size-4 accent-primary"
            />
            Meja aktif
          </label>
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
              disabled={saving || !form.name.trim()}
              className="h-9 rounded-lg bg-primary px-4 text-[13px] font-bold text-white hover:bg-primary-hover disabled:opacity-40"
            >
              {editing ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Hapus Meja"
        message={pendingDelete ? `Hapus ${pendingDelete.name}?` : ''}
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && void handleDelete(pendingDelete)}
      />
    </div>
  )
}
