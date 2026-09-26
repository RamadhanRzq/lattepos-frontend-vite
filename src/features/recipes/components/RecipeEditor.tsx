import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/api'
import { ConfirmDialog, Modal, PageLoading } from '@/components/ui'
import { listProducts } from '@/features/products/api'
import type { Product } from '@/features/products/api'
import {
  activateRecipe,
  createRecipe,
  deleteRecipe,
  listRecipes,
  updateRecipe,
} from '../api'
import type { Recipe, RecipeItemInput } from '../api'

interface Row extends RecipeItemInput {
  key: number
}

interface Props {
  open: boolean
  orgSlug: string
  storeId: string
  product: Product | null
  onClose: () => void
}

const EMPTY_ROW: RecipeItemInput = {
  ingredient_product_id: '',
  quantity: 0,
  unit: 'ml',
  wastage_percentage: 0,
  notes: '',
}

// RecipeEditor mengelola resep satu product MENU: daftar versi, editor bahan,
// dan aktivasi versi. Bahan diambil dari product bertipe bukan MENU.
export function RecipeEditor({
  open,
  orgSlug,
  storeId,
  product,
  onClose,
}: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [ingredients, setIngredients] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [version, setVersion] = useState(1)
  const [yieldQty, setYieldQty] = useState(1)
  const [isActive, setIsActive] = useState(true)
  const [rows, setRows] = useState<Row[]>([])
  const [nextKey, setNextKey] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<Recipe | null>(null)
  const [deleting, setDeleting] = useState(false)

  const productId = product?.id ?? ''

  async function load(pid: string) {
    setLoading(true)
    try {
      const [list, raw, packaging, other] = await Promise.all([
        listRecipes(orgSlug, storeId, pid),
        listProducts(orgSlug, storeId, {
          product_type: 'RAW_MATERIAL',
          limit: 100,
        }),
        listProducts(orgSlug, storeId, {
          product_type: 'PACKAGING',
          limit: 100,
        }),
        listProducts(orgSlug, storeId, { product_type: 'OTHER', limit: 100 }),
      ])
      setRecipes(list)
      setIngredients([...raw.data, ...packaging.data, ...other.data])
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal memuat resep.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open || !productId) return
    void load(productId)
  }, [open, productId, orgSlug, storeId])

  useEffect(() => {
    if (!open) return
    startNew()
    // Reset form tiap kali modal dibuka untuk product baru.
  }, [open, productId])

  useEffect(() => {
    // Daftar versi baru tiba setelah form dibuat: sinkronkan nomor versi
    // usulan supaya tidak menabrak unique (product_id, version) di server.
    if (editingId) return
    setVersion(recipes.reduce((max, r) => Math.max(max, r.version), 0) + 1)
  }, [recipes, editingId])

  function startNew() {
    const nextVersion =
      recipes.reduce((max, r) => Math.max(max, r.version), 0) + 1
    setEditingId(null)
    setName('')
    setVersion(nextVersion)
    setYieldQty(1)
    setIsActive(true)
    setRows([{ ...EMPTY_ROW, key: 0 }])
    setNextKey(1)
  }

  function startEdit(r: Recipe) {
    setEditingId(r.id)
    setName(r.name)
    setVersion(r.version)
    setYieldQty(r.yield_quantity)
    setIsActive(r.is_active)
    setRows(
      r.items.map((it, i) => ({
        key: i,
        ingredient_product_id: it.ingredient_product_id,
        quantity: it.quantity,
        unit: it.unit,
        wastage_percentage: it.wastage_percentage,
        notes: it.notes ?? '',
      })),
    )
    setNextKey(r.items.length)
  }

  function updateRow(key: number, patch: Partial<RecipeItemInput>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  function addRow() {
    setRows((prev) => [...prev, { ...EMPTY_ROW, key: nextKey }])
    setNextKey((k) => k + 1)
  }

  function removeRow(key: number) {
    setRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((r) => r.key !== key),
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!productId) return
    if (!name.trim()) {
      toast.error('Nama resep wajib diisi.')
      return
    }
    const items = rows
      .filter((r) => r.ingredient_product_id)
      .map((r) => ({
        ingredient_product_id: r.ingredient_product_id,
        quantity: Number(r.quantity) || 0,
        unit: r.unit.trim() || 'pcs',
        wastage_percentage: Number(r.wastage_percentage) || 0,
        notes: r.notes,
      }))
    if (items.length === 0) {
      toast.error('Tambahkan minimal satu bahan.')
      return
    }
    if (items.some((it) => it.quantity <= 0)) {
      toast.error('Jumlah bahan harus lebih dari 0.')
      return
    }

    setSaving(true)
    try {
      const input = {
        name: name.trim(),
        version: Number(version) || 1,
        yield_quantity: Number(yieldQty) || 1,
        is_active: isActive,
        notes: '',
        items,
      }
      if (editingId) {
        await updateRecipe(orgSlug, storeId, productId, editingId, input)
      } else {
        await createRecipe(orgSlug, storeId, productId, input)
      }
      await load(productId)
      startNew()
      toast.success(editingId ? 'Resep diubah.' : 'Resep ditambah.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menyimpan resep.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleActivate(r: Recipe) {
    try {
      await activateRecipe(orgSlug, storeId, productId, r.id, !r.is_active)
      await load(productId)
      toast.success(r.is_active ? 'Resep dinonaktifkan.' : 'Resep diaktifkan.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengubah status resep.'))
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteRecipe(orgSlug, storeId, productId, pendingDelete.id)
      await load(productId)
      if (editingId === pendingDelete.id) startNew()
      toast.success('Resep dihapus.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menghapus resep.'))
    } finally {
      setDeleting(false)
      setPendingDelete(null)
    }
  }

  const field =
    'h-9 rounded-lg border border-border bg-surface px-3 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none'

  return (
    <>
      <Modal
        open={open}
        title={product ? `Resep ${product.name}` : 'Resep'}
        onClose={onClose}
      >
        {loading ? (
          <PageLoading />
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="pb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-text-secondary/70">
                Versi resep
              </p>
              {recipes.length === 0 ? (
                <p className="text-[13px] text-text-secondary">
                  Belum ada resep. Produk ini dijual memakai stok produk
                  sendiri.
                </p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {recipes.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                    >
                      <span className="text-[13px] font-medium text-text-primary">
                        v{r.version}
                      </span>
                      <span className="flex-1 truncate text-[13px] text-text-secondary">
                        {r.name} · {r.items.length} bahan · hasil{' '}
                        {r.yield_quantity}
                      </span>
                      <span
                        className={
                          r.is_active
                            ? 'rounded-full bg-success/10 px-2 py-0.5 text-[12px] font-medium text-success'
                            : 'rounded-full bg-bg px-2 py-0.5 text-[12px] font-medium text-text-secondary'
                        }
                      >
                        {r.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(r)}
                        className="text-[12px] font-medium text-primary hover:underline"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleActivate(r)}
                        className="text-[12px] font-medium text-text-secondary hover:underline"
                      >
                        {r.is_active ? 'Matikan' : 'Aktifkan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(r)}
                        className="text-[12px] font-medium text-secondary hover:underline"
                      >
                        Hapus
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="flex flex-col gap-3 border-t border-border pt-4"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-secondary/70">
                {editingId ? 'Ubah versi' : 'Versi baru'}
              </p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama resep, mis. Es Kopi Susu Gula Aren"
                className={field}
              />
              <div className="flex gap-2">
                <label className="flex flex-1 flex-col gap-1 text-[12px] text-text-secondary">
                  Versi
                  <input
                    value={version}
                    onChange={(e) => setVersion(Number(e.target.value) || 1)}
                    inputMode="numeric"
                    className={field}
                  />
                </label>
                <label className="flex flex-1 flex-col gap-1 text-[12px] text-text-secondary">
                  Hasil per resep
                  <input
                    value={yieldQty}
                    onChange={(e) => setYieldQty(Number(e.target.value) || 1)}
                    inputMode="decimal"
                    className={field}
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 text-[13px] text-text-primary">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="size-4 rounded border-border"
                />
                Jadikan versi aktif (versi lain otomatis nonaktif)
              </label>

              <div className="flex flex-col gap-2">
                {rows.map((r) => (
                  <div
                    key={r.key}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <select
                      value={r.ingredient_product_id}
                      onChange={(e) =>
                        updateRow(r.key, {
                          ingredient_product_id: e.target.value,
                        })
                      }
                      className={`min-w-0 flex-1 ${field}`}
                      aria-label="Bahan"
                    >
                      <option value="">Pilih bahan...</option>
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({ing.sku})
                        </option>
                      ))}
                    </select>
                    <input
                      value={r.quantity || ''}
                      onChange={(e) =>
                        updateRow(r.key, {
                          quantity: Number(e.target.value) || 0,
                        })
                      }
                      placeholder="Jumlah"
                      inputMode="decimal"
                      className={`w-20 ${field}`}
                    />
                    <input
                      value={r.unit}
                      onChange={(e) =>
                        updateRow(r.key, { unit: e.target.value })
                      }
                      placeholder="Satuan"
                      className={`w-20 ${field}`}
                    />
                    <input
                      value={r.wastage_percentage || ''}
                      onChange={(e) =>
                        updateRow(r.key, {
                          wastage_percentage: Number(e.target.value) || 0,
                        })
                      }
                      placeholder="Susut %"
                      inputMode="decimal"
                      className={`w-20 ${field}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(r.key)}
                      disabled={rows.length <= 1}
                      className="text-[12px] font-medium text-secondary hover:underline disabled:opacity-40"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRow}
                  className="self-start text-[12px] font-medium text-primary hover:underline"
                >
                  + Tambah bahan
                </button>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={startNew}
                  className="h-9 rounded-lg border border-border px-4 text-[13px] text-text-secondary hover:bg-bg"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 rounded-lg bg-primary px-4 text-[13px] font-bold text-white hover:bg-primary-hover disabled:opacity-40"
                >
                  {editingId ? 'Simpan versi' : 'Tambah versi'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Hapus Resep"
        message={pendingDelete ? `Hapus resep v${pendingDelete.version}?` : ''}
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void handleDelete()}
      />
    </>
  )
}
