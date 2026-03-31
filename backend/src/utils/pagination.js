/**
 * Build Sequelize pagination options from query params
 * @param {object} query - Express req.query
 * @returns {{ limit, offset, page, pageSize }}
 */
function getPagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(query.pageSize, 10) || 20, 1), 100);
  const offset = (page - 1) * pageSize;

  return { limit: pageSize, offset, page, pageSize };
}

/**
 * Format paginated response metadata
 */
function getPaginationMeta(count, page, pageSize) {
  return {
    totalItems: count,
    totalPages: Math.ceil(count / pageSize),
    currentPage: page,
    pageSize,
  };
}

module.exports = { getPagination, getPaginationMeta };
