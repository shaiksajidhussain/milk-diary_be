import { body } from 'express-validator'

export const readScaleFromImageRules = [
  body('scalePhotoDataUrl')
    .isString()
    .isLength({ max: 500000 })
    .matches(/^data:image\/(jpeg|jpg|png|webp);base64,/i)
    .withMessage('scalePhotoDataUrl must be a base64 data:image URL under 500k characters'),
]
