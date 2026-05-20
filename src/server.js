import 'dotenv/config'
import app from './app.js'
import { env } from './config/env.js'
import { logger } from './utils/logger.js'
import { prisma } from './prisma/client.js'
import { destroyWhatsAppClient } from './services/whatsapp.service.js'

const server = app.listen(env.port, () => {
  logger.info(`API listening on http://localhost:${env.port}`)
})

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down…`)
  server.close(() => logger.info('HTTP server closed'))
  await destroyWhatsAppClient()
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
