import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const DATA = [
  { hour: '08', orders: 4 },
  { hour: '09', orders: 8 },
  { hour: '10', orders: 12 },
  { hour: '11', orders: 18 },
  { hour: '12', orders: 28 },
  { hour: '13', orders: 24 },
  { hour: '14', orders: 14 },
  { hour: '15', orders: 10 },
  { hour: '16', orders: 13 },
  { hour: '17', orders: 16 },
  { hour: '18', orders: 22 },
  { hour: '19', orders: 26 },
  { hour: '20', orders: 20 },
  { hour: '21', orders: 12 },
]

export function HourlyOrdersChart() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-level-1">
      <h3 className="mb-1 text-[15px] font-semibold text-text-primary">
        Pesanan per Jam
      </h3>
      <p className="mb-4 text-[12px] text-text-secondary">Hari ini</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={DATA} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 12, fill: '#707070' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#707070' }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            formatter={(v) => [`${v} pesanan`, 'Total']}
            labelFormatter={(h) => `Pukul ${h}:00`}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #E5E5E5',
              fontSize: 13,
            }}
          />
          <Bar dataKey="orders" fill="#86B817" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
