import { body, param, query } from 'express-validator'

export const createCollectionRules = [
  body('farmerId').isUUID().withMessage('Valid farmerId is required'),
  body('weight')
    .isFloat({ gt: 0, max: 99999 })
    .withMessage('Weight must be a positive number up to 99999'),
  body('session')
    .optional()
    .isIn(['Morning', 'Evening'])
    .withMessage('Session must be Morning or Evening'),
  body('collectedAt').optional().isISO8601().withMessage('collectedAt must be ISO-8601 datetime'),
]

export const collectionIdParam = [param('id').isUUID().withMessage('Invalid collection id')]

export const listCollectionsQuery = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('farmerId').optional().isUUID(),
  query('session').optional().isIn(['Morning', 'Evening']),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
]

export const dailySummaryQuery = [
  query('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('date must be YYYY-MM-DD'),
]

export const monthlySummaryQuery = [
  query('year').isInt({ min: 2000, max: 2100 }).toInt().withMessage('year is required'),
  query('month').isInt({ min: 1, max: 12 }).toInt().withMessage('month is required'),
]

export const farmerHistoryParam = [param('farmerId').isUUID().withMessage('Invalid farmer id')]

export const farmerHistoryQuery = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
]
