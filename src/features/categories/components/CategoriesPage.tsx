import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/api'
import { useOrgStore } from '@/components/layout'
import { ConfirmDialog, Modal, PageLoading, Pagination } from '@/components/ui'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../api'
import type { Category } from '../api'

const PAGE_SIZE = 20

export function CategoriesPage() {
  const { orgSlug, storeId, ready } = useOrgStore()
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<Category | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!ready) return
    if (!orgSlug || !storeId) {
      setLoading(false)
      return
    }
    setLoading(true)
    listCategories(orgSlug, storeId)
      .then((list) => {
        setItems(list)
        setPage(1)
      })
      .catch((err: unknown) =>
        toast.error(getErrorMessage(err, 'Gagal memuat kategori.')),
      )
      .finally(() => setLoading(false))
  }, [ready, orgSlug, storeId])

  const pageItems = useMemo(
    () => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [items, page],
  )

  function openCreate() {
    setEditing(null)
    setName('')
    setModalOpen(true)
  }

  function openEdit(c: Category) {
    setEditing(c)
    setName(c.name)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
    setName('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Nama kategori wajib diisi.')
      return
    }
    if (!orgSlug || !storeId) return
    setSaving(true)
    try {
      const input = {
        name: name.trim(),
        slug: '',
        description: '',
        parent_id: null,
      }
      if (editing) {
        const updated = await updateCategory(
          orgSlug,
          storeId,
          editing.id,
          input,
        )
        setItems((prev) => prev.map((c) => (c.id === editing.id ? updated : c)))
      } else {
        const created = await createCategory(orgSlug, storeId, input)
        setItems((prev) => [...prev, created])
        setPage(Math.ceil((items.length + 1) / PAGE_SIZE))
      }
      closeModal()
      toast.success(editing ? 'Kategori diubah.' : 'Kategori ditambah.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menyimpan kategori.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(c: Category) {
    if (!pendingDelete || pendingDelete.id !== c.id) {
      setPendingDelete(c)
      return
    }
    setDeleting(true)
    try {
      await deleteCategory(orgSlug, storeId, c.id)
      setItems((prev) => {
        const next = prev.filter((x) => x.id !== c.id)
        if ((page - 1) * PAGE_SIZE >= next.length && page > 1) setPage(page - 1)
        return next
      })
      toast.success('Kategori dihapus.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menghapus kategori.'))
    } finally {
      setDeleting(false)
      setPendingDelete(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[22px] font-bold tracking-[-0.01em] text-text-primary">
          Kategori
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
      {loading ? (
        <PageLoading />
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-text-secondary">
          Belum ada kategori.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-level-1">
            <table className="w-full min-w-[520px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-[12px] font-medium text-text-secondary">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium text-text-secondary">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-right text-[12px] font-medium text-text-secondary">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border last:border-0 hover:bg-bg"
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{c.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="text-[12px] font-medium text-primary hover:underline"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(c)}
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
            total={items.length}
            limit={PAGE_SIZE}
            onPage={setPage}
          />
        </>
      )}
      <Modal
        open={modalOpen}
        title={editing ? 'Ubah Kategori' : 'Tambah Kategori'}
        onClose={closeModal}
      >
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex flex-col gap-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kategori..."
            autoFocus
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
              disabled={saving || !name.trim()}
              className="h-9 rounded-lg bg-primary px-4 text-[13px] font-bold text-white hover:bg-primary-hover disabled:opacity-40"
            >
              {editing ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Hapus Kategori"
        message={pendingDelete ? `Hapus ${pendingDelete.name}?` : ''}
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && void handleDelete(pendingDelete)}
      />
    </div>
  )
}
