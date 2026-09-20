import {
  CurrencyDollarIcon,
  ReceiptIcon,
  ClockCounterClockwiseIcon,
  ArmchairIcon,
} from '@phosphor-icons/react'
import { KpiCard } from './KpiCard'
import { RevenueChart } from './RevenueChart'
import { TopMenuChart } from './TopMenuChart'
import { CategoryPieChart } from './CategoryPieChart'
import { HourlyOrdersChart } from './HourlyOrdersChart'

// ponytail: static mock data — replace with API fetch when backend ready
const KPI_DATA = [
  {
    label: 'Pendapatan Hari Ini',
    value: 'Rp 2.450.000',
    change: 12.5,
    icon: <CurrencyDollarIcon size={16} />,
  },
  {
    label: 'Total Transaksi',
    value: '64',
    change: 8.2,
    icon: <ReceiptIcon size={16} />,
  },
  {
    label: 'Rata-rata Pesanan',
    value: 'Rp 38.280',
    change: -3.1,
    icon: <ClockCounterClockwiseIcon size={16} />,
  },
  {
    label: 'Meja Terisi',
    value: '8 / 12',
    change: 15.0,
    icon: <ArmchairIcon size={16} />,
  },
] as const

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_DATA.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RevenueChart />
        <HourlyOrdersChart />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopMenuChart />
        <CategoryPieChart />
      </div>
    </div>
  )
}
