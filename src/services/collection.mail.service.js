import { prisma } from '../prisma/client.js'
import { ApiError } from '../utils/ApiError.js'
import { sendScalePhotoEmail } from './mail.service.js'

export async function shareCollectionPhotoByEmail(collectionId, toEmail) {
  const row = await prisma.milkCollection.findUnique({
    where: { id: collectionId },
    include: {
      farmer: {
        select: {
          id: true,
          name: true,
          farmerCode: true,
          email: true,
        },
      },
    },
  })

  if (!row) throw new ApiError(404, 'Collection not found')
  if (!row.scalePhotoDataUrl) {
    throw new ApiError(400, 'This collection has no scale photo to share')
  }

  const recipient = (toEmail || row.farmer?.email || '').trim()
  if (!recipient) {
    throw new ApiError(400, 'Farmer email is missing — add email on farmer profile first')
  }

  const result = await sendScalePhotoEmail({
    to: recipient,
    farmerName: row.farmer?.name || 'Farmer',
    farmerCode: row.farmer?.farmerCode,
    weight: row.weight != null ? Number(row.weight) : null,
    session: row.session,
    collectedAt: row.collectedAt,
    scalePhotoDataUrl: row.scalePhotoDataUrl,
  })

  return result
}
