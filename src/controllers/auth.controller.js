import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import * as authService from '../services/auth.service.js'

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginAdmin(req.body)
  return sendSuccess(res, { data: result, message: 'Login successful' })
})
