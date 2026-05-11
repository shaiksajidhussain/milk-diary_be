export function parsePagination(query) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1)
  const limitRaw = parseInt(String(query.limit || '10'), 10) || 10
  const limit = Math.min(100, Math.max(1, limitRaw))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export function paginationMeta({ page, limit, total }) {
  const totalPages = Math.ceil(total / limit) || 1
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}
