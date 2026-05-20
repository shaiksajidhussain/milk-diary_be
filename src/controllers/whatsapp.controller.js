import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import * as whatsappService from '../services/whatsapp.service.js'

export const status = asyncHandler(async (_req, res) => {
  return sendSuccess(res, { data: whatsappService.getWhatsAppStatus() })
})

export const start = asyncHandler(async (_req, res) => {
  const data = await whatsappService.startWhatsAppClient()
  return sendSuccess(res, {
    data,
    message:
      data.status === 'ready'
        ? 'WhatsApp is connected'
        : 'Scan the QR code shown in status (qrDataUrl)',
  })
})

export const sendScalePhoto = asyncHandler(async (req, res) => {
  const result = await whatsappService.sendScalePhotoWhatsApp(req.body)
  return sendSuccess(res, {
    data: result,
    message: 'Scale photo sent on WhatsApp',
  })
})
