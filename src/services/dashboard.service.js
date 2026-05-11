import { prisma } from '../prisma/client.js'
import { getDayBounds } from '../utils/dateBounds.js'

export async function getDashboardStats() {
  const { start, end } = getDayBounds(new Date())

  const whereToday = { collectedAt: { gte: start, lte: end } }

  const [totalFarmers, todayCount, totalMilkToday, morning, evening] = await Promise.all([
    prisma.farmer.count(),
    prisma.milkCollection.count({ where: whereToday }),
    prisma.milkCollection.aggregate({
      where: whereToday,
      _sum: { weight: true },
    }),
    prisma.milkCollection.aggregate({
      where: { ...whereToday, session: 'Morning' },
      _sum: { weight: true },
    }),
    prisma.milkCollection.aggregate({
      where: { ...whereToday, session: 'Evening' },
      _sum: { weight: true },
    }),
  ])

  return {
    totalFarmers,
    todayCollections: todayCount,
    totalMilkTodayLiters: Number(totalMilkToday._sum.weight || 0),
    morningTodayLiters: Number(morning._sum.weight || 0),
    eveningTodayLiters: Number(evening._sum.weight || 0),
    generatedAt: new Date().toISOString(),
  }
}
