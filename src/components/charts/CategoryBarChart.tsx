import { motion } from 'framer-motion'
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts'
import type { FC } from 'react'

const MotionDiv: any = motion.div

const reveal = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.44 } } }

const colors = ['#2563eb', '#0f766e', '#d97706', '#dc2626', '#475569']

const CategoryBarChart: FC<{ data: any[] }> = ({ data }) => {
  const total = data.reduce((s, d) => s + (d.units ?? 0), 0)
  const sorted = [...data].sort((a, b) => (b.units ?? 0) - (a.units ?? 0))
  const top = sorted[0]

  return (
    <MotionDiv className="chart-wrap chart-reveal" initial="hidden" animate="visible" variants={reveal}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px' }}>
        <div>
          <strong style={{ display: 'block' }}>{total.toLocaleString()}</strong>
          <span style={{ color: '#64748b', fontSize: 12 }}>Total units across categories</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#64748b', fontSize: 12, display: 'block' }}>Top category</span>
          <strong>{top ? `${top.category} · ${top.units?.toLocaleString()}` : '—'}</strong>
        </div>
      </div>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={data} layout="vertical" margin={{ left: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d7dee8" />
            <XAxis type="number" hide />
            <YAxis dataKey="category" type="category" width={98} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: any) => new Intl.NumberFormat().format(Number(value))} />
            <Bar dataKey="units" radius={[0, 4, 4, 0]} isAnimationActive={true} animationDuration={700}>
              {data.map((_, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ padding: 16, color: '#64748b' }}>No category data available</div>
      )}
      <div style={{ padding: '12px', borderTop: '1px dashed rgba(216,225,236,0.6)', display: 'grid', gap: 8, marginTop: 6 }}>
        {sorted.slice(0, 6).map((d, i) => {
          const pct = total ? Math.round(((d.units ?? 0) / total) * 100) : 0
          return (
            <div key={d.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: colors[i % colors.length] }} />
                <div>
                  <div style={{ fontWeight: 700 }}>{d.category}</div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{(d.units ?? 0).toLocaleString()} units</div>
                </div>
              </div>
              <div style={{ width: 140 }}>
                <div style={{ height: 8, background: '#eef3f8', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: colors[i % colors.length] }} />
                </div>
                <div style={{ textAlign: 'right', color: '#475569', fontSize: 12, marginTop: 6 }}>{pct}%</div>
              </div>
            </div>
          )
        })}
      </div>
    </MotionDiv>
  )
}

export default CategoryBarChart
