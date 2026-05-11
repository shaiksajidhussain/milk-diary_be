import { body, param, query, check } from 'express-validator'

const mobileRegex = /^(\+91[\s-]?)?[6-9]\d{9}$/

const atLeastOneUpdate = check().custom((_value, { req }) => {
  const b = req.body || {}
  if (!['name', 'mobile', 'village', 'status'].some((k) => b[k] !== undefined)) {
    throw new Error('Provide at least one of: name, mobile, village, status')
  }
  return true
})

export const createFarmerRules = [
  body('name').trim().notEmpty().isLength({ max: 120 }).withMessage('Name is required'),
  body('mobile')
    .trim()
    .notEmpty()
    .matches(mobileRegex)
    .withMessage('Enter a valid Indian mobile (10 digits, optional +91)'),
  body('village').trim().notEmpty().isLength({ max: 120 }).withMessage('Village is required'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),
]

export const updateFarmerRules = [
  param('id').isUUID().withMessage('Invalid farmer id'),
  atLeastOneUpdate,
  body('name').optional().trim().notEmpty().isLength({ max: 120 }),
  body('mobile').optional().trim().matches(mobileRegex).withMessage('Invalid mobile number'),
  body('village').optional().trim().notEmpty().isLength({ max: 120 }),
  body('status').optional().isIn(['active', 'inactive']),
]

export const farmerIdParam = [param('id').isUUID().withMessage('Invalid farmer id')]

export const listFarmersQuery = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('q').optional().isString().trim().isLength({ max: 100 }),
  query('village').optional().isString().trim().isLength({ max: 120 }),
  query('status').optional().isIn(['active', 'inactive']),
]
