const LOCALE = 'en-IN'

export function formatCollectionDate(collectedAt) {
  if (!collectedAt) return '—'
  const date = new Date(collectedAt)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(LOCALE, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatCollectionTime(collectedAt) {
  if (!collectedAt) return '—'
  const date = new Date(collectedAt)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatCollectionLiters(weight) {
  return weight != null ? `${Number(weight).toFixed(2)} L` : '—'
}

/** Plain-text / WhatsApp lines for collection share */
export function buildCollectionShareLines({
  brandName,
  farmerName,
  farmerCode,
  weight,
  session,
  collectedAt,
  hasPhoto = true,
}) {
  return [
    `*${brandName}* — milk collection`,
    `Farmer: ${farmerName || '—'}`,
    farmerCode ? `Code: ${farmerCode}` : null,
    `Liters: ${formatCollectionLiters(weight)}`,
    session ? `Session: ${session}` : null,
    `Date: ${formatCollectionDate(collectedAt)}`,
    `Time: ${formatCollectionTime(collectedAt)}`,
    hasPhoto ? null : '_No scale photo on this record — details only._',
  ].filter(Boolean)
}
