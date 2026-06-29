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
  Legend,
} from 'recharts'
import { format, eachDayOfInterval, startOfDay } from 'date-fns'

export default function RevenueAreaChart({ orders }: { orders: any[] }) {
  const { chartData, range } = useMemo(() => {
    if (!orders.length) return { chartData: [], range: { min: 0, max: 0 } }

    const dateMap = new Map<
      string,
      { revenue: number; refunds: number; date: Date }
    >()

    const sortedOrders = orders.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    const interval = {
      start: startOfDay(new Date(sortedOrders[0].createdAt)),
      end: startOfDay(new Date(sortedOrders[sortedOrders.length - 1].createdAt)),
    }

    // Initialize all days in the range
    eachDayOfInterval(interval).forEach((day) => {
      const key = format(day, 'yyyy-MM-dd')
      dateMap.set(key, { revenue: 0, refunds: 0, date: day })
    })

    let maxAmount = 0
    orders.forEach((o) => {
      const key = format(startOfDay(new Date(o.createdAt)), 'yyyy-MM-dd')
      const entry = dateMap.get(key)
      if (entry) {
        if (o.paymentStatus === 'refunded') {
          entry.refunds += o.total || 0
        } else if (o.paymentStatus === 'paid') {
          entry.revenue += o.total || 0
        }

        if(entry.revenue > maxAmount) maxAmount = entry.revenue
        if(entry.refunds > maxAmount) maxAmount = entry.refunds
      }
    })

    const finalData = Array.from(dateMap.values()).map((d) => ({
      name: format(d.date, 'MMM d'),
      revenue: Math.round(d.revenue),
      refunds: Math.round(d.refunds),
    }))

    return {
      chartData: finalData,
      range: {min: 0, max: Math.ceil(maxAmount / 100) * 100} // Round up to nearest 100
    }
  }, [orders])

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorRefunds" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) => `$${v}`}
            domain={[range.min, range.max]}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `$${value.toFixed(2)}`,
              name.charAt(0).toUpperCase() + name.slice(1)
            ]}
            contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14 }}
          />
          <Legend wrapperStyle={{fontSize: '14px'}}/>
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3B82F6"
            fillOpacity={1}
            fill="url(#colorRevenue)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="refunds"
            stroke="#EF4444"
            fillOpacity={1}
            fill="url(#colorRefunds)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

