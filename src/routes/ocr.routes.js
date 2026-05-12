import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { readScaleFromImageRules } from '../validators/ocr.validator.js'
import * as ocrController from '../controllers/ocr.controller.js'

const router = Router()

router.use(authenticate)
router.post('/scale-read', readScaleFromImageRules, validateRequest, ocrController.readScaleFromImage)

export default router
