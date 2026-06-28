import connectDB from './mongodb'

export async function getPeriodComparison(
  model: any,
  filter: Record<string, any>,
  dateField: string = 'createdAt'
) {
  await connectDB()

  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = currentMonthStart

  const currentCount = await model.countDocuments({
    ...filter,
    [dateField]: { $gte: currentMonthStart, $lt: currentMonthEnd },
  })

  const prevCount = await model.countDocuments({
    ...filter,
    [dateField]: { $gte: prevMonthStart, $lt: prevMonthEnd },
  })

  let change = 0
  let trend: 'up' | 'down' | 'flat' = 'flat'

  if (prevCount === 0) {
    if (currentCount > 0) {
      change = 100
      trend = 'up'
    }
  } else {
    const raw = ((currentCount - prevCount) / prevCount) * 100
    change = Math.round(raw * 10) / 10
    trend = change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
  }

  return { currentCount, prevCount, change, trend }
}

export async function getRevenueComparison(
  model: any,
  filter: Record<string, any>,
  totalField: string = 'total',
  dateField: string = 'createdAt'
) {
  await connectDB()

  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = currentMonthStart

  const [currentResult] = await model.aggregate([
    { $match: { ...filter, [dateField]: { $gte: currentMonthStart, $lt: currentMonthEnd } } },
    { $group: { _id: null, total: { $sum: `$${totalField}` } } },
  ])

  const [prevResult] = await model.aggregate([
    { $match: { ...filter, [dateField]: { $gte: prevMonthStart, $lt: prevMonthEnd } } },
    { $group: { _id: null, total: { $sum: `$${totalField}` } } },
  ])

  const currentRevenue = currentResult?.total || 0
  const prevRevenue = prevResult?.total || 0

  let change = 0
  let trend: 'up' | 'down' | 'flat' = 'flat'

  if (prevRevenue === 0) {
    if (currentRevenue > 0) {
      change = 100
      trend = 'up'
    }
  } else {
    const raw = ((currentRevenue - prevRevenue) / prevRevenue) * 100
    change = Math.round(raw * 10) / 10
    trend = change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
  }

  return { currentRevenue, prevRevenue, change, trend }
}
