/**
 * Vercel serverless entry — must default-export the Express app.
 * @see https://vercel.com/docs/functions/runtimes/node-js
 */
import 'dotenv/config'
import app from './app.js'

export default app
