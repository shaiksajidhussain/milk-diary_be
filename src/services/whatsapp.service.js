import path from 'path'
import { fileURLToPath } from 'url'
import QRCode from 'qrcode'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import { resolveChromeExecutable } from '../utils/chromePath.js'
import { buildCollectionShareLines } from '../utils/collectionFormat.js'
import { toWhatsAppChatId } from '../utils/phone.js'
import { logger } from '../utils/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const AUTH_PATH = path.join(__dirname, '../../.wwebjs_auth')

let client = null
let status = 'idle' // idle | starting | qr | ready | disconnected | error
let lastQrRaw = null
let lastQrDataUrl = null
let lastError = null
let initPromise = null
let wwebModule = null
let clientGeneration = 0

/** Prevent duplicate Puppeteer sessions crashing the process after LOGOUT */
function installWhatsAppProcessGuards() {
  if (installWhatsAppProcessGuards.done) return
  installWhatsAppProcessGuards.done = true

  process.on('unhandledRejection', (reason) => {
    const msg = String(reason?.message || reason || '')
    const stack = String(reason?.stack || '')
    const isWa =
      /Execution context was destroyed|whatsapp-web\.js|puppeteer/i.test(msg) ||
      /whatsapp-web\.js|puppeteer-core/i.test(stack)
    if (!isWa) return

    logger.error('WhatsApp background error (process kept alive)', msg)
    if (status === 'ready' || status === 'starting' || status === 'qr') {
      status = 'error'
      lastError =
        msg.includes('Execution context was destroyed')
          ? 'WhatsApp session ended unexpectedly — click Connect again (if LOGOUT, remove linked device and re-scan QR)'
          : msg.slice(0, 240)
    }
    initPromise = null
    client = null
  })
}

installWhatsAppProcessGuards()

/** whatsapp-web.js ESM: LocalAuth/MessageMedia live on default, not named exports */
async function loadWhatsAppWeb() {
  if (!wwebModule) {
    const mod = await import('whatsapp-web.js')
    wwebModule = mod.default ?? mod
  }
  return wwebModule
}

function parseDataUrl(dataUrl) {
  const m = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(dataUrl)
  if (!m) return null
  return {
    mimeType: m[1],
    base64: m[2],
    ext: m[1].includes('png') ? 'png' : 'jpg',
  }
}

async function teardownClient(waClient) {
  if (!waClient) return
  try {
    waClient.removeAllListeners()
    await waClient.destroy()
  } catch (err) {
    logger.warn('WhatsApp client teardown', err?.message || err)
  }
}

function bindClientEvents(waClient, gen) {
  waClient.on('qr', async (qr) => {
    if (gen !== clientGeneration || client !== waClient) return
    status = 'qr'
    try {
      await buildQrDataUrl(qr)
      logger.info('WhatsApp: scan QR (GET /api/whatsapp/status for image)')
    } catch (err) {
      logger.error('WhatsApp QR render failed', err?.message)
    }
  })

  waClient.on('ready', () => {
    if (gen !== clientGeneration || client !== waClient) return
    status = 'ready'
    lastQrRaw = null
    lastQrDataUrl = null
    lastError = null
    logger.info('WhatsApp client ready')
  })

  waClient.on('authenticated', () => {
    if (gen !== clientGeneration || client !== waClient) return
    logger.info('WhatsApp authenticated')
  })

  waClient.on('auth_failure', (msg) => {
    if (gen !== clientGeneration || client !== waClient) return
    status = 'error'
    lastError = String(msg || 'Authentication failed')
    logger.error('WhatsApp auth_failure', lastError)
  })

  waClient.on('disconnected', async (reason) => {
    if (gen !== clientGeneration) return
    const reasonStr = String(reason || 'Disconnected')
    logger.info('WhatsApp disconnected', reasonStr)
    if (client === waClient) {
      await teardownClient(waClient)
      client = null
    }
    status = 'disconnected'
    lastError =
      reasonStr === 'LOGOUT'
        ? 'Logged out on phone or another session took over — connect again and scan a new QR'
        : reasonStr
    initPromise = null
  })
}

export function getWhatsAppStatus() {
  return {
    enabled: env.whatsappEnabled,
    status,
    qrDataUrl: status === 'qr' ? lastQrDataUrl : null,
    error: lastError,
  }
}

async function buildQrDataUrl(qrRaw) {
  lastQrRaw = qrRaw
  lastQrDataUrl = await QRCode.toDataURL(qrRaw, { margin: 1, width: 280 })
  return lastQrDataUrl
}

export async function startWhatsAppClient({ force = false } = {}) {
  if (!env.whatsappEnabled) {
    throw new ApiError(503, 'WhatsApp is disabled. Set WHATSAPP_ENABLED=true in Backend/.env')
  }

  if (!force && status === 'ready' && client) {
    return getWhatsAppStatus()
  }

  if (!force && (status === 'starting' || status === 'qr')) {
    if (initPromise) await initPromise.catch(() => {})
    return getWhatsAppStatus()
  }

  if (initPromise) {
    await initPromise.catch(() => {})
    if (!force && status === 'ready' && client) {
      return getWhatsAppStatus()
    }
  }

  const gen = ++clientGeneration
  status = 'starting'
  lastError = null

  initPromise = (async () => {
    const { Client, LocalAuth } = await loadWhatsAppWeb()

    if (client) {
      await teardownClient(client)
      client = null
    }

    const chromePath = resolveChromeExecutable(env.chromeExecutablePath)
    if (!chromePath) {
      throw new Error(
        'Chrome not found. Set CHROME_EXECUTABLE_PATH in Backend/.env, install Google Chrome, or run: npx puppeteer browsers install chrome',
      )
    }

    logger.info(`WhatsApp: using Chrome at ${chromePath}`)

    const waClient = new Client({
      authStrategy: new LocalAuth({
        dataPath: AUTH_PATH,
        clientId: 'main',
      }),
      puppeteer: {
        headless: true,
        executablePath: chromePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      },
    })

    bindClientEvents(waClient, gen)
    client = waClient

    try {
      await waClient.initialize()
    } catch (err) {
      if (gen !== clientGeneration) return
      status = 'error'
      lastError = err?.message || 'Failed to start WhatsApp'
      await teardownClient(waClient)
      if (client === waClient) client = null
      throw err
    }
  })()

  try {
    await initPromise
  } catch (err) {
    initPromise = null
    throw new ApiError(502, lastError || err?.message || 'Failed to start WhatsApp')
  }

  return getWhatsAppStatus()
}

async function getReadyClient() {
  if (!env.whatsappEnabled) {
    throw new ApiError(503, 'WhatsApp is disabled. Set WHATSAPP_ENABLED=true in Backend/.env')
  }
  if (status !== 'ready' || !client) {
    throw new ApiError(
      409,
      'WhatsApp not connected. Open Settings → Connect / show QR and scan once (status must be ready).',
    )
  }
  return client
}

export async function sendScalePhotoWhatsApp({
  mobile,
  scalePhotoDataUrl,
  farmerName,
  farmerCode,
  weight,
  session,
  collectedAt,
}) {
  const chatId = toWhatsAppChatId(mobile)
  if (!chatId) {
    throw new ApiError(400, 'Valid farmer mobile number is required for WhatsApp')
  }

  const parsed = parseDataUrl(scalePhotoDataUrl)
  const hasPhoto = Boolean(parsed)

  const wa = await getReadyClient()
  const text = buildCollectionShareLines({
    brandName: env.mailFromName,
    farmerName,
    farmerCode,
    weight,
    session,
    collectedAt,
    hasPhoto,
  }).join('\n')

  try {
    if (hasPhoto) {
      const { MessageMedia } = await loadWhatsAppWeb()
      const media = new MessageMedia(
        parsed.mimeType,
        parsed.base64,
        `scale-${farmerCode || 'photo'}.${parsed.ext}`,
      )
      await wa.sendMessage(chatId, media, { caption: text })
    } else {
      await wa.sendMessage(chatId, text)
    }
  } catch (err) {
    const msg = err?.message || String(err)
    if (/destroyed|not connected|LOGOUT|Session closed/i.test(msg)) {
      status = 'disconnected'
      lastError = 'WhatsApp session lost — reconnect in Settings'
      client = null
      initPromise = null
      throw new ApiError(409, lastError)
    }
    throw new ApiError(502, `WhatsApp send failed: ${msg.slice(0, 200)}`)
  }

  return { chatId, mobile, hasPhoto }
}

export async function destroyWhatsAppClient() {
  clientGeneration += 1
  if (client) {
    await teardownClient(client)
  }
  client = null
  status = 'idle'
  initPromise = null
  lastQrRaw = null
  lastQrDataUrl = null
}
