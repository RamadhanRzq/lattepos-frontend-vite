import { TrendUpIcon, TrendDownIcon } from '@phosphor-icons/react'

export function KpiCard({
  label,
  value,
  change,
  icon,
}: {
  label: string
  value: string
  change: number
  icon: React.ReactNode
}) {
  const positive = change >= 0

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-level-1">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-text-secondary">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg text-text-secondary">
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <span className="text-[22px] font-bold tracking-[-0.01em] text-text-primary">
          {value}
        </span>
        <div className="flex items-center gap-1 pb-0.5">
          {positive
            ? <TrendUpIcon size={14} weight="bold" className="text-success" />
            : <TrendDownIcon size={14} weight="bold" className="text-secondary" />
          }
          <span
            className={`text-[12px] font-medium ${positive ? 'text-success' : 'text-secondary'}`}
          >
            {positive ? '+' : ''}{change}%
          </span>
          <span className="text-[11px] text-text-secondary">vs kemarin</span>
        </div>
      </div>
    </div>
  )
}
