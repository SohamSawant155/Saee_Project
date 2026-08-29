import type { FC } from 'react'

function scale(points: number[], height: number, padding = 4) {
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const range = Math.max(max - min, 1)
  return points.map((v, i) => {
    const x = (i / (points.length - 1)) * 100
    const y = ((max - v) / range) * (height - padding * 2) + padding
    return [x, y]
  })
}

const Sparkline: FC<{ data: number[]; stroke?: string; width?: number; height?: number }> = ({ data, stroke = '#2563eb', width = 160, height = 48 }) => {
  if (!data || data.length === 0) return <svg width={width} height={height} />
  const pts = scale(data, height)
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]}% ${p[1]}`).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" width={width} height={height}>
      <path d={d} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={`${last[0]}%`} cy={last[1]} r={2.5} fill={stroke} />
    </svg>
  )
}

export default Sparkline
