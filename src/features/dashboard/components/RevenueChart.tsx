import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const DATA = [
  { day: 'Sen', revenue: 1_850_000 },
  { day: 'Sel', revenue: 2_100_000 },
  { day: 'Rab', revenue: 1_920_000 },
  { day: 'Kam', revenue: 2_450_000 },
  { day: 'Jum', revenue: 2_780_000 },
  { day: 'Sab', revenue: 3_200_000 },
  { day: 'Min', revenue: 2_950_000 },
]

function formatRupiah(v: number) {
  return `Rp ${(v / 1_000_000).toFixed(1)}jt`
}

export function RevenueChart() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-level-1">
      <h3 className="mb-1 text-[15px] font-semibold text-text-primary">
        Pendapatan 7 Hari Terakhir
      </h3>
      <p className="mb-4 text-[12px] text-text-secondary">
        Total: Rp 17.250.000
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={DATA}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0064D2" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#0064D2" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: '#707070' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatRupiah}
            tick={{ fontSize: 12, fill: '#707070' }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip
            formatter={(v) => [`Rp ${Number(v).toLocaleString('id-ID')}`, 'Pendapatan']}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #E5E5E5',
              fontSize: 13,
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#0064D2"
            strokeWidth={2}
            fill="url(#revGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
