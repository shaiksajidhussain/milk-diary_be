import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { sendScalePhotoWhatsAppRules } from '../validators/whatsapp.validator.js'
import * as whatsappController from '../controllers/whatsapp.controller.js'

const router = Router()

router.use(authenticate)

router.get('/status', whatsappController.status)
router.post('/start', whatsappController.start)
router.post(
  '/send-scale-photo',
  sendScalePhotoWhatsAppRules,
  validateRequest,
  whatsappController.sendScalePhoto,
)

export default router
