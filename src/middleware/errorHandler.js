import { ApiError } from '../utils/ApiError.js'
import { logger } from '../utils/logger.js'
import { env } from '../config/env.js'

// Prisma error codes
const PRISMA_UNIQUE = 'P2002'
const PRISMA_NOT_FOUND = 'P2025'

export function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    })
  }

  if (err.code === PRISMA_UNIQUE) {
    return res.status(409).json({
      success: false,
      message: 'A record with this unique value already exists',
    })
  }

  if (err.code === PRISMA_NOT_FOUND) {
    return res.status(404).json({
      success: false,
      message: 'Record not found',
    })
  }

  logger.error('Unhandled error', { message: err.message, stack: err.stack })

  const status = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500
  const message =
    env.nodeEnv === 'production' && status === 500
      ? 'Internal server error'
      : err.message || 'Internal server error'

  return res.status(status >= 400 && status < 600 ? status : 500).json({
    success: false,
    message,
  })
}
