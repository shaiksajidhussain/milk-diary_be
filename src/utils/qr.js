/**
 * QR payload string (image generation stays on the client).
 * @param {string} farmerCode e.g. FR-1001
 */
export function buildQrPayload(farmerCode) {
  const numeric = farmerCode.replace(/\D/g, '') || '0'
  return `FARMER-${numeric}`
}
