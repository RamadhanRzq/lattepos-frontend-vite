import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const DATA = [
  { name: 'Es Kopi Susu', qty: 82 },
  { name: 'Nasi Goreng', qty: 65 },
  { name: 'Mie Goreng', qty: 51 },
  { name: 'Matcha Latte', qty: 47 },
  { name: 'Croissant', qty: 38 },
  { name: 'Americano', qty: 34 },
  { name: 'Pancake', qty: 28 },
]

export function TopMenuChart() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-level-1">
      <h3 className="mb-1 text-[15px] font-semibold text-text-primary">
        Menu Terlaris
      </h3>
      <p className="mb-4 text-[12px] text-text-secondary">
        7 hari terakhir berdasarkan jumlah pesanan
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={DATA} layout="vertical" barSize={14}>
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: '#707070' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: '#707070' }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip
            formatter={(v) => [`${v} porsi`, 'Terjual']}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #E5E5E5',
              fontSize: 13,
            }}
          />
          <Bar dataKey="qty" fill="#0064D2" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
