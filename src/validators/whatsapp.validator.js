import { body } from 'express-validator'

export const sendScalePhotoWhatsAppRules = [
  body('mobile').trim().notEmpty().withMessage('Farmer mobile is required'),
  body('scalePhotoDataUrl')
    .isString()
    .isLength({ max: 500000 })
    .matches(/^data:image\/(jpeg|jpg|png|webp);base64,/i),
  body('farmerName').optional().isString().isLength({ max: 120 }),
  body('farmerCode').optional().isString().isLength({ max: 32 }),
  body('weight').optional().isFloat({ min: 0, max: 99999 }),
  body('session').optional().isIn(['Morning', 'Evening']),
  body('collectedAt').optional().isISO8601().withMessage('collectedAt must be ISO-8601 datetime'),
]
