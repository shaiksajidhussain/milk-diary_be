import { prisma } from '../prisma/client.js'
import { ApiError } from '../utils/ApiError.js'
import { sendScalePhotoEmail } from './mail.service.js'

export async function shareScalePhotoDirect({
  toEmail,
  farmerId,
  scalePhotoDataUrl,
  farmerName,
  farmerCode,
  weight,
  session,
  collectedAt,
}) {
  let recipient = toEmail?.trim() || ''
  let name = farmerName || 'Farmer'
  let code = farmerCode || ''

  if (farmerId) {
    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      select: { email: true, name: true, farmerCode: true },
    })
    if (!farmer) throw new ApiError(404, 'Farmer not found')
    if (!recipient) recipient = farmer.email?.trim() || ''
    name = farmer.name
    code = farmer.farmerCode
  }

  if (!recipient) {
    throw new ApiError(400, 'Farmer email is required — add it on the farmer profile or enter below')
  }

  return sendScalePhotoEmail({
    to: recipient,
    farmerName: name,
    farmerCode: code,
    weight: weight ?? null,
    session: session || null,
    collectedAt: collectedAt || new Date().toISOString(),
    scalePhotoDataUrl,
  })
}
