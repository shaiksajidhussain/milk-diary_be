import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess, sendCreated } from '../utils/response.js'
import * as farmerService from '../services/farmer.service.js'

export const create = asyncHandler(async (req, res) => {
  const farmer = await farmerService.createFarmer(req.body)
  return sendCreated(res, farmer, 'Farmer created')
})

export const list = asyncHandler(async (req, res) => {
  const result = await farmerService.listFarmers(req.query)
  return sendSuccess(res, { data: result.items, meta: result.meta })
})

export const getById = asyncHandler(async (req, res) => {
  const farmer = await farmerService.getFarmerById(req.params.id)
  return sendSuccess(res, { data: farmer })
})

export const update = asyncHandler(async (req, res) => {
  const farmer = await farmerService.updateFarmer(req.params.id, req.body)
  return sendSuccess(res, { data: farmer, message: 'Farmer updated' })
})

export const remove = asyncHandler(async (req, res) => {
  const result = await farmerService.deleteFarmer(req.params.id)
  return sendSuccess(res, { data: result, message: 'Farmer deleted' })
})
