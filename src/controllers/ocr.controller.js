import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import * as ocrService from '../services/ocr.service.js'

export const readScaleFromImage = asyncHandler(async (req, res) => {
  const result = await ocrService.readScaleFromImage(req.body.scalePhotoDataUrl)
  return sendSuccess(res, {
    data: result,
    message: 'Scale value read successfully',
  })
})
