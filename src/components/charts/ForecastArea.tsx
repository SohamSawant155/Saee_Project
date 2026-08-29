import { motion } from 'framer-motion'
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts'
import type { FC } from 'react'

const MotionDiv: any = motion.div

const reveal = { hidden: { clipPath: 'inset(0 100% 0 0)' }, visible: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 0.8, ease: 'easeOut' } } }

const ForecastArea: FC<{ data: any[] }> = ({ data }) => {
  return (
    <MotionDiv className="chart-wrap tall chart-reveal" initial="hidden" animate="visible" variants={reveal}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7dee8" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} tickFormatter={(value: number) => `${Math.round(Number(value) / 1000)}k`} />
          <Tooltip formatter={(value: any) => new Intl.NumberFormat().format(Number(value))} />
          <Area type="monotone" dataKey="essential" stackId="1" stroke="#2563eb" fill="#bfdbfe" name="Essential" isAnimationActive={true} animationDuration={900} />
          <Area type="monotone" dataKey="chronic" stackId="1" stroke="#0f766e" fill="#99f6e4" name="Chronic" isAnimationActive={true} animationDuration={900} />
          <Area type="monotone" dataKey="emergency" stackId="1" stroke="#d97706" fill="#fde68a" name="Emergency" isAnimationActive={true} animationDuration={900} />
        </AreaChart>
      </ResponsiveContainer>
    </MotionDiv>
  )
}

export default ForecastArea
