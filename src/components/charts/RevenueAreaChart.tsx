'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function RevenueAreaChart({ orders }: { orders: any[] }) {
  const data = useMemo(() => {
    const map: Record<string, number> = {}
    const today = new Date()

    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      map[key] = 0
    }

    orders.forEach((o) => {
      const date = new Date(o.createdAt)
      const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (key in map) {
        map[key] += o.total || 0
      }
    })

    return Object.entries(map).map(([name, revenue]) => ({
      name,
      revenue: Math.round(revenue * 100) / 100,
    }))
  }, [orders])

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${v}`} />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
            contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14 }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3B82F6"
            fillOpacity={1}
            fill="url(#colorRevenue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
