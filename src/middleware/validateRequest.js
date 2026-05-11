import { validationResult } from 'express-validator'
import { ApiError } from '../utils/ApiError.js'

/**
 * Runs after express-validator chains on the route.
 */
export function validateRequest(req, _res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
      value: e.value,
    }))
    throw new ApiError(422, 'Validation failed', details)
  }
  next()
}
