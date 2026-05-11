/**
 * Morning: before 12:00 (hour < 12). Evening: from 12:00 onward.
 * @param {Date} [date]
 * @returns {'Morning'|'Evening'}
 */
export function deriveSessionFromTime(date = new Date()) {
  const hour = date.getHours()
  return hour < 12 ? 'Morning' : 'Evening'
}
