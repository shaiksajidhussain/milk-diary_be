import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import routes from './routes/index.js'
import { notFoundHandler } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'
import { env } from './config/env.js'
import { logger } from './utils/logger.js'

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'https://milk-diary-fe.vercel.app',
  'https://kovamall.vercel.app',
  'http://kovamall.vercel.app',
  /\.vercel\.app$/,
  ...(process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(',').map((s) => s.trim()) : []),
]

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (allowedOrigins.some((rule) => (rule instanceof RegExp ? rule.test(origin) : rule === origin))) {
        return cb(null, true)
      }
      cb(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(
  morgan(env.nodeEnv === 'production' ? 'combined' : 'dev', {
    stream: {
      write: (msg) => logger.info(msg.trim()),
    },
  }),
)

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'milk-diary-api', env: env.nodeEnv })
})

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'milk-diary-api',
    docs: 'Use /api/* routes (e.g. POST /api/auth/login). Health: GET /health',
  })
})

app.get('/favicon.ico', (_req, res) => {
  res.status(204).end()
})

app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
