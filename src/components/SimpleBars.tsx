import type { FC } from 'react'

const SimpleBars: FC<{ values: number[]; colors?: string[]; height?: number }> = ({ values, colors = ['#2563eb'], height = 48 }) => {
  const max = Math.max(...values, 1)
  return (
    <svg viewBox={`0 0 ${values.length} ${height}`} preserveAspectRatio="none" width="100%" height={height}>
      {values.map((v, i) => {
        const h = (v / max) * (height - 6)
        const y = height - h
        const w = 0.75
        return <rect key={i} x={i - 0.36} y={y} width={w} height={h} fill={colors[i % colors.length]} rx={0.12} />
      })}
    </svg>
  )
}

export default SimpleBars
