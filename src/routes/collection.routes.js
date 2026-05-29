import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validateRequest.js'
import {
  createCollectionRules,
  collectionIdParam,
  listCollectionsQuery,
  dailySummaryQuery,
  monthlySummaryQuery,
  farmerHistoryParam,
  farmerHistoryQuery,
  sharePhotoEmailRules,
  // sharePhotoWhatsAppRules,
} from '../validators/collection.validator.js'
import * as collectionController from '../controllers/collection.controller.js'

const router = Router()

router.use(authenticate)

router.get('/summary/daily', dailySummaryQuery, validateRequest, collectionController.daily)
router.get('/summary/monthly', monthlySummaryQuery, validateRequest, collectionController.monthly)
router.get(
  '/farmer/:farmerId',
  farmerHistoryParam,
  farmerHistoryQuery,
  validateRequest,
  collectionController.farmerHistory,
)

router.post('/', createCollectionRules, validateRequest, collectionController.create)
router.get('/', listCollectionsQuery, validateRequest, collectionController.list)
router.post(
  '/:id/share-photo-email',
  sharePhotoEmailRules,
  validateRequest,
  collectionController.sharePhotoEmail,
)
// WhatsApp share disabled
// router.post(
//   '/:id/share-photo-whatsapp',
//   sharePhotoWhatsAppRules,
//   validateRequest,
//   collectionController.sharePhotoWhatsApp,
// )
router.get('/:id', collectionIdParam, validateRequest, collectionController.getById)

export default router
