import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { shareScalePhotoRules } from '../validators/mail.validator.js'
import * as mailController from '../controllers/mail.controller.js'

const router = Router()

router.use(authenticate)
router.post('/share-scale-photo', shareScalePhotoRules, validateRequest, mailController.shareScalePhoto)

export default router
