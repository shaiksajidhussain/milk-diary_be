export function sendSuccess(res, { data = null, message = 'Success', meta = null, status = 200 }) {
  const body = {
    success: true,
    message,
    data,
  }
  if (meta != null) body.meta = meta
  return res.status(status).json(body)
}

export function sendCreated(res, data, message = 'Created') {
  return sendSuccess(res, { data, message, status: 201 })
}
