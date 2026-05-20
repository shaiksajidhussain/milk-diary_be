import { prisma } from '../prisma/client.js'
import { ApiError } from '../utils/ApiError.js'
import { sendScalePhotoWhatsApp } from './whatsapp.service.js'

export async function shareCollectionPhotoByWhatsApp(collectionId, toMobile) {
  const row = await prisma.milkCollection.findUnique({
    where: { id: collectionId },
    include: {
      farmer: {
        select: {
          id: true,
          name: true,
          farmerCode: true,
          mobile: true,
        },
      },
    },
  })

  if (!row) throw new ApiError(404, 'Collection not found')

  const mobile = (toMobile || row.farmer?.mobile || '').trim()
  if (!mobile) {
    throw new ApiError(400, 'Farmer mobile is missing — add mobile on farmer profile')
  }

  const result = await sendScalePhotoWhatsApp({
    mobile,
    scalePhotoDataUrl: row.scalePhotoDataUrl ?? null,
    farmerName: row.farmer?.name || 'Farmer',
    farmerCode: row.farmer?.farmerCode,
    weight: row.weight != null ? Number(row.weight) : null,
    session: row.session,
    collectedAt: row.collectedAt,
  })

  return { ...result, mobile, hasPhoto: Boolean(row.scalePhotoDataUrl) }
}
