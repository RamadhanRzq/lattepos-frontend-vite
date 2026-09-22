interface PaginationProps {
  page: number
  total: number
  limit: number
  onPage: (page: number) => void
  onLimit?: (limit: number) => void
}

export function Pagination({
  page,
  total,
  limit,
  onPage,
  onLimit,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const current = Math.min(Math.max(1, page), totalPages)
  const from = total === 0 ? 0 : (current - 1) * limit + 1
  const to = Math.min(total, current * limit)

  const btn =
    'h-9 min-w-9 rounded-lg border border-border bg-surface px-2 text-[13px] text-text-primary hover:bg-bg disabled:opacity-40 disabled:hover:bg-surface'

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-[12px] text-text-secondary">
        Menampilkan {from}–{to} dari {total}
      </p>
      <div className="flex items-center gap-2">
        {onLimit && (
          <select
            value={limit}
            onChange={(e) => onLimit(Number(e.target.value))}
            className="h-9 rounded-lg border border-border bg-surface px-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
            aria-label="Baris per halaman"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / halaman
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          disabled={current <= 1}
          onClick={() => onPage(current - 1)}
          className={btn}
          aria-label="Halaman sebelumnya"
        >
          ‹
        </button>
        <span className="text-[12px] text-text-secondary">
          {current} / {totalPages}
        </span>
        <button
          type="button"
          disabled={current >= totalPages}
          onClick={() => onPage(current + 1)}
          className={btn}
          aria-label="Halaman berikutnya"
        >
          ›
        </button>
      </div>
    </div>
  )
}
