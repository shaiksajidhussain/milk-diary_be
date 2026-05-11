import { Router } from 'express'
import authRoutes from './auth.routes.js'
import farmerRoutes from './farmer.routes.js'
import collectionRoutes from './collection.routes.js'
import dashboardRoutes from './dashboard.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/farmers', farmerRoutes)
router.use('/collections', collectionRoutes)
router.use('/dashboard', dashboardRoutes)

export default router
