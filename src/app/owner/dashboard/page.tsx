'use client'

import { useState, useEffect } from 'react'
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  UtensilsCrossed,
  Table2,
  Calendar as CalendarIcon,
  Loader2,
} from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { format, startOfMonth } from 'date-fns'
import { useSession } from 'next-auth/react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import RevenueAreaChart from '@/components/charts/RevenueAreaChart'
import OrderStatusPieChart from '@/components/charts/OrderStatusPieChart'

interface DashboardData {
  totalOrders: number
  totalRevenue: number
  totalRefunded: number
  menuItems: number
  tables: number
  chartOrders: any[]
  orderTrend: { change: number; trend: 'up' | 'down' | 'flat' }
  revenueTrend: { change: number; trend: 'up' | 'down' | 'flat' }
  currency: string
}

const getStatCards = (data: DashboardData) => [
  {
    title: 'Total Orders',
    value: data.totalOrders,
    icon: ShoppingCart,
    color: 'bg-blue-500',
    change: formatChange(data.orderTrend.change, data.orderTrend.trend),
    trend: data.orderTrend.trend,
  },
  {
    title: 'Total Revenue',
    value: `${data.currency} ${data.totalRevenue.toFixed(2)}`,
    icon: DollarSign,
    color: 'bg-green-500',
    change: formatChange(data.revenueTrend.change, data.revenueTrend.trend),
    trend: data.revenueTrend.trend,
  },
  {
    title: 'Total Refunds',
    value: `${data.currency} ${data.totalRefunded.toFixed(2)}`,
    icon: TrendingDown,
    color: 'bg-red-500',
    change: null,
    trend: 'flat' as const,
  },
  {
    title: 'Menu Items',
    value: data.menuItems,
    icon: UtensilsCrossed,
    color: 'bg-purple-500',
    change: null,
    trend: 'flat' as const,
  },
  {
    title: 'Tables',
    value: data.tables,
    icon: Table2,
    color: 'bg-yellow-500',
    change: null,
    trend: 'flat' as const,
  },
]

const formatChange = (change: number, trend: 'up' | 'down' | 'flat') => {
  const sign = trend === 'up' ? '+' : trend === 'down' ? '' : ''
  return `${sign}${change}%`
}

export default function OwnerDashboard() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
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
        const res = await fetch(`/api/owner/dashboard?${params.toString()}`)
        if (!res.ok) {
          throw new Error('Failed to fetch dashboard data')
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

  if (error || !data) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        <p>
          <strong>Error:</strong> {error || 'Failed to load data.'}
        </p>
      </div>
    )
  }

  const statCards = getStatCards(data)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {session?.user?.name}</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.change !== null && (
                    <div className="flex items-center mt-2 text-sm">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="text-green-500 mr-1" size={16} />
                      ) : stat.trend === 'down' ? (
                        <TrendingDown className="text-red-500 mr-1" size={16} />
                      ) : (
                        <span className="text-gray-400 mr-1">-</span>
                      )}
                      <span className={stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-red-500' : 'text-gray-500'}>
                        {stat.change}
                      </span>
                      <span className="text-gray-500 ml-1">vs previous period</span>
                    </div>
                  )}
                </div>
                <div className={`${stat.color} p-4 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue</h3>
          <RevenueAreaChart orders={data.chartOrders} currency={data.currency} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
          <OrderStatusPieChart orders={data.chartOrders} />
        </div>
      </div>
    </div>
  )
}
