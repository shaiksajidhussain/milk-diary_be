/**
 * Local calendar day bounds for the given date (server timezone).
 */
export function getDayBounds(date = new Date()) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

/**
 * @param {number} year
 * @param {number} month 1-12
 */
export function getMonthBounds(year, month) {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0)
  const end = new Date(year, month, 0, 23, 59, 59, 999)
  return { start, end }
}
