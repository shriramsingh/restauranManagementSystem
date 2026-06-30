'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { DollarSign, ShoppingCart, TrendingUp, Award, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { addDays, format, startOfMonth } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface ReportData {
  revenue: { total: number; count: number }
  totalRefunded: { total: number; count: number }
  topItems: { _id: string; totalSold: number; revenue: number }[]
  ordersByHour: { _id: number; count: number; revenue: number }[]
  ordersByStatus: { _id: string; count: number; revenue: number }[]
  dailyRevenue: { _id: string; revenue: number; count: number }[]
  currency: string
}

const statusColors: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  preparing: '#F97316',
  ready: '#8B5CF6',
  served: '#10B981',
  completed: '#059669',
  cancelled: '#EF4444',
}

export default function OwnerReportsClient() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!date?.from || !date?.to) return

      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        startDate: format(date.from, 'yyyy-MM-dd'),
        endDate: format(date.to, 'yyyy-MM-dd'),
      })

      try {
        const res = await fetch(`/api/owner/reports?${params.toString()}`)
        if (!res.ok) {
          throw new Error('Failed to fetch data')
        }
        const jsonData = await res.json()
        setData(jsonData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [date])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        <p>
          <strong>Error:</strong> {error}
        </p>
      </div>
    )
  }

  if (!data) {
    return <p>No data available for the selected period.</p>
  }

  const {
    revenue,
    totalRefunded,
    topItems,
    ordersByHour,
    ordersByStatus,
    dailyRevenue,
  } = data

  const currency = data.currency || 'USD'

  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const found = ordersByHour.find(h => h._id === i)
    return {
      hour: `${i}:00`,
      orders: found?.count || 0,
      revenue: found?.revenue || 0,
    }
  })

  const pieData = ordersByStatus.map(s => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: s.count,
    color: statusColors[s._id] || '#6B7280',
  }))

  const chartData = dailyRevenue.map(d => ({
    date: new Date(d._id).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    revenue: Math.round(d.revenue * 100) / 100,
    orders: d.count,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Insights into your restaurant performance
          </p>
        </div>
        <div className={cn('grid gap-2')}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={'outline'}
                className={cn(
                  'w-[300px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, 'LLL dd, y')} -{' '}
                      {format(date.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(date.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {currency} {(revenue.total || 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">{revenue.count || 0} orders</p>
            </div>
            <div className={`bg-blue-500 p-4 rounded-lg`}>
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Refunds</p>
              <p className="text-2xl font-bold text-gray-900">
                {currency} {(totalRefunded.total || 0).toFixed(2)}
              </p>
               <p className="text-sm text-gray-500 mt-1">{totalRefunded.count || 0} refunds</p>
            </div>
            <div className="bg-red-500 p-4 rounded-lg">
              <Award className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Revenue Over Period
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v: number) => `${currency} ${v}`}
              />
              <Tooltip formatter={(v: number) => [`${currency} ${v.toFixed(2)}`, 'Revenue']} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Selling Items
          </h3>
          <div className="space-y-3">
            {topItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No sales data yet
              </p>
            ) : (
              topItems.map((item, idx) => (
                <div key={item._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item._id}</p>
                    <p className="text-sm text-gray-600">
                      {item.totalSold} sold
                    </p>
                  </div>
                  <p className="font-bold text-gray-900">
                    {currency} {item.revenue.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Order Status Distribution
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {pieData.map(entry => (
              <span key={entry.name} className="text-xs flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Peak Hours */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Peak Hours (Orders by Hour)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

