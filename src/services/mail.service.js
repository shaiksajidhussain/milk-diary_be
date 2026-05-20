import nodemailer from 'nodemailer'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import {
  formatCollectionDate,
  formatCollectionTime,
  formatCollectionLiters,
} from '../utils/collectionFormat.js'

function parseDataUrl(dataUrl) {
  if (!dataUrl) return null
  const m = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(dataUrl)
  if (!m) return null
  return {
    contentType: m[1],
    buffer: Buffer.from(m[2], 'base64'),
    ext: m[1].includes('png') ? 'png' : 'jpg',
  }
}

function getTransporter() {
  if (!env.smtpPass) {
    throw new ApiError(503, 'SMTP_PASS is not configured on server (Gmail app password required)')
  }
  const port = env.smtpPort
  const useTls = port === 587
  return nodemailer.createTransport({
    host: env.smtpHost,
    port,
    secure: port === 465 || env.smtpSecure,
    requireTLS: useTls,
    auth: {
      user: env.smtpUser.trim(),
      pass: env.smtpPass,
    },
  })
}

function buildCollectionEmailHtml({
  farmerName,
  farmerCode,
  weight,
  session,
  collectedAt,
  hasPhoto,
}) {
  const liters = formatCollectionLiters(weight)
  const dateStr = formatCollectionDate(collectedAt)
  const timeStr = formatCollectionTime(collectedAt)
  const intro = hasPhoto
    ? 'Please find the weighing machine photo for the milk collection below.'
    : 'Milk collection details are below (no scale photo was saved for this entry).'

  return `
    <p>Hello,</p>
    <p>${intro}</p>
    <ul>
      <li><strong>Farmer:</strong> ${farmerName}</li>
      <li><strong>Code:</strong> ${farmerCode || '—'}</li>
      <li><strong>Liters:</strong> ${liters}</li>
      <li><strong>Session:</strong> ${session || '—'}</li>
      <li><strong>Date:</strong> ${dateStr}</li>
      <li><strong>Time:</strong> ${timeStr}</li>
    </ul>
    <p>— ${env.mailFromName}</p>
  `
}

export async function sendScalePhotoEmail({
  to,
  farmerName,
  farmerCode,
  weight,
  session,
  collectedAt,
  scalePhotoDataUrl,
}) {
  const parsed = parseDataUrl(scalePhotoDataUrl)
  const hasPhoto = Boolean(parsed)

  const transporter = getTransporter()
  const subject = `Milk collection — ${farmerName} (${farmerCode || 'farmer'})`
  const html = buildCollectionEmailHtml({
    farmerName,
    farmerCode,
    weight,
    session,
    collectedAt,
    hasPhoto,
  })

  const mailOptions = {
    from: `"${env.mailFromName}" <${env.mailFrom}>`,
    to,
    subject,
    html,
  }

  if (parsed) {
    mailOptions.attachments = [
      {
        filename: `scale-${farmerCode || 'photo'}.${parsed.ext}`,
        content: parsed.buffer,
        contentType: parsed.contentType,
      },
    ]
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (err) {
    const msg = String(err?.message || err)
    if (/535|BadCredentials|Username and Password not accepted/i.test(msg)) {
      throw new ApiError(
        502,
        'Gmail rejected login. Use an App Password (16 chars) for kovamall001@gmail.com with 2-Step Verification on — not your normal Gmail password.',
      )
    }
    throw new ApiError(502, `Email send failed: ${msg.slice(0, 200)}`)
  }

  return { to, from: env.mailFrom, hasPhoto }
}
