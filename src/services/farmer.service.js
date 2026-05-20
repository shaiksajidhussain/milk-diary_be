import { Prisma } from '@prisma/client'
import { prisma } from '../prisma/client.js'
import { ApiError } from '../utils/ApiError.js'
import { parsePagination, paginationMeta } from '../utils/pagination.js'
import { buildQrPayload } from '../utils/qr.js'

async function nextFarmerNumber(tx = prisma) {
  const rows = await tx.farmer.findMany({ select: { farmerCode: true } })
  let max = 1000
  for (const row of rows) {
    const m = /^FR-(\d+)$/i.exec(row.farmerCode)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return max + 1
}

function mapFarmer(f) {
  if (!f) return f
  return {
    id: f.id,
    farmerCode: f.farmerCode,
    name: f.name,
    mobile: f.mobile,
    email: f.email ?? null,
    village: f.village,
    qrCode: f.qrCode,
    status: f.status,
    createdAt: f.createdAt,
  }
}

export async function createFarmer({ name, mobile, email, village, status = 'active' }) {
  const farmer = await prisma.$transaction(async (tx) => {
    const n = await nextFarmerNumber(tx)
    const farmerCode = `FR-${n}`
    const qrCode = buildQrPayload(farmerCode)
    return tx.farmer.create({
      data: {
        farmerCode,
        qrCode,
        name,
        mobile,
        email: email?.trim() || null,
        village,
        status,
      },
    })
  })
  return mapFarmer(farmer)
}

export async function listFarmers(query) {
  const { page, limit, skip } = parsePagination(query)
  const q = query.q?.trim()
  const village = query.village?.trim()
  const status = query.status

  const parts = []
  if (q) {
    parts.push({
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { farmerCode: { contains: q, mode: 'insensitive' } },
        { mobile: { contains: q } },
        { email: { contains: q, mode: 'insensitive' } },
        { village: { contains: q, mode: 'insensitive' } },
        { qrCode: { contains: q, mode: 'insensitive' } },
      ],
    })
  }
  if (village) parts.push({ village: { equals: village, mode: 'insensitive' } })
  if (status) parts.push({ status })
  const where = parts.length ? { AND: parts } : {}

  const [total, rows] = await Promise.all([
    prisma.farmer.count({ where }),
    prisma.farmer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ])

  return {
    items: rows.map(mapFarmer),
    meta: paginationMeta({ page, limit, total }),
  }
}

export async function getFarmerById(id) {
  const farmer = await prisma.farmer.findUnique({ where: { id } })
  if (!farmer) throw new ApiError(404, 'Farmer not found')
  return mapFarmer(farmer)
}

export async function updateFarmer(id, payload) {
  await getFarmerById(id)
  const hasField = ['name', 'mobile', 'email', 'village', 'status'].some((k) => payload[k] !== undefined)
  if (!hasField) {
    throw new ApiError(400, 'No updatable fields provided')
  }
  try {
    const updated = await prisma.farmer.update({
      where: { id },
      data: {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.mobile !== undefined ? { mobile: payload.mobile } : {}),
        ...(payload.email !== undefined
          ? { email: payload.email?.trim() ? payload.email.trim() : null }
          : {}),
        ...(payload.village !== undefined ? { village: payload.village } : {}),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
      },
    })
    return mapFarmer(updated)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new ApiError(404, 'Farmer not found')
    }
    throw e
  }
}

export async function deleteFarmer(id) {
  await getFarmerById(id)
  await prisma.farmer.delete({ where: { id } })
  return { id, deleted: true }
}
