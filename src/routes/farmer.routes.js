import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validateRequest.js'
import {
  createFarmerRules,
  updateFarmerRules,
  farmerIdParam,
  listFarmersQuery,
} from '../validators/farmer.validator.js'
import * as farmerController from '../controllers/farmer.controller.js'

const router = Router()

router.use(authenticate)

router.get('/', listFarmersQuery, validateRequest, farmerController.list)
router.post('/', createFarmerRules, validateRequest, farmerController.create)
router.get('/:id', farmerIdParam, validateRequest, farmerController.getById)
router.put('/:id', updateFarmerRules, validateRequest, farmerController.update)
router.delete('/:id', farmerIdParam, validateRequest, farmerController.remove)

export default router
