'use client'

import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export default function OrderStatusPieChart({ orders }: { orders: any[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {}
    orders.forEach((o) => {
      const status = o.paymentStatus === 'refunded' ? 'refunded' : o.status || 'unknown'
      counts[status] = (counts[status] || 0) + 1
    })

    const statusColors: Record<string, string> = {
      pending: '#F59E0B',
      confirmed: '#3B82F6',
      preparing: '#F97316',
      ready: '#8B5CF6',
      served: '#10B981',
      completed: '#059669',
      cancelled: '#EF4444',
      refunded: '#9CA3AF'
    }

    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: statusColors[name] || '#6B7280',
    }))
  }, [orders])

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [value, name]}
            contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
