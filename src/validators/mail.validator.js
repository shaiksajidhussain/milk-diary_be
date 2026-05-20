import { body } from 'express-validator'

export const shareScalePhotoRules = [
  body('scalePhotoDataUrl')
    .isString()
    .isLength({ max: 500000 })
    .matches(/^data:image\/(jpeg|jpg|png|webp);base64,/i)
    .withMessage('scalePhotoDataUrl must be a base64 data:image URL'),
  body('toEmail')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .normalizeEmail(),
  body('farmerId').optional({ checkFalsy: true }).isUUID(),
  body('farmerName').optional().isString().isLength({ max: 120 }),
  body('farmerCode').optional().isString().isLength({ max: 32 }),
  body('weight').optional().isFloat({ min: 0, max: 99999 }),
  body('session').optional().isIn(['Morning', 'Evening']),
]
