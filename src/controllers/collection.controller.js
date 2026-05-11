import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess, sendCreated } from '../utils/response.js'
import * as collectionService from '../services/collection.service.js'

export const create = asyncHandler(async (req, res) => {
  const row = await collectionService.createCollection(req.body)
  return sendCreated(res, row, 'Milk collection recorded')
})

export const list = asyncHandler(async (req, res) => {
  const result = await collectionService.listCollections(req.query)
  return sendSuccess(res, { data: result.items, meta: result.meta })
})

export const getById = asyncHandler(async (req, res) => {
  const row = await collectionService.getCollectionById(req.params.id)
  return sendSuccess(res, { data: row })
})

export const daily = asyncHandler(async (req, res) => {
  const date = req.query.date || undefined
  const data = await collectionService.dailySummary(date)
  return sendSuccess(res, { data })
})

export const monthly = asyncHandler(async (req, res) => {
  const year = Number(req.query.year)
  const month = Number(req.query.month)
  const data = await collectionService.monthlySummary(year, month, req.query)
  return sendSuccess(res, { data })
})

export const farmerHistory = asyncHandler(async (req, res) => {
  const result = await collectionService.farmerHistory(req.params.farmerId, req.query)
  return sendSuccess(res, {
    data: { farmerId: result.farmerId, items: result.items },
    meta: result.meta,
  })
})
