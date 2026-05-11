import express from 'express'
import cors from 'cors'

const app = express()

app.use(
cors({
origin: [
'http://localhost:5173',
'https://milk-diary-fe.vercel.app',
],
methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization'],
credentials: true,
})
)

app.options('*', cors())

app.use(express.json())

export default app
