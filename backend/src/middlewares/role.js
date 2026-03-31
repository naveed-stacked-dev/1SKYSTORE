const ApiError = require('../utils/ApiError');

/**
 * Restrict access to specific admin roles
 * @param  {...string} roles - Allowed roles (e.g. 'super_admin', 'manager')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (req.userType !== 'admin') {
      return next(ApiError.forbidden('Admin access required'));
    }
    if (roles.length && !roles.includes(req.admin.role)) {
      return next(ApiError.forbidden(`Role '${req.admin.role}' is not authorized for this action`));
    }
    next();
  };
};

/**
 * Allow only authenticated users (not admins)
 */
const userOnly = (req, res, next) => {
  if (req.userType !== 'user') {
    return next(ApiError.forbidden('User access only'));
  }
  next();
};

/**
 * Allow only authenticated admins
 */
const adminOnly = (req, res, next) => {
  if (req.userType !== 'admin') {
    return next(ApiError.forbidden('Admin access only'));
  }
  next();
};

/**
 * Allow both users and admins (must be authenticated)
 */
const anyAuth = (req, res, next) => {
  if (!req.user && !req.admin) {
    return next(ApiError.unauthorized('Authentication required'));
  }
  next();
};

module.exports = { requireRole, userOnly, adminOnly, anyAuth };
