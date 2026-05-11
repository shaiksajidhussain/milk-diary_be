import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import * as dashboardService from '../services/dashboard.service.js'

export const stats = asyncHandler(async (_req, res) => {
  const data = await dashboardService.getDashboardStats()
  return sendSuccess(res, { data })
})
