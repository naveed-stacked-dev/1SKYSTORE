const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { User, Admin } = require('../models');

/**
 * Authenticate user via JWT Bearer token
 * Attaches req.user or req.admin
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type === 'admin') {
      const admin = await Admin.findByPk(decoded.id);
      if (!admin) throw ApiError.unauthorized('Admin not found');
      req.admin = admin;
      req.userType = 'admin';
    } else {
      const user = await User.findByPk(decoded.id);
      if (!user) throw ApiError.unauthorized('User not found');
      req.user = user;
      req.userType = 'user';
    }

    req.tokenPayload = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};

/**
 * Authenticate specifically as user
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'user') {
      throw ApiError.forbidden('User access only');
    }

    const user = await User.findByPk(decoded.id);
    if (!user) throw ApiError.unauthorized('User not found');

    req.user = user;
    req.userType = 'user';
    req.tokenPayload = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};

/**
 * Authenticate specifically as admin
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'admin') {
      throw ApiError.forbidden('Admin access only');
    }

    const admin = await Admin.findByPk(decoded.id);
    if (!admin) throw ApiError.unauthorized('Admin not found');

    req.admin = admin;
    req.userType = 'admin';
    req.tokenPayload = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};

module.exports = { authenticate, authenticateUser, authenticateAdmin };
