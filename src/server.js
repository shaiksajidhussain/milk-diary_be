import express from 'express'
import cors from 'cors'

const app = express()

app.use(
cors({
origin: [
'http://localhost:5173',
'https://milk-diary-fe.vercel.app'
],
credentials: true,
})
)

app.use(express.json())

export default app
