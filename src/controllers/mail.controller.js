import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import * as mailShareService from '../services/mail.share.service.js'

export const shareScalePhoto = asyncHandler(async (req, res) => {
  const result = await mailShareService.shareScalePhotoDirect(req.body)
  return sendSuccess(res, {
    data: result,
    message: `Screenshot sent to ${result.to}`,
  })
})
