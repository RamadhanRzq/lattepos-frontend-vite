import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const DATA = [
  { name: 'Minuman', value: 6_800_000 },
  { name: 'Makanan', value: 5_400_000 },
  { name: 'Snack', value: 2_900_000 },
  { name: 'Dessert', value: 2_150_000 },
]

const COLORS = ['#0064D2', '#E53238', '#F5AF02', '#86B817']

export function CategoryPieChart() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-level-1">
      <h3 className="mb-1 text-[15px] font-semibold text-text-primary">
        Pendapatan per Kategori
      </h3>
      <p className="mb-4 text-[12px] text-text-secondary">Minggu ini</p>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={DATA}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            dataKey="value"
            strokeWidth={2}
            stroke="#FFFFFF"
          >
            {DATA.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [`Rp ${Number(v).toLocaleString('id-ID')}`, 'Pendapatan']}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #E5E5E5',
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {DATA.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: COLORS[i] }}
            />
            <span className="text-[12px] text-text-secondary">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
