import { Prisma } from '@prisma/client'
import { prisma } from '../prisma/client.js'
import { ApiError } from '../utils/ApiError.js'
import { parsePagination, paginationMeta } from '../utils/pagination.js'
import { deriveSessionFromTime } from '../utils/session.js'
import { getDayBounds, getMonthBounds } from '../utils/dateBounds.js'

function mapCollection(row, { list = false } = {}) {
  if (!row) return row
  const base = {
    id: row.id,
    farmerId: row.farmerId,
    weight: row.weight != null ? Number(row.weight) : null,
    session: row.session,
    collectedAt: row.collectedAt,
    createdAt: row.createdAt,
  }
  if (list) {
    base.hasScalePhoto = Boolean(row.scalePhotoDataUrl)
  } else {
    base.scalePhotoDataUrl = row.scalePhotoDataUrl ?? null
  }
  if (row.farmer) {
    base.farmer = {
      id: row.farmer.id,
      farmerCode: row.farmer.farmerCode,
      name: row.farmer.name,
      email: row.farmer.email ?? null,
      village: row.farmer.village,
    }
  }
  return base
}

export async function createCollection({
  farmerId,
  weight,
  session,
  collectedAt,
  scalePhotoDataUrl,
}) {
  const farmer = await prisma.farmer.findUnique({ where: { id: farmerId } })
  if (!farmer) throw new ApiError(404, 'Farmer not found')

  const at = collectedAt ? new Date(collectedAt) : new Date()
  const resolvedSession =
    session === 'Morning' || session === 'Evening' ? session : deriveSessionFromTime(at)

  const created = await prisma.milkCollection.create({
    data: {
      farmerId,
      weight: new Prisma.Decimal(weight),
      session: resolvedSession,
      collectedAt: at,
      ...(scalePhotoDataUrl ? { scalePhotoDataUrl } : {}),
    },
    include: {
      farmer: { select: { id: true, farmerCode: true, name: true, village: true } },
    },
  })
  return mapCollection(created, { list: false })
}

export async function listCollections(query) {
  const { page, limit, skip } = parsePagination(query)
  const parts = []
  if (query.farmerId) parts.push({ farmerId: query.farmerId })
  if (query.session) parts.push({ session: query.session })
  if (query.from || query.to) {
    parts.push({
      collectedAt: {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      },
    })
  }
  const where = parts.length ? { AND: parts } : {}

  const [total, rows] = await Promise.all([
    prisma.milkCollection.count({ where }),
    prisma.milkCollection.findMany({
      where,
      include: {
        farmer: {
          select: { id: true, farmerCode: true, name: true, email: true, village: true },
        },
      },
      orderBy: { collectedAt: 'desc' },
      skip,
      take: limit,
    }),
  ])

  return {
    items: rows.map((r) => mapCollection(r, { list: true })),
    meta: paginationMeta({ page, limit, total }),
  }
}

export async function getCollectionById(id) {
  const row = await prisma.milkCollection.findUnique({
    where: { id },
    include: {
      farmer: {
        select: { id: true, farmerCode: true, name: true, mobile: true, email: true, village: true },
      },
    },
  })
  if (!row) throw new ApiError(404, 'Collection not found')
  return mapCollection(row, { list: false })
}

export async function dailySummary(dateStr) {
  const day = dateStr ? new Date(`${dateStr}T12:00:00`) : new Date()
  const { start, end } = getDayBounds(day)

  const [rows, morningAgg, eveningAgg, totalAgg] = await Promise.all([
    prisma.milkCollection.findMany({
      where: { collectedAt: { gte: start, lte: end } },
      include: {
        farmer: { select: { id: true, farmerCode: true, name: true } },
      },
      orderBy: { collectedAt: 'desc' },
    }),
    prisma.milkCollection.aggregate({
      where: { collectedAt: { gte: start, lte: end }, session: 'Morning' },
      _sum: { weight: true },
      _count: true,
    }),
    prisma.milkCollection.aggregate({
      where: { collectedAt: { gte: start, lte: end }, session: 'Evening' },
      _sum: { weight: true },
      _count: true,
    }),
    prisma.milkCollection.aggregate({
      where: { collectedAt: { gte: start, lte: end } },
      _sum: { weight: true },
      _count: true,
    }),
  ])

  return {
    date: start.toISOString().slice(0, 10),
    totalCollections: totalAgg._count,
    totalMilkLiters: Number(totalAgg._sum.weight || 0),
    morning: {
      count: morningAgg._count,
      liters: Number(morningAgg._sum.weight || 0),
    },
    evening: {
      count: eveningAgg._count,
      liters: Number(eveningAgg._sum.weight || 0),
    },
    items: rows.map((r) => mapCollection(r, { list: true })),
  }
}

export async function monthlySummary(year, month, query) {
  const { page, limit, skip } = parsePagination(query)
  const { start, end } = getMonthBounds(year, month)

  const where = { collectedAt: { gte: start, lte: end } }

  const [total, rows, morningAgg, eveningAgg, totalAgg] = await Promise.all([
    prisma.milkCollection.count({ where }),
    prisma.milkCollection.findMany({
      where,
      include: {
        farmer: { select: { id: true, farmerCode: true, name: true } },
      },
      orderBy: { collectedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.milkCollection.aggregate({
      where: { ...where, session: 'Morning' },
      _sum: { weight: true },
      _count: true,
    }),
    prisma.milkCollection.aggregate({
      where: { ...where, session: 'Evening' },
      _sum: { weight: true },
      _count: true,
    }),
    prisma.milkCollection.aggregate({
      where,
      _sum: { weight: true },
      _count: true,
    }),
  ])

  return {
    year,
    month,
    period: { start, end },
    summary: {
      totalCollections: totalAgg._count,
      totalMilkLiters: Number(totalAgg._sum.weight || 0),
      morningLiters: Number(morningAgg._sum.weight || 0),
      eveningLiters: Number(eveningAgg._sum.weight || 0),
    },
    items: rows.map((r) => mapCollection(r, { list: true })),
    meta: paginationMeta({ page, limit, total }),
  }
}

export async function farmerHistory(farmerId, query) {
  await prisma.farmer.findUnique({ where: { id: farmerId } }).then((f) => {
    if (!f) throw new ApiError(404, 'Farmer not found')
  })

  const { page, limit, skip } = parsePagination(query)
  const where = { farmerId }

  const [total, rows] = await Promise.all([
    prisma.milkCollection.count({ where }),
    prisma.milkCollection.findMany({
      where,
      orderBy: { collectedAt: 'desc' },
      skip,
      take: limit,
    }),
  ])

  return {
    farmerId,
    items: rows.map((r) => mapCollection(r, { list: true })),
    meta: paginationMeta({ page, limit, total }),
  }
}
