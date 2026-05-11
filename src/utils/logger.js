import { env } from '../config/env.js'

const levels = { debug: 0, info: 1, warn: 2, error: 3 }
const current = env.nodeEnv === 'production' ? 'info' : 'debug'

function log(level, msg, extra) {
  if (levels[level] < levels[current]) return
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${msg}`
  const fn = level === 'error' ? console.error : console.log
  if (extra !== undefined) fn(line, extra)
  else fn(line)
}

export const logger = {
  debug: (msg, extra) => log('debug', msg, extra),
  info: (msg, extra) => log('info', msg, extra),
  warn: (msg, extra) => log('warn', msg, extra),
  error: (msg, extra) => log('error', msg, extra),
}
