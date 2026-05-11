import { Router } from 'express'
import { loginRules } from '../validators/auth.validator.js'
import { validateRequest } from '../middleware/validateRequest.js'
import * as authController from '../controllers/auth.controller.js'

const router = Router()

router.post('/login', loginRules, validateRequest, authController.login)

export default router
