/**
 * Indian mobile → WhatsApp chat id (e.g. 919876543210@c.us)
 */
export function toWhatsAppChatId(mobile) {
  const digits = String(mobile || '').replace(/\D/g, '')
  if (digits.length < 10) return null
  const national =
    digits.length === 10 ? `91${digits}` : digits.startsWith('91') ? digits : `91${digits.slice(-10)}`
  return `${national}@c.us`
}
